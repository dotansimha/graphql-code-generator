import { oldVisit, Types } from '@graphql-codegen/plugin-helpers';

import {
  DocumentNode,
  EnumTypeDefinitionNode,
  getNamedType,
  GraphQLNamedType,
  GraphQLSchema,
  isIntrospectionType,
  isObjectType,
  ObjectTypeDefinitionNode,
  parse,
  printIntrospectionSchema,
  TypeInfo,
  visit,
  visitWithTypeInfo,
} from 'graphql';

import { TypeScriptPluginConfig } from './config';
import { TsVisitor } from './ts-visitor';
import autoBind from 'auto-bind';

export function includeIntrospectionTypesDefinitions(
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config: TypeScriptPluginConfig
): string[] {
  const typeInfo = new TypeInfo(schema);
  const usedTypes: GraphQLNamedType[] = [];
  const documentsVisitor = visitWithTypeInfo(typeInfo, {
    Field() {
      const type = getNamedType(typeInfo.getType());

      if (type && isIntrospectionType(type) && !usedTypes.includes(type)) {
        usedTypes.push(type);
      }
    },
  });

  for (const doc of documents) {
    if (doc.document) {
      visit(doc.document, documentsVisitor);
    }
  }

  const typesToInclude: GraphQLNamedType[] = [];

  for (const type of usedTypes) {
    collectTypes(type);
  }

  const visitor = new TsIntrospectionVisitor(schema, config, typesToInclude);
  const result: DocumentNode = oldVisit(parse(printIntrospectionSchema(schema)), { leave: visitor });

  // recursively go through each `usedTypes` and their children and collect all used types
  // we don't care about Interfaces, Unions and others, but Objects and Enums
  function collectTypes(type: GraphQLNamedType): void {
    if (typesToInclude.includes(type)) {
      return;
    }

    typesToInclude.push(type);

    if (isObjectType(type)) {
      const fields = type.getFields();

      for (const key of Object.keys(fields)) {
        const field = fields[key];
        const type = getNamedType(field.type);
        collectTypes(type);
      }
    }
  }

  return result.definitions as any[];
}

export class TsIntrospectionVisitor extends TsVisitor {
  private typesToInclude: GraphQLNamedType[] = [];

  constructor(schema: GraphQLSchema, pluginConfig: TypeScriptPluginConfig = {}, typesToInclude: GraphQLNamedType[]) {
    super(schema, pluginConfig);

    this.typesToInclude = typesToInclude;
    autoBind(this);
  }

  ObjectTypeDefinition(node: ObjectTypeDefinitionNode, key: string | number, parent: any) {
    const name: string = node.name as any;

    if (this.typesToInclude.some(type => type.name === name)) {
      return super.ObjectTypeDefinition(node, key, parent);
    }

    return '';
  }

  EnumTypeDefinition(node: EnumTypeDefinitionNode): string {
    const name: string = node.name as any;

    if (this.typesToInclude.some(type => type.name === name)) {
      return super.EnumTypeDefinition(node);
    }

    return '';
  }
}
