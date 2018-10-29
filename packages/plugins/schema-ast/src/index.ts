import { GraphQLSchema, printSchema } from 'graphql';
import { PluginFunction } from 'graphql-codegen-core';

export const plugin: PluginFunction = async (schema: GraphQLSchema): Promise<string> => {
  return printSchema(schema, { commentDescriptions: true });
};
