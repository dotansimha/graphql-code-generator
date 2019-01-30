import { PluginFunction, DocumentFile, PluginValidateFn, Types } from 'graphql-codegen-core';
import { GraphQLSchema } from 'graphql';

export const plugin: PluginFunction = (schema: GraphQLSchema, documents: DocumentFile[], config: any): string => {
  return '// This is my plugin!'; // Replace with your plugin's output
};

export const validate: PluginValidateFn = (
  schema: GraphQLSchema,
  documents: DocumentFile[],
  config: any,
  outputFile: string,
  allPlugins: Types.ConfiguredPlugin[]
) => {
  // Use this function to verify that you got everything you need to run your
  // plugin, and throw an Error if something is not right.
};
