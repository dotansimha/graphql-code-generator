import { indent, BaseVisitor, ParsedConfig } from 'graphql-codegen-visitor-plugin-common';
import { TypeScriptPluginConfig } from './index';
import * as autoBind from 'auto-bind';
import { FieldDefinitionNode, NamedTypeNode, ListTypeNode, NonNullTypeNode } from 'graphql';

export interface TypeScriptPluginParsedConfig extends ParsedConfig {
  avoidOptionals: boolean;
  maybeValue: string;
}

export class TsVisitor extends BaseVisitor<TypeScriptPluginConfig, TypeScriptPluginParsedConfig> {
  constructor(pluginConfig: TypeScriptPluginConfig = {}) {
    super(pluginConfig, {
      avoidOptionals: pluginConfig.avoidOptionals || false,
      maybeValue: pluginConfig.maybeValue || 'T | null'
    } as TypeScriptPluginParsedConfig);

    autoBind(this);
  }

  private clearOptional(str: string): string {
    if (str.startsWith('Maybe')) {
      return str.replace(/Maybe<(.*?)>/, '$1');
    }

    return str;
  }

  NamedType(node: NamedTypeNode): string {
    return `Maybe<${super.NamedType(node)}>`;
  }

  ListType(node: ListTypeNode): string {
    return `Maybe<${super.ListType(node)}>`;
  }

  NonNullType(node: NonNullTypeNode): string {
    const baseValue = super.NonNullType(node);

    return this.clearOptional(baseValue);
  }

  FieldDefinition(node: FieldDefinitionNode, key?: number | string, parent?: any): string {
    const typeString = (node.type as any) as string;
    const originalFieldNode = parent[key] as FieldDefinitionNode;
    const addOptionalSign = !this.config.avoidOptionals && originalFieldNode.type.kind !== 'NonNullType';

    return indent(`${node.name}${addOptionalSign ? '?' : ''}: ${typeString},`);
  }
}
