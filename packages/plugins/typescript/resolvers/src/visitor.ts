import { TypeScriptResolversPluginConfig } from './config';
import { FieldDefinitionNode, ListTypeNode, NamedTypeNode, NonNullTypeNode, GraphQLSchema } from 'graphql';
import autoBind from 'auto-bind';
import {
  ParsedResolversConfig,
  BaseResolversVisitor,
  getConfigValue,
  DeclarationKind,
} from '@graphql-codegen/visitor-plugin-common';
import { TypeScriptOperationVariablesToObject } from '@graphql-codegen/typescript';

export interface ParsedTypeScriptResolversConfig extends ParsedResolversConfig {
  avoidOptionals: boolean;
  useIndexSignature: boolean;
  wrapFieldDefinitions: boolean;
}

export class TypeScriptResolversVisitor extends BaseResolversVisitor<
  TypeScriptResolversPluginConfig,
  ParsedTypeScriptResolversConfig
> {
  constructor(pluginConfig: TypeScriptResolversPluginConfig, schema: GraphQLSchema) {
    super(
      pluginConfig,
      {
        avoidOptionals: getConfigValue(pluginConfig.avoidOptionals, false),
        useIndexSignature: getConfigValue(pluginConfig.useIndexSignature, false),
        wrapFieldDefinitions: getConfigValue(pluginConfig.wrapFieldDefinitions, false),
      } as ParsedTypeScriptResolversConfig,
      schema
    );
    autoBind(this);
    this.setVariablesTransformer(
      new TypeScriptOperationVariablesToObject(
        this.scalars,
        this.convertName,
        this.config.avoidOptionals,
        this.config.immutableTypes,
        null,
        [],
        this.config.enumPrefix,
        this.config.enumValues
      )
    );

    if (this.config.useIndexSignature) {
      this._declarationBlockConfig = {
        blockTransformer(block) {
          return `ResolversObject<${block}>`;
        },
      };
    }
  }

  protected formatRootResolver(schemaTypeName: string, resolverType: string, declarationKind: DeclarationKind): string {
    return `${schemaTypeName}${this.config.avoidOptionals ? '' : '?'}: ${resolverType}${this.getPunctuation(
      declarationKind
    )}`;
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

  protected getParentTypeForSignature(node: FieldDefinitionNode) {
    if (this._federation.isResolveReferenceField(node) && this.config.wrapFieldDefinitions) {
      return 'UnwrappedObject<ParentType>';
    }
    return 'ParentType';
  }

  NamedType(node: NamedTypeNode): string {
    return `Maybe<${super.NamedType(node)}>`;
  }

  NonNullType(node: NonNullTypeNode): string {
    const baseValue = super.NonNullType(node);

    return this.clearOptional(baseValue);
  }

  protected getPunctuation(declarationKind: DeclarationKind): string {
    return ';';
  }
}
