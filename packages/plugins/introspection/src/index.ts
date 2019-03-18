import { GraphQLSchema, introspectionFromSchema } from 'graphql';
import { PluginFunction, PluginValidateFn, Types } from 'graphql-codegen-plugin-helpers';
import { extname } from 'path';

export const plugin: PluginFunction = async (schema: GraphQLSchema): Promise<string> => {
  const introspection = introspectionFromSchema(schema, { descriptions: true });

  return JSON.stringify(introspection);
};

export const validate: PluginValidateFn<any> = async (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config: any,
  outputFile: string
) => {
  if (extname(outputFile) !== '.json') {
    throw new Error(`Plugin "introspection" requires extension to be ".json"!`);
  }
};
