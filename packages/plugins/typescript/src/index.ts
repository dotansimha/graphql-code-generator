import { DocumentFile, PluginFunction } from 'graphql-codegen-plugin-helpers';
import {
  parse,
  printSchema,
  visit,
  GraphQLSchema,
  TypeInfo,
  GraphQLNamedType,
  visitWithTypeInfo,
  getNamedType,
  isIntrospectionType,
  DocumentNode,
  printIntrospectionSchema,
  isObjectType
} from 'graphql';
import { RawTypesConfig } from 'graphql-codegen-visitor-plugin-common';
import { TsVisitor } from './visitor';
import { TsIntrospectionVisitor } from './introspection-visitor';
export * from './typescript-variables-to-object';
export * from './visitor';

export interface TypeScriptPluginConfig extends RawTypesConfig {
  avoidOptionals?: boolean;
  constEnums?: boolean;
  enumsAsTypes?: boolean;
  immutableTypes?: boolean;
  maybeValue?: string;
}

export const plugin: PluginFunction<TypeScriptPluginConfig> = (
  schema: GraphQLSchema,
  documents: DocumentFile[],
  config: TypeScriptPluginConfig
) => {
  const visitor = new TsVisitor(schema, config);
  const printedSchema = printSchema(schema);
  const astNode = parse(printedSchema);
  const header = `type Maybe<T> = ${visitor.config.maybeValue};`;
  const visitorResult = visit(astNode, { leave: visitor });
  const introspectionDefinitions = includeIntrospectionDefinitions(schema, documents, config);
  const scalars = visitor.scalarsDefinition;

  return [header, scalars, ...visitorResult.definitions, ...introspectionDefinitions].join('\n');
};

function includeIntrospectionDefinitions(
  schema: GraphQLSchema,
  documents: DocumentFile[],
  config: TypeScriptPluginConfig
): string[] {
  const typeInfo = new TypeInfo(schema);
  const usedTypes: GraphQLNamedType[] = [];
  const documentsVisitor = visitWithTypeInfo(typeInfo, {
    Field() {
      const type = getNamedType(typeInfo.getType());

      if (isIntrospectionType(type) && !usedTypes.includes(type)) {
        usedTypes.push(type);
      }
    }
  });

  documents.forEach(doc => visit(doc.content, documentsVisitor));

  const typesToInclude: GraphQLNamedType[] = [];

  usedTypes.forEach(type => {
    collectTypes(type);
  });

  const visitor = new TsIntrospectionVisitor(schema, config, typesToInclude);
  const result: DocumentNode = visit(parse(printIntrospectionSchema(schema)), { leave: visitor });

  // recursively go through each `usedTypes` and their children and collect all used types
  // we don't care about Interfaces, Unions and others, but Objects and Enums
  function collectTypes(type: GraphQLNamedType): void {
    if (typesToInclude.includes(type)) {
      return;
    }

    typesToInclude.push(type);

    if (isObjectType(type)) {
      const fields = type.getFields();

      Object.keys(fields).forEach(key => {
        const field = fields[key];
        const type = getNamedType(field.type);
        collectTypes(type);
      });
    }
  }

  return result.definitions as any[];
}
