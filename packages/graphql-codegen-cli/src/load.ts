import {
  loadSchema as loadSchemaToolkit,
  loadDocuments as loadDocumentsToolkit,
  UnnormalizedTypeDefPointer,
} from '@graphql-tools/load';
import { DetailedError, Types } from '@graphql-codegen/plugin-helpers';
import { GraphQLSchema } from 'graphql';
import { CodeFileLoader } from '@graphql-tools/code-file-loader';
import { GitLoader } from '@graphql-tools/git-loader';
import { GithubLoader } from '@graphql-tools/github-loader';
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';
import { JsonFileLoader } from '@graphql-tools/json-file-loader';
import { UrlLoader } from '@graphql-tools/url-loader';
import { ApolloEngineLoader } from '@graphql-tools/apollo-engine-loader';
import { PrismaLoader } from '@graphql-tools/prisma-loader';
import path, { join, extname } from 'path';
import { Source } from '@graphql-tools/utils/loaders';
import { makeDefaultLoader } from './codegen';

export const defaultSchemaLoadOptions = {
  assumeValidSDL: true,
  sort: true,
  convertExtensions: true,
  includeSources: true,
};

export const defaultDocumentsLoadOptions = {
  sort: true,
  skipGraphQLImport: true,
};

export async function loadSchema(
  schemaPointers: UnnormalizedTypeDefPointer,
  config: Types.Config
): Promise<GraphQLSchema> {
  try {
    const loaders = [
      new CodeFileLoader(),
      new GitLoader(),
      new GithubLoader(),
      new GraphQLFileLoader(),
      new JsonFileLoader(),
      new UrlLoader(),
      new ApolloEngineLoader(),
      new PrismaLoader(),
    ];

    const schema = await loadSchemaToolkit(schemaPointers, {
      ...defaultSchemaLoadOptions,
      loaders,
      ...config,
      ...config.config,
    });
    return schema;
  } catch (e) {
    throw new DetailedError(
      'Failed to load schema',
      `
        Failed to load schema from ${Object.keys(schemaPointers).join(',')}:

        ${e.message || e}
        ${e.stack || ''}

        GraphQL Code Generator supports:
          - ES Modules and CommonJS exports (export as default or named export "schema")
          - Introspection JSON File
          - URL of GraphQL endpoint
          - Multiple files with type definitions (glob expression)
          - String in config file

        Try to use one of above options and run codegen again.

      `
    );
  }
}

const requiredLoader = async (pointers: Types.CustomDocumentRequire[]): Promise<Source[]> => {
  return Promise.all(
    pointers.map(async pointer => {
      const userLoader = (await makeDefaultLoader(process.cwd())(pointer.require)) as (params: {
        config: Record<string, any>;
        schema: GraphQLSchema;
      }) => Source[] | Promise<Source[]>;
      const documents = userLoader(pointer.config || {}, schema);
      return documents;
    })
  ).then(results => [].concat(...results));
};

const isRequirePointer = (pointer: UnnormalizedTypeDefPointer): pointer is Types.CustomDocumentRequire => {
  return typeof pointer === 'object' && 'require' in pointer;
};

export async function loadDocuments(
  documentPointers: UnnormalizedTypeDefPointer | UnnormalizedTypeDefPointer[],
  config: Types.Config
): Promise<Types.DocumentFile[]> {
  const loaders = [
    new CodeFileLoader({
      pluckConfig: {
        skipIndent: true,
      },
    }),
    new GitLoader(),
    new GithubLoader(),
    new GraphQLFileLoader(),
  ];

  const ignore: Array<string> = [];
  for (const generatePath of Object.keys(config.generates)) {
    if (extname(generatePath) === '') {
      // we omit paths that don't resolve to a specific file
      continue;
    }
    ignore.push(join(process.cwd(), generatePath));
  }

  const loaderPointers: UnnormalizedTypeDefPointer[] = [];
  const requestPointers: Types.CustomDocumentRequire[] = [];

  if (Array.isArray(documentPointers)) {
    documentPointers.forEach(pointer => {
      if (isRequirePointer(pointer)) {
        requestPointers.push(pointer);
      } else {
        loaderPointers.push(pointer);
      }
    });
  } else {
    if (isRequirePointer(documentPointers)) {
      requestPointers.push(documentPointers);
    } else {
      loaderPointers.push(documentPointers);
    }
  }

  const loadedFromToolkit = await loadDocumentsToolkit(loaderPointers, {
    ...defaultDocumentsLoadOptions,
    ignore,
    loaders,
    ...config,
    ...config.config,
  });

  const loadedAlterantively = await requiredLoader(requestPointers);

  return [...loadedFromToolkit, ...loadedAlterantively];
}
