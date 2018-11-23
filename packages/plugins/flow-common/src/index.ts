import { PluginFunction, GraphQLSchema, DocumentFile } from 'graphql-codegen-core';
import { visit } from 'graphql';
import { flowCommonPluginLeaveHandler } from './visitor';

export type ScalarsMap = { [name: string]: string };
export type EnumValuesMap = { [key: string]: string };

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
  enumValues?: EnumValuesMap;
}

export const plugin: PluginFunction<FlowCommonPluginConfig> = (
  schema: GraphQLSchema,
  documents: DocumentFile[],
  config: FlowCommonPluginConfig
) => {
  let result = `// @flow\n\n`;

  result += visit(schema.astNode, {
    leave: flowCommonPluginLeaveHandler({
      scalars: { ...DEFAULT_SCALARS, ...(config.scalars || {}) },
      convert: str => str,
      enumValues: config.enumValues || {}
    })
  });

  return result;
};
