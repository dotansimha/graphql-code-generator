import { extname } from 'path';
import { PluginFunction, PluginValidateFn, removeFederation, Types } from '@graphql-codegen/plugin-helpers';
import { getConfigValue } from '@graphql-codegen/visitor-plugin-common';
import { GraphQLSchema, introspectionFromSchema } from 'graphql';

/**
 * @description This plugin generates a GraphQL introspection file based on your GraphQL schema.
 */
export interface IntrospectionPluginConfig {
  /**
   * @description Set to `true` in order to minify the JSON output.
   * @default false
   *
   * @exampleMarkdown
   * ```tsx {10} filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    schema: 'https://localhost:4000/graphql',
   *    documents: ['src/**\/*.tsx'],
   *    generates: {
   *      'introspection.json': {
   *        plugins: ['introspection'],
   *        config: {
   *          minify: true
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  minify?: boolean;

  /**
   * @description Whether to include descriptions in the introspection result.
   * @default true
   */
  descriptions?: boolean;

  /**
   * @description Whether to include `specifiedByUrl` in the introspection result.
   * @default false
   */
  specifiedByUrl?: boolean;

  /**
   * @description Whether to include `isRepeatable` flag on directives.
   * @default true
   */
  directiveIsRepeatable?: boolean;

  /**
   * @description Whether to include `description` field on schema.
   * @default false
   */
  schemaDescription?: boolean;

  // Internal
  federation?: boolean;
}

export const plugin: PluginFunction<IntrospectionPluginConfig> = async (
  schema: GraphQLSchema,
  _documents,
  pluginConfig: IntrospectionPluginConfig
): Promise<string> => {
  const cleanSchema = pluginConfig.federation ? removeFederation(schema) : schema;
  const descriptions = getConfigValue(pluginConfig.descriptions, true);
  const directiveIsRepeatable = getConfigValue(pluginConfig.directiveIsRepeatable, true);
  const schemaDescription = getConfigValue(pluginConfig.schemaDescription, undefined);
  const specifiedByUrl = getConfigValue(pluginConfig.specifiedByUrl, undefined);

  const introspection = introspectionFromSchema(cleanSchema, {
    descriptions,
    directiveIsRepeatable,
    schemaDescription,
    specifiedByUrl,
  });

  return pluginConfig.minify ? JSON.stringify(introspection) : JSON.stringify(introspection, null, 2);
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
