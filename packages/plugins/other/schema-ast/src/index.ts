import {
  GraphQLSchema,
  parse,
  extendSchema,
  printIntrospectionSchema,
  printSchema,
  visit,
  buildASTSchema,
  print,
} from 'graphql';
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
   * ```yaml {8}
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
   * @description Include introspection types to Schema output.
   * @default false
   *
   * @exampleMarkdown
   * ```yaml {8}
   * schema:
   *   - './src/schema.graphql'
   * generates:
   *   path/to/file.graphql:
   *     plugins:
   *       - schema-ast
   *     config:
   *       includeIntrospectionTypes: true
   * ```
   */
  includeIntrospectionTypes?: boolean;
  /**
   * @description Set to true in order to print description as comments (using `#` instead of `"""`)
   * @default false
   *
   * @exampleMarkdown
   * ```yaml {7}
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
   * @description Set to false to disable sorting
   * @default true
   */
  sort?: boolean;
  federation?: boolean;
}

export const plugin: PluginFunction<SchemaASTConfig> = async (
  schema: GraphQLSchema,
  _documents,
  {
    commentDescriptions = false,
    includeDirectives = false,
    includeIntrospectionTypes = false,
    sort = false,
    federation,
  }
): Promise<string> => {
  const transformedSchemaAndAst = transformSchemaAST(schema, { sort, federation, includeIntrospectionTypes });

  return [
    includeIntrospectionTypes ? printIntrospectionSchema(transformedSchemaAndAst.schema) : null,
    includeDirectives
      ? print(transformedSchemaAndAst.ast)
      : (printSchema as any)(transformedSchemaAndAst.schema, { commentDescriptions }),
  ]
    .filter(Boolean)
    .join('\n');
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

  if (config.includeIntrospectionTypes) {
    // See: https://spec.graphql.org/June2018/#sec-Schema-Introspection
    const introspectionAST = parse(`
      extend type Query {
        __schema: __Schema!
        __type(name: String!): __Type
      }
    `);

    schema = extendSchema(schema, introspectionAST);
  }
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
