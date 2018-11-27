import { GraphQLSchema } from 'graphql';
import { PluginFunction, DocumentFile } from 'graphql-codegen-core';

export type AddPluginConfig = string | string[];

const nl = '\n';

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

  return asArray.filter(a => a).join(nl) + nl;
};
