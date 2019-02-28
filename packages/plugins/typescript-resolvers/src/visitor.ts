import { ListTypeNode, NamedTypeNode, NonNullTypeNode } from 'graphql/language/ast';
import { TypeScriptResolversPluginConfig } from './index';
import { GraphQLSchema } from 'graphql';
import * as autoBind from 'auto-bind';
import { ParsedResolversConfig, BaseResolversVisitor } from 'graphql-codegen-visitor-plugin-common';
import { TypeScriptOperationVariablesToObject } from 'graphql-codegen-typescript';

export interface ParsedTypeScriptResolversConfig extends ParsedResolversConfig {
  avoidOptionals: boolean;
}

export class TypeScriptResolversVisitor extends BaseResolversVisitor<
  TypeScriptResolversPluginConfig,
  ParsedTypeScriptResolversConfig
> {
  constructor(pluginConfig: TypeScriptResolversPluginConfig, schema: GraphQLSchema) {
    super(
      pluginConfig,
      {
        avoidOptionals: pluginConfig.avoidOptionals || false
      } as any,
      schema
    );
    autoBind(this);
    this.setVariablesTransformer(
      new TypeScriptOperationVariablesToObject(this.config.scalars, this.convertName, this.config.avoidOptionals)
    );
  }

  protected formatRootResolver(schemaTypeName: string, resolverType: string): string {
    return `${schemaTypeName}?: ${resolverType},`;
  }

  private clearOptional(str: string): string {
    if (str.startsWith('Maybe')) {
      return str.replace(/Maybe<(.*?)>/, '$1');
    }

    return str;
  }

  ListType(node: ListTypeNode): string {
    return `Maybe<${super.ListType(node)}>`;
  }

  NamedType(node: NamedTypeNode): string {
    return `Maybe<${super.NamedType(node)}>`;
  }

  NonNullType(node: NonNullTypeNode): string {
    const baseValue = super.NonNullType(node);

    return this.clearOptional(baseValue);
  }
}
