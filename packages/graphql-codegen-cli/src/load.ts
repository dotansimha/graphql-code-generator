import { extname, join } from 'path';
import { Types } from '@graphql-codegen/plugin-helpers';
import { ApolloEngineLoader } from '@graphql-tools/apollo-engine-loader';
import { CodeFileLoader } from '@graphql-tools/code-file-loader';
import { GitLoader } from '@graphql-tools/git-loader';
import { GithubLoader } from '@graphql-tools/github-loader';
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';
import { JsonFileLoader } from '@graphql-tools/json-file-loader';
import {
  loadDocuments as loadDocumentsToolkit,
  loadSchema as loadSchemaToolkit,
  NoTypeDefinitionsFound,
  UnnormalizedTypeDefPointer,
} from '@graphql-tools/load';
import { UrlLoader } from '@graphql-tools/url-loader';
import { GraphQLError, GraphQLSchema } from 'graphql';

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
  schemaPointers: UnnormalizedTypeDefPointer | UnnormalizedTypeDefPointer[],
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
    ];

    const schema = await loadSchemaToolkit(schemaPointers, {
      ...defaultSchemaLoadOptions,
      loaders,
      ...config,
      ...config.config,
    });
    return schema;
  } catch (e) {
    throw new Error(
      [
        `Failed to load schema from ${Object.keys(schemaPointers).join(',')}:`,
        printError(e),
        '\nGraphQL Code Generator supports:',
        '\n- ES Modules and CommonJS exports (export as default or named export "schema")',
        '- Introspection JSON File',
        '- URL of GraphQL endpoint',
        '- Multiple files with type definitions (glob expression)',
        '- String in config file',
        '\nTry to use one of above options and run codegen again.\n',
      ].join('\n')
    );
  }
}

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

  try {
    const loadedFromToolkit = await loadDocumentsToolkit(documentPointers, {
      ...defaultDocumentsLoadOptions,
      ignore,
      loaders,
      ...config,
      ...config.config,
    });
    return loadedFromToolkit;
  } catch (error) {
    // NoTypeDefinitionsFound from `@graphql-tools/load` already has a message with pointer, so we can just rethrow the error
    if (error instanceof NoTypeDefinitionsFound) {
      throw error;
    }

    // For other errors, we need to add an error message with documentPointers, so it's better for DevX
    throw new Error(
      [`Failed to load documents from ${Object.keys(documentPointers).join(',')}:`, printError(error)].join('\n')
    );
  }
}

const printError = (error: any) => {
  if (error instanceof GraphQLError) {
    return String(error);
  }
  return [String(error.message || error), String(error.stack)].join('\n');
};
