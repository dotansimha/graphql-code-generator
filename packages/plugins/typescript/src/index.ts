import { DocumentFile, PluginFunction } from 'graphql-codegen-core';
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
  isEnumType,
  DocumentNode,
  printIntrospectionSchema
} from 'graphql';
import { RawTypesConfig } from 'graphql-codegen-visitor-plugin-common';
import { TsVisitor } from './visitor';
import { TsIntrospectionVisitor } from './introspection-visitor';
export * from './typescript-variables-to-object';

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
  const visitor = new TsVisitor(config) as any;
  const printedSchema = printSchema(schema);
  const astNode = parse(printedSchema);
  const header = `type Maybe<T> = ${visitor.config.maybeValue};`;
  const visitorResult = visit(astNode, { leave: visitor });
  const introspectionDefinitions = includeIntrospectionDefinitions(schema, documents, config);

  return [header, ...visitorResult.definitions, ...introspectionDefinitions].join('\n');
};

function includeIntrospectionDefinitions(
  schema: GraphQLSchema,
  documents: DocumentFile[],
  config: TypeScriptPluginConfig
): string[] {
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
  const result: DocumentNode = visit(parse(printIntrospectionSchema(schema)), { leave: visitor });

  return result.definitions as any[];
}
