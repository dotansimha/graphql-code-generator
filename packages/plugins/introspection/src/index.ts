import { GraphQLSchema } from 'graphql';
import { PluginFunction } from 'graphql-codegen-core';
import { introspectionFromSchema } from 'graphql';

export const plugin: PluginFunction = async (schema: GraphQLSchema): Promise<string> => {
  const introspection = introspectionFromSchema(schema, { descriptions: true });

  return JSON.stringify(introspection);
};
