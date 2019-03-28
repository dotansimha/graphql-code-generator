import {
  DirectiveDefinitionNode,
  EnumTypeDefinitionNode,
  EnumValueDefinitionNode,
  FieldDefinitionNode,
  GraphQLSchema,
  InputObjectTypeDefinitionNode,
  InputValueDefinitionNode,
  InterfaceTypeDefinitionNode,
  ListTypeNode,
  NamedTypeNode,
  NameNode,
  NonNullTypeNode,
  ObjectTypeDefinitionNode,
  ScalarTypeDefinitionNode,
  UnionTypeDefinitionNode,
  StringValueNode,
} from 'graphql';
import { BaseVisitor, ParsedConfig, RawConfig } from './base-visitor';
import { parseMapper } from './mappers';
import { DEFAULT_SCALARS } from './scalars';
import { EnumValuesMap, ScalarsMap } from './types';
import { transformComment, buildScalars, DeclarationBlock, DeclarationBlockConfig, indent, wrapWithSingleQuotes } from './utils';
import { OperationVariablesToObject } from './variables-to-object';

export interface ParsedTypesConfig extends ParsedConfig {
  enumValues: EnumValuesMap;
}

export interface RawTypesConfig extends RawConfig {
  /**
   * @name enumValues
   * @type EnumValuesMap
   * @description Overrides the default value of enum values declared in your GraphQL schema.
   * You can also map the entire enum to an external type by providing a string that of `module#type`.
   *
   * @example With Custom Values
   * ```yml
   *   config:
   *     enumValues:
   *       MyEnum:
   *         A: 'foo'
   * ```
   *
   * @example With External Enum
   * ```yml
   *   config:
   *     enumValues:
   *       MyEnum: ./my-file#MyCustomEnum
   * ```
   */
  enumValues?: EnumValuesMap;
}

export class BaseTypesVisitor<TRawConfig extends RawTypesConfig = RawTypesConfig, TPluginConfig extends ParsedTypesConfig = ParsedTypesConfig> extends BaseVisitor<TRawConfig, TPluginConfig> {
  protected _argumentsTransformer: OperationVariablesToObject;

  constructor(protected _schema: GraphQLSchema, rawConfig: TRawConfig, additionalConfig: TPluginConfig, defaultScalars: ScalarsMap = DEFAULT_SCALARS) {
    super(
      rawConfig,
      {
        enumValues: rawConfig.enumValues || {},
        ...additionalConfig,
      },
      buildScalars(_schema, defaultScalars)
    );

    this._argumentsTransformer = new OperationVariablesToObject(this.scalars, this.convertName);
  }

  public get scalarsDefinition(): string {
    const allScalars = Object.keys(this.config.scalars).map(scalarName => {
      const scalarValue = this.config.scalars[scalarName];
      const scalarType = this._schema.getType(scalarName);
      const comment = scalarType && scalarType.astNode && scalarType.description ? transformComment(scalarType.description, 1) : '';

      return comment + indent(`${scalarName}: ${scalarValue},`);
    });

    return new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind('type')
      .withName('Scalars')
      .withComment('All built-in and custom scalars, mapped to their actual values')
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
      .withComment((node.description as any) as string)
      .withBlock(node.fields.join('\n')).string;
  }

  InputValueDefinition(node: InputValueDefinitionNode): string {
    const comment = transformComment((node.description as any) as string, 1);

    return comment + indent(`${node.name}: ${node.type},`);
  }

  Name(node: NameNode): string {
    return node.value;
  }

  FieldDefinition(node: FieldDefinitionNode): string {
    const typeString = (node.type as any) as string;
    const comment = transformComment((node.description as any) as string, 1);

    return comment + indent(`${node.name}: ${typeString},`);
  }

  UnionTypeDefinition(node: UnionTypeDefinitionNode, key: string | number, parent: any): string {
    const originalNode = parent[key] as UnionTypeDefinitionNode;
    const possibleTypes = originalNode.types.map(t => (this.scalars[t.name.value] ? this._getScalar(t.name.value) : this.convertName(t))).join(' | ');

    return new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind('type')
      .withName(this.convertName(node))
      .withComment((node.description as any) as string)
      .withContent(possibleTypes).string;
  }

