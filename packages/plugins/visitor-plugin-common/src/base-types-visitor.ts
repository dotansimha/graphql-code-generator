import { BaseVisitor, ParsedConfig, RawConfig } from './base-visitor';
import { EnumValuesMap, ScalarsMap } from './types';
import { OperationVariablesToObject } from './variables-to-object';
import { DeclarationBlockConfig, DeclarationBlock, indent, wrapWithSingleQuotes, buildScalars } from './utils';
import {
  NonNullTypeNode,
  UnionTypeDefinitionNode,
  InterfaceTypeDefinitionNode,
  ScalarTypeDefinitionNode,
  EnumValueDefinitionNode,
  NamedTypeNode
} from 'graphql/language/ast';
import {
  InputObjectTypeDefinitionNode,
  InputValueDefinitionNode,
  NameNode,
  FieldDefinitionNode,
  ObjectTypeDefinitionNode,
  EnumTypeDefinitionNode,
  DirectiveDefinitionNode,
  ListTypeNode,
  GraphQLSchema
} from 'graphql';
import { DEFAULT_SCALARS } from './scalars';

export interface ParsedTypesConfig extends ParsedConfig {
  enumValues: EnumValuesMap;
}

export interface RawTypesConfig extends RawConfig {
  enumValues?: EnumValuesMap;
}

export class BaseTypesVisitor<
  TRawConfig extends RawTypesConfig = RawTypesConfig,
  TPluginConfig extends ParsedTypesConfig = ParsedTypesConfig
> extends BaseVisitor<TRawConfig, TPluginConfig> {
  protected _argumentsTransformer: OperationVariablesToObject;

  constructor(
    protected _schema: GraphQLSchema,
    rawConfig: TRawConfig,
    additionalConfig: TPluginConfig,
    defaultScalars: ScalarsMap = DEFAULT_SCALARS
  ) {
    super(
      rawConfig,
      {
        enumValues: rawConfig.enumValues || {},
        ...additionalConfig
      },
      buildScalars(_schema, defaultScalars)
    );

    this._argumentsTransformer = new OperationVariablesToObject(this.scalars, this.convertName);
  }

  public get scalarsDefinition(): string {
    const allScalars = Object.keys(this.config.scalars).map(scalarName => {
      const scalarValue = this.config.scalars[scalarName];

      return indent(`${scalarName}: ${scalarValue},`);
    });

    return new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind('type')
      .withName('Scalars')
      .withBlock(allScalars.join('\n')).string;
  }

  setDeclarationBlockConfig(config: DeclarationBlockConfig): void {
    this._declarationBlockConfig = config;
  }

  setArgumentsTransformer(argumentsTransfomer: OperationVariablesToObject): void {
    this._argumentsTransformer = argumentsTransfomer;
  }

  NonNullType(node: NonNullTypeNode): string {
    const asString = (node.type as any) as string;

    return asString;
  }

  InputObjectTypeDefinition(node: InputObjectTypeDefinitionNode): string {
    return new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind('type')
      .withName(this.convertName(node))
      .withBlock(node.fields.join('\n')).string;
  }

  InputValueDefinition(node: InputValueDefinitionNode): string {
    return indent(`${node.name}: ${node.type},`);
  }

  Name(node: NameNode): string {
    return node.value;
  }

  FieldDefinition(node: FieldDefinitionNode): string {
    const typeString = (node.type as any) as string;

    return indent(`${node.name}: ${typeString},`);
  }

  UnionTypeDefinition(node: UnionTypeDefinitionNode, key: string | number, parent: any): string {
    const originalNode = parent[key] as UnionTypeDefinitionNode;
    const possibleTypes = originalNode.types.map(t => this.convertName(t)).join(' | ');

    return new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind('type')
      .withName(this.convertName(node))
      .withContent(possibleTypes).string;
  }

  ObjectTypeDefinition(node: ObjectTypeDefinitionNode, key: number | string, parent: any): string {
    const originalNode = parent[key] as ObjectTypeDefinitionNode;
    const interfaces =
      originalNode.interfaces && node.interfaces.length > 0
        ? originalNode.interfaces.map(i => this.convertName(i)).join(' & ') + ' & '
        : '';

    const typeDefinition = new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind('type')
      .withName(this.convertName(node))
      .withContent(interfaces)
      .withBlock(node.fields.join('\n')).string;

    const original = parent[key];
    const fieldsWithArguments = original.fields.filter(field => field.arguments && field.arguments.length > 0);
    const fieldsArguments = fieldsWithArguments.map(field => {
      const name =
        original.name.value +
        this.convertName(field, {
          useTypesPrefix: false
        }) +
        'Args';

      return new DeclarationBlock(this._declarationBlockConfig)
        .export()
        .asKind('type')
        .withName(this.convertName(name))
        .withBlock(this._argumentsTransformer.transform<InputValueDefinitionNode>(field.arguments)).string;
    });

    return [typeDefinition, ...fieldsArguments].filter(f => f).join('\n\n');
  }

  InterfaceTypeDefinition(node: InterfaceTypeDefinitionNode): string {
    return new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind('type')
      .withName(this.convertName(node))
      .withBlock(node.fields.join('\n')).string;
  }

  ScalarTypeDefinition(node: ScalarTypeDefinitionNode): string {
    // We empty this because we handle scalars in a different way, see constructor.
    return '';
  }

  EnumTypeDefinition(node: EnumTypeDefinitionNode): string {
    return new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind('enum')
      .withName(this.convertName(node))
      .withBlock(this.buildEnumValuesBlock(node.values)).string;
  }

  protected buildEnumValuesBlock(values: ReadonlyArray<EnumValueDefinitionNode>): string {
    return values
      .map(enumOption =>
        indent(
          `${this.convertName(enumOption)}${this._declarationBlockConfig.enumNameValueSeparator} ${wrapWithSingleQuotes(
            this.config.enumValues[(enumOption.name as any) as string] || enumOption.name
          )}`
        )
      )
      .join(',\n');
  }

  DirectiveDefinition(node: DirectiveDefinitionNode): string {
    return '';
  }

  protected _getScalar(name: string): string {
    return `Scalars['${name}']`;
  }

  protected _getTypeForNode(node: NamedTypeNode): string {
    const typeAsString = (node.name as any) as string;

    if (this.scalars[typeAsString]) {
      return this._getScalar(typeAsString);
    }

    return this.convertName(node);
  }

  NamedType(node: NamedTypeNode): string {
    return this._getTypeForNode(node);
  }

  ListType(node: ListTypeNode): string {
    const asString = (node.type as any) as string;

    return this.wrapWithListType(asString);
  }

  SchemaDefinition() {
    return null;
  }

  protected wrapWithListType(str: string): string {
    return `Array<${str}>`;
  }
}
