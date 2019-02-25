import { DocumentFile, PluginFunction } from 'graphql-codegen-core';
import { parse, printSchema, visit, GraphQLSchema } from 'graphql';
import { RawConfig } from 'graphql-codegen-visitor-plugin-common';
import { TsVisitor } from './visitor';

export interface TypeScriptPluginConfig extends RawConfig {
  avoidOptionals?: boolean;
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

  return [header, ...visitorResult.definitions].join('\n');
};
