import { loadTypedefsUsingLoaders, loadDocumentsUsingLoaders as loadDocumentsToolkit, UnnormalizedTypeDefPointer } from '@graphql-toolkit/core';
import { mergeTypeDefs } from '@graphql-toolkit/schema-merging';
import { Types } from '@graphql-codegen/plugin-helpers';
import { DocumentNode } from 'graphql';
import { DetailedError } from '@graphql-codegen/core';
import { CodeFileLoader } from '@graphql-toolkit/code-file-loader';
import { GitLoader } from '@graphql-toolkit/git-loader';
import { GithubLoader } from '@graphql-toolkit/github-loader';
import { GraphQLFileLoader } from '@graphql-toolkit/graphql-file-loader';
import { JsonFileLoader } from '@graphql-toolkit/json-file-loader';
import { UrlLoader } from '@graphql-toolkit/url-loader';
import { ApolloEngineLoader } from '@graphql-toolkit/apollo-engine-loader';
import { PrismaLoader } from '@graphql-toolkit/prisma-loader';
import { join } from 'path';

export const loadSchema = async (schemaPointers: UnnormalizedTypeDefPointer, config: Types.Config): Promise<DocumentNode> => {
  try {
    const docs = await loadTypedefsUsingLoaders([new CodeFileLoader(), new GitLoader(), new GithubLoader(), new GraphQLFileLoader(), new JsonFileLoader(), new UrlLoader(), new ApolloEngineLoader(), new PrismaLoader()], schemaPointers, config);

    return mergeTypeDefs(docs.map(({ document }) => document));
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
};

export const loadDocuments = async (documentPointers: UnnormalizedTypeDefPointer | UnnormalizedTypeDefPointer[], config: Types.Config): Promise<Types.DocumentFile[]> => {
  const loadedFromToolkit = await loadDocumentsToolkit([new CodeFileLoader(), new GitLoader(), new GithubLoader(), new GraphQLFileLoader()], documentPointers, {
    ignore: Object.keys(config.generates).map(p => join(process.cwd(), p)),
    ...config,
  });

  return loadedFromToolkit
    .map(({ location, document }) => ({ filePath: location, content: document }))
    .sort((a, b) => {
      if (a.filePath < b.filePath) {
        return -1;
      }

      if (a.filePath > b.filePath) {
        return 1;
      }

      return 0;
    });
};
