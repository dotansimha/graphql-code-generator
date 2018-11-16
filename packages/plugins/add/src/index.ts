import { GraphQLSchema } from 'graphql';
import { PluginFunction, DocumentFile } from 'graphql-codegen-core';

export type AddPluginConfig = string | string[];

export const plugin: PluginFunction<AddPluginConfig> = async (
  schema: GraphQLSchema,
  documents: DocumentFile[],
  config: AddPluginConfig
): Promise<string> => {
  const asArray = Array.isArray(config)
    ? config
    : typeof config === 'object'
    ? Object.keys(config).map(k => config[k])
    : [config];

  return asArray.filter(a => a).join('\r\n') + '\r\n';
};
