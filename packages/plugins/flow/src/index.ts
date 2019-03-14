import { DocumentFile, PluginFunction } from 'graphql-codegen-plugin-helpers';
import { parse, printSchema, visit, GraphQLSchema } from 'graphql';
import { FlowVisitor } from './visitor';
import { RawTypesConfig } from 'graphql-codegen-visitor-plugin-common';

export * from './visitor';
export * from './flow-variables-to-object';

export interface FlowPluginConfig extends RawTypesConfig {
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
