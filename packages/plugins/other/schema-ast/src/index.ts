import { GraphQLSchema, printSchema, visit, buildASTSchema, print } from 'graphql';
import {
  PluginFunction,
  PluginValidateFn,
  Types,
  removeFederation,
  getCachedDocumentNodeFromSchema,
} from '@graphql-codegen/plugin-helpers';
import { extname } from 'path';

/**
 * @description This plugin prints the merged schema as string. If multiple schemas are provided, they will be merged and printed as one schema.
 */
export interface SchemaASTConfig {
  /**
   * @description Include directives to Schema output.
   * @default false
   *
   * @exampleMarkdown
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
   * @description Set to true in order to print description as comments (using # instead of """)
   * @default false
   *
   * @exampleMarkdown
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
  /**
   * @description Set to true in order get the schema lexicographically sorted before printed.
   * @default false
   */
  sort?: boolean;
  federation?: boolean;
}

export const plugin: PluginFunction<SchemaASTConfig> = async (
  schema: GraphQLSchema,
  _documents,
  { commentDescriptions = false, includeDirectives = false, sort = false, federation }
): Promise<string> => {
  const transformedSchemaAndAst = transformSchemaAST(schema, { sort, federation });

  if (includeDirectives) {
    return print(transformedSchemaAndAst.ast);
  }

  return (printSchema as any)(transformedSchemaAndAst.schema, { commentDescriptions });
};

export const validate: PluginValidateFn<any> = async (
  _schema: GraphQLSchema,
  _documents: Types.DocumentFile[],
  _config: SchemaASTConfig,
  outputFile: string,
  allPlugins: Types.ConfiguredPlugin[]
) => {
  const singlePlugin = allPlugins.length === 1;

  if (singlePlugin && extname(outputFile) !== '.graphql') {
    throw new Error(`Plugin "schema-ast" requires extension to be ".graphql"!`);
  }
};

export function transformSchemaAST(schema: GraphQLSchema, config: { [key: string]: any }) {
  schema = config.federation ? removeFederation(schema) : schema;
  let ast = getCachedDocumentNodeFromSchema(schema);
  ast = config.disableDescriptions
    ? visit(ast, {
        leave: node => ({
          ...node,
          description: undefined,
        }),
      })
    : ast;
  schema = config.disableDescriptions ? buildASTSchema(ast) : schema;

  return {
    schema,
    ast,
  };
}
