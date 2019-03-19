import { TypeScriptResolversPluginConfig } from './index';
import { ListTypeNode, NamedTypeNode, NonNullTypeNode, GraphQLSchema } from 'graphql';
import * as autoBind from 'auto-bind';
import { ParsedResolversConfig, BaseResolversVisitor } from '@graphql-codegen/visitor-plugin-common';
import { TypeScriptOperationVariablesToObject } from '@graphql-codegen/typescript';

export interface ParsedTypeScriptResolversConfig extends ParsedResolversConfig {
  avoidOptionals: boolean;
  immutableTypes: boolean;
  useIndexSignature: boolean;
}

export class TypeScriptResolversVisitor extends BaseResolversVisitor<TypeScriptResolversPluginConfig, ParsedTypeScriptResolversConfig> {
  constructor(pluginConfig: TypeScriptResolversPluginConfig, schema: GraphQLSchema) {
    super(
      pluginConfig,
      {
        avoidOptionals: pluginConfig.avoidOptionals || false,
        immutableTypes: pluginConfig.immutableTypes || false,
        useIndexSignature: pluginConfig.useIndexSignature || false,
      } as any,
      schema
    );
    autoBind(this);
    this.setVariablesTransformer(new TypeScriptOperationVariablesToObject(this.config.scalars, this.convertName, this.config.avoidOptionals, this.config.immutableTypes));

    if (this.config.useIndexSignature) {
      this._declarationBlockConfig = {
        blockTransformer(block) {
          return `ResolversObject<${block}>`;
        },
      };
    }
  }

  protected formatRootResolver(schemaTypeName: string, resolverType: string): string {
    return `${schemaTypeName}?: ${resolverType},`;
  }

  private clearOptional(str: string): string {
    if (str.startsWith('Maybe')) {
      return str.replace(/Maybe<(.*?)>$/, '$1');
    }

    return str;
  }

  ListType(node: ListTypeNode): string {
    return `Maybe<${super.ListType(node)}>`;
  }

  protected wrapWithListType(str: string): string {
    return `${this.config.immutableTypes ? 'ReadonlyArray' : 'Array'}<${str}>`;
  }

  NamedType(node: NamedTypeNode): string {
    return `Maybe<${super.NamedType(node)}>`;
  }

  NonNullType(node: NonNullTypeNode): string {
    const baseValue = super.NonNullType(node);

    return this.clearOptional(baseValue);
  }
}