  ObjectTypeDefinition(node: ObjectTypeDefinitionNode, key: number | string, parent: any): string {
    const originalNode = parent[key] as ObjectTypeDefinitionNode;
    const interfaces = originalNode.interfaces && node.interfaces.length > 0 ? originalNode.interfaces.map(i => this.convertName(i)).join(' & ') + (node.fields.length ? ' & ' : '') : '';

    const typeDefinition = new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind('type')
      .withName(this.convertName(node))
      .withContent(interfaces)
      .withComment((node.description as any) as string)
      .withBlock(node.fields.join('\n')).string;

    const argumentsBlock = this.buildArgumentsBlock(originalNode);

    return [typeDefinition, argumentsBlock].filter(f => f).join('\n\n');
  }

  InterfaceTypeDefinition(node: InterfaceTypeDefinitionNode, key: number | string, parent: any): string {
    const argumentsBlock = this.buildArgumentsBlock(parent[key] as InterfaceTypeDefinitionNode);

    const interfaceDefinition = new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind('type')
      .withName(this.convertName(node))
      .withComment((node.description as any) as string)
      .withBlock(node.fields.join('\n')).string;

    return [interfaceDefinition, argumentsBlock].filter(f => f).join('\n\n');
  }

  ScalarTypeDefinition(node: ScalarTypeDefinitionNode): string {
    // We empty this because we handle scalars in a different way, see constructor.
    return '';
  }

  protected _buildEnumImport(identifier: string, source: string): string {
    return `import { ${identifier} } from '${source}';`;
  }

  public getEnumsImports(): string {
    return Object.keys(this.config.enumValues)
      .map(enumName => {
        const mappedValue = this.config.enumValues[enumName];

        if (mappedValue && typeof mappedValue === 'string') {
          const mapper = parseMapper(mappedValue);

          if (mapper.isExternal) {
            const identifier = mapper.type === enumName ? enumName : `${mapper.type} as ${enumName}`;

            return this._buildEnumImport(identifier, mapper.source);
          }
        }

        return null;
      })
      .filter(a => a)
      .join('\n');
  }

  EnumTypeDefinition(node: EnumTypeDefinitionNode): string {
    const enumName = (node.name as any) as string;

    // In case of mapped external enum string
    if (this.config.enumValues[enumName] && typeof this.config.enumValues[enumName] === 'string') {
      return null;
    }

    return new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind('enum')
      .withName(this.convertName(node))
      .withComment((node.description as any) as string)
      .withBlock(this.buildEnumValuesBlock(enumName, node.values)).string;
  }

  // We are using it in order to transform "description" field
  StringValue(node: StringValueNode): string {
    return node.value;
  }

  protected buildEnumValuesBlock(typeName: string, values: ReadonlyArray<EnumValueDefinitionNode>): string {
    return values
      .map(enumOption => {
        const optionName = this.convertName(enumOption, { useTypesPrefix: false, transformUnderscore: true });
        const comment = transformComment((enumOption.description as any) as string, 1);
        let enumValue: string = (enumOption.name as any) as string;

        if (this.config.enumValues[typeName] && typeof this.config.enumValues[typeName] === 'object' && this.config.enumValues[typeName][enumValue]) {
          enumValue = this.config.enumValues[typeName][enumValue];
        }

        return comment + indent(`${optionName}${this._declarationBlockConfig.enumNameValueSeparator} ${wrapWithSingleQuotes(enumValue)}`);
      })
      .join(',\n');
  }

  DirectiveDefinition(node: DirectiveDefinitionNode): string {
    return '';
  }

  protected buildArgumentsBlock(node: InterfaceTypeDefinitionNode | ObjectTypeDefinitionNode) {
    const fieldsWithArguments = node.fields.filter(field => field.arguments && field.arguments.length > 0) || [];
    return fieldsWithArguments
      .map(field => {
        const name =
          node.name.value +
          this.convertName(field, {
            useTypesPrefix: false,
          }) +
          'Args';

        return new DeclarationBlock(this._declarationBlockConfig)
          .export()
          .asKind('type')
          .withName(this.convertName(name))
          .withComment(node.description)
          .withBlock(this._argumentsTransformer.transform<InputValueDefinitionNode>(field.arguments)).string;
      })
      .join('\n\n');
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
