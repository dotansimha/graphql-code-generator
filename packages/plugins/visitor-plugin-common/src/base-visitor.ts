import { ScalarsMap, EnumValuesMap } from './types';
import {
  toPascalCase,
  DeclarationBlock,
  indent,
  wrapAstTypeWithModifiers,
  wrapWithSingleQuotes,
  DeclarationBlockConfig
} from './utils';
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
  EnumTypeDefinitionNode
} from 'graphql';
import {
  FieldDefinitionNode,
  UnionTypeDefinitionNode,
  ObjectTypeDefinitionNode,
  InterfaceTypeDefinitionNode
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
  protected _declarationBlockConfig: DeclarationBlockConfig = {};

  constructor(rawConfig: TRawConfig, additionalConfig: TPluginConfig, defaultScalars: ScalarsMap = DEFAULT_SCALARS) {
    this._parsedConfig = {
      scalars: { ...defaultScalars, ...(rawConfig.scalars || {}) },
      enumValues: rawConfig.enumValues || {},
      convert: rawConfig.namingConvention ? resolveExternalModuleAndFn(rawConfig.namingConvention) : toPascalCase,
      typesPrefix: rawConfig.typesPrefix || '',
      ...((additionalConfig || {}) as any)
    };

    autoBind(this);
  }

  setDeclarationBlockConfig(config: DeclarationBlockConfig): void {
    this._declarationBlockConfig = config || {};
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

    return `Array<${asString}>`;
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

  UnionTypeDefinition(node: UnionTypeDefinitionNode): string {
    const possibleTypes = node.types.join(' | ');

    return new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind('type')
      .withName(this.convertName(node.name))
      .withContent(possibleTypes).string;
  }

  ObjectTypeDefinition(
    node: ObjectTypeDefinitionNode,
    key: number | string,
    parent: any,
    _wrapAstTypeWithModifiers = wrapAstTypeWithModifiers('')
  ): string {
    const interfaces =
      node.interfaces && node.interfaces.length > 0
        ? node.interfaces.map(name => (name as any) as string).join(' & ') + ' & '
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
      const transformedArguments = new OperationVariablesToObject<InputValueDefinitionNode>(
        this.scalars,
        this.convertName,
        field.arguments,
        _wrapAstTypeWithModifiers
      );

      return new DeclarationBlock(this._declarationBlockConfig)
        .export()
        .asKind('type')
        .withName(this.convertName(name))
        .withBlock(transformedArguments.string).string;
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

  EnumTypeDefinition(node: EnumTypeDefinitionNode): string {
    return new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind('enum')
      .withName(this.convertName(node.name))
      .withBlock(
        node.values
          .map(enumOption =>
            indent(
              `${this.convertName(enumOption.name)}: ${wrapWithSingleQuotes(
                this.config.enumValues[(enumOption.name as any) as string] || enumOption.name
              )}`
            )
          )
          .join(', \n')
      ).string;
  }
}
