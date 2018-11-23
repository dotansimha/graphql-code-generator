import { PluginFunction, GraphQLSchema, DocumentFile } from 'graphql-codegen-core';
import { visit } from 'graphql';
import { flowCommonPluginLeaveHandler } from './visitor';

export type ScalarsMap = { [name: string]: string };

const DEFAULT_SCALARS = {
  ID: 'string',
  String: 'string',
  Boolean: 'boolean',
  Int: 'number',
  Float: 'number'
};

export interface FlowCommonPluginConfig {
  scalars?: ScalarsMap;
  namingConvention?: string;
}

export const plugin: PluginFunction<FlowCommonPluginConfig> = (
  schema: GraphQLSchema,
  documents: DocumentFile[],
  config: FlowCommonPluginConfig
) => {
  const result = `// @flow`;
  const scalars: ScalarsMap = { ...DEFAULT_SCALARS, ...(config.scalars || {}) };

  visit(schema.astNode, {
    leave: flowCommonPluginLeaveHandler({
      scalars,
      convert: str => str
    })
  });

  return result;
};
