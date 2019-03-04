import { DeclarationBlock, indent, BaseTypesVisitor, ParsedTypesConfig } from 'graphql-codegen-visitor-plugin-common';
import { TypeScriptPluginConfig } from './index';
import * as autoBind from 'auto-bind';
import {
  FieldDefinitionNode,
  NamedTypeNode,
  ListTypeNode,
  NonNullTypeNode,
  EnumTypeDefinitionNode,
  visit,
  TypeInfo,
  GraphQLSchema,
  getNamedType,
  isIntrospectionType,
  isEnumType,
  GraphQLNamedType,
  visitWithTypeInfo,
  printIntrospectionSchema,
  parse
} from 'graphql';
import { TypeScriptOperationVariablesToObject } from './typescript-variables-to-object';
import { DocumentFile } from 'graphql-codegen-core';

export interface TypeScriptPluginParsedConfig extends ParsedTypesConfig {
  avoidOptionals: boolean;
  constEnums: boolean;
  enumsAsTypes: boolean;
  immutableTypes: boolean;
  maybeValue: string;
}

export class TsVisitor extends BaseTypesVisitor<TypeScriptPluginConfig, TypeScriptPluginParsedConfig> {
  constructor(pluginConfig: TypeScriptPluginConfig = {}) {
    super(
      pluginConfig,
      {
        avoidOptionals: pluginConfig.avoidOptionals || false,
        maybeValue: pluginConfig.maybeValue || 'T | null',
        constEnums: pluginConfig.constEnums || false,
        enumsAsTypes: pluginConfig.enumsAsTypes || false,
        immutableTypes: pluginConfig.immutableTypes || false
      } as TypeScriptPluginParsedConfig,
      null
    );

    autoBind(this);
    this.setArgumentsTransformer(
      new TypeScriptOperationVariablesToObject(
        this.scalars,
        this.convertName,
        this.config.avoidOptionals,
        this.config.immutableTypes
      )
    );
    this.setDeclarationBlockConfig({
      enumNameValueSeparator: ' ='
    });
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
    const addOptionalSign = !this.config.avoidOptionals && originalFieldNode.type.kind !== 'NonNullType';

    return indent(
      `${this.config.immutableTypes ? 'readonly ' : ''}${node.name}${addOptionalSign ? '?' : ''}: ${typeString},`
    );
  }

  EnumTypeDefinition(node: EnumTypeDefinitionNode): string {
    if (this.config.enumsAsTypes) {
      return new DeclarationBlock(this._declarationBlockConfig)
        .export()
        .asKind('type')
        .withName(this.convertName(node.name.value))
        .withContent(
          node.values.map(v => `'${this.config.enumValues[(v.name as any) as string] || v.name}'`).join(' | ')
        ).string;
    } else {
      return new DeclarationBlock(this._declarationBlockConfig)
        .export()
        .asKind(this.config.constEnums ? 'const enum' : 'enum')
        .withName(this.convertName(node.name.value))
        .withBlock(this.buildEnumValuesBlock(node.values)).string;
    }
  }
}

export class TsIntrospectionVisitor {
  private typesToInclude: GraphQLNamedType[] = [];
  private tsVisitor: TsVisitor;

  constructor(typesToInclude: GraphQLNamedType[], tsVisitor: TsVisitor) {
    this.typesToInclude = typesToInclude;
    this.tsVisitor = tsVisitor;
  }

  EnumTypeDefinition(node: EnumTypeDefinitionNode): string {
    if (this.typesToInclude.some(type => type.name === node.name.value)) {
      return this.tsVisitor.EnumTypeDefinition(node);
    }

    return ``;
  }
}

export function includeIntrospectionDefinitions(
  schema: GraphQLSchema,
  documents: DocumentFile[],
  config: TypeScriptPluginConfig
) {
  const typeInfo = new TypeInfo(schema);
  const typesToInclude: GraphQLNamedType[] = [];
  const documentsVisitor = visitWithTypeInfo(typeInfo, {
    Field() {
      const type = getNamedType(typeInfo.getType());

      if (isIntrospectionType(type) && isEnumType(type) && !typesToInclude.includes(type)) {
        typesToInclude.push(type);
      }
    }
  });

  documents.forEach(doc => visit(doc.content, documentsVisitor));

  const visitor = new TsIntrospectionVisitor(typesToInclude, new TsVisitor(config));
  const result = visit(parse(printIntrospectionSchema(schema)), visitor);

  return result;
}
