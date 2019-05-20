import { GraphQLSchema } from 'graphql';
import { PluginFunction, Types } from '@graphql-codegen/plugin-helpers';

export type AddPluginConfig = string | string[];

export const plugin: PluginFunction<AddPluginConfig> = async (schema: GraphQLSchema, documents: Types.DocumentFile[], config: AddPluginConfig): Promise<Types.PluginOutput> => {
  const asArray = Array.isArray(config) ? config : typeof config === 'object' ? Object.keys(config).map(k => config[k]) : [config];

  return {
    prepend: asArray.filter(a => a),
    content: null,
  };
};
