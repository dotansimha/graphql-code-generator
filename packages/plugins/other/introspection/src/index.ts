import { GraphQLSchema, introspectionFromSchema } from 'graphql';
import { PluginFunction, PluginValidateFn, Types, removeFederation } from '@graphql-codegen/plugin-helpers';
import { extname } from 'path';

export const plugin: PluginFunction<{ federation?: boolean }> = async (schema: GraphQLSchema, _documents, pluginConfig): Promise<string> => {
  const cleanSchema = pluginConfig.federation
    ? schema
    : removeFederation(schema, {
        withDirectives: true,
      });

  const introspection = introspectionFromSchema(cleanSchema, { descriptions: true });

  return JSON.stringify(introspection);
};

export const validate: PluginValidateFn<any> = async (schema: GraphQLSchema, documents: Types.DocumentFile[], config: any, outputFile: string) => {
  if (extname(outputFile) !== '.json') {
    throw new Error(`Plugin "introspection" requires extension to be ".json"!`);
  }
};
