import { GraphQLSchema, printSchema } from 'graphql';
import { PluginFunction, PluginValidateFn, Types, removeFederation } from '@graphql-codegen/plugin-helpers';
import { extname } from 'path';
import { printSchemaWithDirectives } from '@graphql-toolkit/common';

export interface SchemaASTConfig {
  /**
   * @name includeDirectives
   * @type boolean
   * @description Include directives to Schema output.
   * @default false
   *
   * @example
   * ```yml
   * schema:
   *   - './src/schema.graphql'
   * generates:
   *   path/to/file.graphql:
   *     plugins:
   *       - schema-ast
   *     config:
   *       includeDirectives: true
   * ```
   */
  includeDirectives?: boolean;
  /**
   * @name commentDescriptions
   * @type boolean
   * @description Set to true in order to print description as comments (using # instead of """)
   * @default false
   *
   * @example
   * ```yml
   * schema: http://localhost:3000/graphql
   * generates:
   *   schema.graphql:
   *     plugins:
   *       - schema-ast
   *     config:
   *       commentDescriptions: true
   * ```
   */
  commentDescriptions?: boolean;
  federation?: boolean;
}
export const plugin: PluginFunction<SchemaASTConfig> = async (schema: GraphQLSchema, _documents, { commentDescriptions = false, includeDirectives = false, federation }): Promise<string> => {
  const outputSchema = federation ? removeFederation(schema) : schema;

  if (includeDirectives) {
    return printSchemaWithDirectives(outputSchema);
  }

  return printSchema(outputSchema, { commentDescriptions: commentDescriptions });
};

export const validate: PluginValidateFn<any> = async (_schema: GraphQLSchema, _documents: Types.DocumentFile[], _config: SchemaASTConfig, outputFile: string, allPlugins: Types.ConfiguredPlugin[]) => {
  const singlePlugin = allPlugins.length === 1;

  if (singlePlugin && extname(outputFile) !== '.graphql') {
    throw new Error(`Plugin "schema-ast" requires extension to be ".graphql"!`);
  }
};
