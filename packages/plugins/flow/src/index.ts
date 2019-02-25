import { DocumentFile, PluginFunction } from 'graphql-codegen-core';
import { parse, printSchema, visit, GraphQLSchema } from 'graphql';
import { FlowVisitor } from './visitor';
import { RawConfig } from 'graphql-codegen-visitor-plugin-common';
export { DEFAULT_SCALARS } from 'graphql-codegen-visitor-plugin-common/src/scalars';
export * from 'graphql-codegen-visitor-plugin-common/src/variables-to-object';
export * from './visitor';

export interface FlowPluginConfig extends RawConfig {
  useFlowExactObjects?: boolean;
  useFlowReadOnlyTypes?: boolean;
}

export const plugin: PluginFunction<FlowPluginConfig> = (
  schema: GraphQLSchema,
  documents: DocumentFile[],
  config: FlowPluginConfig
) => {
  const result = `/* @flow */\n\n`;
  const printedSchema = printSchema(schema);
  const astNode = parse(printedSchema);

  const visitorResult = visit(astNode, {
    leave: new FlowVisitor(config)
  });

  return result + visitorResult.definitions.join('\n');
};
