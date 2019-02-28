import { ScalarsMap, EnumValuesMap } from './types';
import { toPascalCase, DeclarationBlock, indent, wrapWithSingleQuotes, DeclarationBlockConfig } from './utils';
import { resolveExternalModuleAndFn } from 'graphql-codegen-plugin-helpers';
import * as autoBind from 'auto-bind';
import {
  NamedTypeNode,
  ListTypeNode,
  NonNullTypeNode,
  DirectiveDefinitionNode,
  NameNode,
  InputObjectTypeDefinitionNode,
  InputValueDefinitionNode,
  EnumTypeDefinitionNode,
  ScalarTypeDefinitionNode
} from 'graphql';
import {
  FieldDefinitionNode,
  UnionTypeDefinitionNode,
  ObjectTypeDefinitionNode,
  InterfaceTypeDefinitionNode,
  EnumValueDefinitionNode
} from 'graphql/language/ast';
import { OperationVariablesToObject } from './variables-to-object';
import { DEFAULT_SCALARS } from './scalars';

export interface ParsedConfig {
  scalars: ScalarsMap;
  enumValues: EnumValuesMap;
  convert: (str: string) => string;
  typesPrefix: string;
}

export interface RawConfig {
  scalars?: ScalarsMap;
  enumValues?: EnumValuesMap;
  namingConvention?: string;
  typesPrefix?: string;
}

export class BaseVisitor<TRawConfig extends RawConfig = RawConfig, TPluginConfig extends ParsedConfig = ParsedConfig> {
  protected _parsedConfig: TPluginConfig;
  protected _argumentsTransformer: OperationVariablesToObject;
  protected _declarationBlockConfig: DeclarationBlockConfig = {};

  constructor(rawConfig: TRawConfig, additionalConfig: TPluginConfig, defaultScalars: ScalarsMap = DEFAULT_SCALARS) {
    this._parsedConfig = {
      scalars: { ...(defaultScalars || DEFAULT_SCALARS), ...(rawConfig.scalars || {}) },
      enumValues: rawConfig.enumValues || {},
      convert: rawConfig.namingConvention ? resolveExternalModuleAndFn(rawConfig.namingConvention) : toPascalCase,
      typesPrefix: rawConfig.typesPrefix || '',
      ...((additionalConfig || {}) as any)
    };

    autoBind(this);
    this._argumentsTransformer = new OperationVariablesToObject(this.scalars, this.convertName);
  }

  setDeclarationBlockConfig(config: DeclarationBlockConfig): void {
    this._declarationBlockConfig = config;
  }

  setArgumentsTransformer(argumentsTransfomer: OperationVariablesToObject): void {
    this._argumentsTransformer = argumentsTransfomer;
  }

  get config(): TPluginConfig {
    return this._parsedConfig;
  }

  get scalars(): ScalarsMap {
    return this.config.scalars;
  }

  convertName(name: any, addPrefix = true): string {
    return (addPrefix ? this.config.typesPrefix : '') + this.config.convert(name);
  }

  DirectiveDefinition(node: DirectiveDefinitionNode): string {
    return '';
  }

  NamedType(node: NamedTypeNode): string {
    const asString = (node.name as any) as string;
    const type = this.scalars[asString] || this.convertName(asString);

    return type;
  }

  ListType(node: ListTypeNode): string {
    const asString = (node.type as any) as string;

    return this.wrapWithListType(asString);
  }

  protected wrapWithListType(str: string): string {
    return `Array<${str}>`;
  }

  NonNullType(node: NonNullTypeNode): string {
    const asString = (node.type as any) as string;

    return asString;
  }

  InputObjectTypeDefinition(node: InputObjectTypeDefinitionNode): string {
    return new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind('type')
      .withName(this.convertName(node.name))
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
    const possibleTypes = originalNode.types.map(t => this.convertName(t.name.value)).join(' | ');

    return new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind('type')
      .withName(this.convertName(node.name))
      .withContent(possibleTypes).string;
  }

  ObjectTypeDefinition(node: ObjectTypeDefinitionNode, key: number | string, parent: any): string {
    const originalNode = parent[key] as ObjectTypeDefinitionNode;
    const interfaces =
      originalNode.interfaces && node.interfaces.length > 0
        ? originalNode.interfaces.map(i => this.convertName(i.name.value)).join(' & ') + ' & '
        : '';

    const typeDefinition = new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind('type')
      .withName(this.convertName(node.name))
      .withContent(interfaces)
      .withBlock(node.fields.join('\n')).string;

    const original = parent[key];
    const fieldsWithArguments = original.fields.filter(field => field.arguments && field.arguments.length > 0);
    const fieldsArguments = fieldsWithArguments.map(field => {
      const name = original.name.value + this.convertName(field.name.value, false) + 'Args';

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
      .withName(this.convertName(node.name))
      .withBlock(node.fields.join('\n')).string;
  }

  ScalarTypeDefinition(node: ScalarTypeDefinitionNode): string {
    return new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind('type')
      .withName(this.convertName(node.name))
      .withContent(this.config.scalars[node.name as any] || 'any').string;
  }

  EnumTypeDefinition(node: EnumTypeDefinitionNode): string {
    return new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind('enum')
      .withName(this.convertName(node.name))
      .withBlock(this.buildEnumValuesBlock(node.values)).string;
  }

  protected buildEnumValuesBlock(values: ReadonlyArray<EnumValueDefinitionNode>): string {
    return values
      .map(enumOption =>
        indent(
          `${this.convertName(enumOption.name)}${
            this._declarationBlockConfig.enumNameValueSeparator
          } ${wrapWithSingleQuotes(this.config.enumValues[(enumOption.name as any) as string] || enumOption.name)}`
        )
      )
      .join(', \n');
  }
}
