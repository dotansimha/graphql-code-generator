import { DocumentFile, PluginFunction } from 'graphql-codegen-core';
import { printSchema, parse, visit, GraphQLSchema } from 'graphql';
import { RawTypesConfig } from 'graphql-codegen-visitor-plugin-common';
import { TsVisitor, includeIntrospectionDefinitions } from './visitor';
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
  const header = `type Maybe<T> = ${visitor.config.maybeValue};`;

  const visitorResult = visit(parse(printedSchema), { leave: visitor });
  includeIntrospectionDefinitions(schema, documents, config);

  return [header, ...visitorResult.definitions].join('\n');
};
