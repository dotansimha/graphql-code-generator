import { DocumentFile, PluginFunction } from 'graphql-codegen-core';
import { parse, printSchema, visit, GraphQLSchema } from 'graphql';
import { FlowVisitor } from './visitor';

export { DEFAULT_SCALARS } from './visitor';
export * from './utils';
export * from './variables-to-object';
export * from './visitor';

export type ScalarsMap = { [name: string]: string };
export type EnumValuesMap = { [key: string]: string };
export type OutputOptions = Array<'useFlowExactObjects' | 'useFlowReadOnlyTypes'>;

export interface FlowPluginConfig {
  scalars?: ScalarsMap;
  enumValues?: EnumValuesMap;
  namingConvention?: string;
  typesPrefix?: string;
  outputOptions?: OutputOptions;
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
