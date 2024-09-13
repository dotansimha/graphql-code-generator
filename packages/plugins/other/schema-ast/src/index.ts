import { extname } from 'path';
import {
  getCachedDocumentNodeFromSchema,
  PluginFunction,
  PluginValidateFn,
  removeFederation,
  Types,
} from '@graphql-codegen/plugin-helpers';
import {
  buildASTSchema,
  extendSchema,
  GraphQLSchema,
  parse,
  print,
  printIntrospectionSchema,
  printSchema,
  visit,
} from 'graphql';

/**
 * @description This plugin prints the merged schema as string. If multiple schemas are provided, they will be merged and printed as one schema.
 */
export interface SchemaASTConfig {
  /**
   * @description Include directives to Schema output.
   * @default false
   *
   * @exampleMarkdown
   * ```tsx {9} filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    schema: './src/schema.graphql',
   *    generates: {
   *      'path/to/file.graphql': {
   *        plugins: ['schema-ast'],
   *        config: {
   *          includeDirectives: true
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  includeDirectives?: boolean;
  /**
   * @description Include introspection types to Schema output.
   * @default false
   *
   * @exampleMarkdown
   * ```tsx {9} filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    schema: './src/schema.graphql',
   *    generates: {
   *      'path/to/file.graphql': {
   *        plugins: ['schema-ast'],
   *        config: {
   *          includeIntrospectionTypes: true
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  includeIntrospectionTypes?: boolean;
  /**
   * @description Set to true in order to print description as comments (using `#` instead of `"""`)
   * @default false
   *
   * @exampleMarkdown
   * ```tsx {9} filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    schema: './src/schema.graphql',
   *    generates: {
   *      'path/to/file.graphql': {
   *        plugins: ['schema-ast'],
   *        config: {
   *          commentDescriptions: true
   *        },
   *      },
   *    },
   *  };
   *  export default config;
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

  const allowedExtensions = ['.graphql', '.gql', '.graphqls'];
  const isAllowedExtension = allowedExtensions.includes(extname(outputFile));

  if (singlePlugin && !isAllowedExtension) {
    const allowedExtensionsOutput = allowedExtensions.map(extension => `"${extension}"`).join(' or ');
    throw new Error(`Plugin "schema-ast" requires extension to be ${allowedExtensionsOutput}!`);
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
