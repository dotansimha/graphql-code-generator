import { GraphQLSchema, introspectionFromSchema } from 'graphql';
import { PluginFunction, PluginValidateFn, Types, removeFederation } from '@graphql-codegen/plugin-helpers';
import { extname } from 'path';

export interface IntrospectionPluginConfig {
  /**
   * @name minify
   * @type boolean
   * @description Set to `true` in order to minify the JSON output.
   * @default false
   *
   * @example
   * ```yml
   * generates:
   * introspection.json:
   *   plugins:
   *     - introspection
   *   config:
   *     minify: true
   * ```
   */
  minify?: boolean;
  federation?: boolean;
}

export const plugin: PluginFunction<IntrospectionPluginConfig> = async (schema: GraphQLSchema, _documents, pluginConfig: IntrospectionPluginConfig): Promise<string> => {
  const cleanSchema = pluginConfig.federation ? removeFederation(schema) : schema;

  const introspection = introspectionFromSchema(cleanSchema, { descriptions: true });

  return pluginConfig.minify ? JSON.stringify(introspection) : JSON.stringify(introspection, null, 2);
};

export const validate: PluginValidateFn<any> = async (schema: GraphQLSchema, documents: Types.DocumentFile[], config: any, outputFile: string) => {
  if (extname(outputFile) !== '.json') {
    throw new Error(`Plugin "introspection" requires extension to be ".json"!`);
  }
};
