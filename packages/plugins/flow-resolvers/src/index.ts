import { DocumentFile, GraphQLSchema, PluginFunction } from 'graphql-codegen-core';
import { parse, printSchema, visit } from 'graphql';
import { FlowResolversVisitor } from './visitor';

export interface FlowResolversPluginConfig {}

export const plugin: PluginFunction<FlowResolversPluginConfig> = (
  schema: GraphQLSchema,
  documents: DocumentFile[],
  config: FlowResolversPluginConfig
) => {
  const result = `/* @flow */\n\n`;
  const printedSchema = printSchema(schema);
  const astNode = parse(printedSchema);

  const visitorResult = visit(astNode, {
    leave: new FlowResolversVisitor(config)
  });

  return result + visitorResult.definitions.join('\n');
};
