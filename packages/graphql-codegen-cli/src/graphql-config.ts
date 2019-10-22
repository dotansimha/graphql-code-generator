import { loadConfig, GraphQLExtensionDeclaration, GraphQLConfig } from 'graphql-config';
import { CodeFileLoader } from '@graphql-toolkit/code-file-loader';

const CodegenExtension: GraphQLExtensionDeclaration = api => {
  // Schema
  api.loaders.schema.register(new CodeFileLoader());
  // Documents
  api.loaders.documents.register(new CodeFileLoader());

  // KAMIL: maybe we should let extensions return an array with schema and document loaders
  // instead of exposing an api for that

  return {
    name: 'graphql-codegen',
  };
};

export async function findAndLoadGraphQLConfig(filepath?: string): Promise<GraphQLConfig | void> {
  const config = await loadConfig({
    filepath,
    rootDir: process.cwd(),
    extensions: [CodegenExtension],
    throwOnEmpty: false,
    throwOnMissing: false,
  });

  return config;
}
