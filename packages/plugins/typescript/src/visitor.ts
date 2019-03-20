import { wrapWithSingleQuotes, DeclarationBlock, indent, BaseTypesVisitor, ParsedTypesConfig } from '@graphql-codegen/visitor-plugin-common';
import { TypeScriptPluginConfig } from './index';
import * as autoBind from 'auto-bind';
import { FieldDefinitionNode, NamedTypeNode, ListTypeNode, NonNullTypeNode, EnumTypeDefinitionNode, Kind, InputValueDefinitionNode, GraphQLSchema } from 'graphql';
import { TypeScriptOperationVariablesToObject } from './typescript-variables-to-object';

export interface TypeScriptPluginParsedConfig extends ParsedTypesConfig {
  avoidOptionals: boolean;
  constEnums: boolean;
  enumsAsTypes: boolean;
  immutableTypes: boolean;
  maybeValue: string;
}

export class TsVisitor<TRawConfig extends TypeScriptPluginConfig = TypeScriptPluginConfig, TParsedConfig extends TypeScriptPluginParsedConfig = TypeScriptPluginParsedConfig> extends BaseTypesVisitor<TRawConfig, TParsedConfig> {
  constructor(schema: GraphQLSchema, pluginConfig: TRawConfig, additionalConfig: Partial<TParsedConfig> = {}) {
    super(schema, pluginConfig, {
      avoidOptionals: pluginConfig.avoidOptionals || false,
      maybeValue: pluginConfig.maybeValue || 'T | null',
      constEnums: pluginConfig.constEnums || false,
      enumsAsTypes: pluginConfig.enumsAsTypes || false,
      immutableTypes: pluginConfig.immutableTypes || false,
      ...(additionalConfig || {}),
    } as TParsedConfig);

    autoBind(this);
    this.setArgumentsTransformer(new TypeScriptOperationVariablesToObject(this.scalars, this.convertName, this.config.avoidOptionals, this.config.immutableTypes));
    this.setDeclarationBlockConfig({
      enumNameValueSeparator: ' =',
    });
  }

  private clearOptional(str: string): string {
    if (str.startsWith('Maybe')) {
      return str.replace(/Maybe<(.*?)>$/, '$1');
    }

    return str;
  }

  NamedType(node: NamedTypeNode): string {
    return `Maybe<${super.NamedType(node)}>`;
  }

  ListType(node: ListTypeNode): string {
    return `Maybe<${super.ListType(node)}>`;
  }

  protected wrapWithListType(str: string): string {
    return `${this.config.immutableTypes ? 'ReadonlyArray' : 'Array'}<${str}>`;
  }

  NonNullType(node: NonNullTypeNode): string {
    const baseValue = super.NonNullType(node);

    return this.clearOptional(baseValue);
  }

  FieldDefinition(node: FieldDefinitionNode, key?: number | string, parent?: any): string {
    const typeString = (node.type as any) as string;
    const originalFieldNode = parent[key] as FieldDefinitionNode;
    const addOptionalSign = !this.config.avoidOptionals && originalFieldNode.type.kind !== Kind.NON_NULL_TYPE;

    return indent(`${this.config.immutableTypes ? 'readonly ' : ''}${node.name}${addOptionalSign ? '?' : ''}: ${typeString},`);
  }

  InputValueDefinition(node: InputValueDefinitionNode, key?: number | string, parent?: any): string {
    const originalFieldNode = parent[key] as FieldDefinitionNode;
    const addOptionalSign = !this.config.avoidOptionals && originalFieldNode.type.kind !== Kind.NON_NULL_TYPE;

    return indent(`${this.config.immutableTypes ? 'readonly ' : ''}${node.name}${addOptionalSign ? '?' : ''}: ${node.type},`);
  }

  EnumTypeDefinition(node: EnumTypeDefinitionNode): string {
    const enumName = (node.name as any) as string;

    // In case of mapped external enum string
    if (this.config.enumValues[enumName] && typeof this.config.enumValues[enumName] === 'string') {
      return null;
    }

    if (this.config.enumsAsTypes) {
      return new DeclarationBlock(this._declarationBlockConfig)
        .export()
        .asKind('type')
        .withName(this.convertName(node))
        .withContent(
          node.values
            .map(enumOption => {
              let enumValue: string = (enumOption.name as any) as string;

              if (this.config.enumValues[enumName] && typeof this.config.enumValues[enumName] === 'object' && this.config.enumValues[enumName][enumValue]) {
                enumValue = this.config.enumValues[enumName][enumValue];
              }

              return wrapWithSingleQuotes(enumValue);
            })
            .join(' | ')
        ).string;
    } else {
      return new DeclarationBlock(this._declarationBlockConfig)
        .export()
        .asKind(this.config.constEnums ? 'const enum' : 'enum')
        .withName(this.convertName(node))
        .withBlock(this.buildEnumValuesBlock(enumName, node.values)).string;
    }
  }
}
