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
    name: 'codegen',
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

  if (isGraphQLConfig(config)) {
    return config;
  }
}

// Kamil: user might load a config that is not GraphQL Config
//        so we need to check if it's a regular config or not
function isGraphQLConfig(config: GraphQLConfig): config is GraphQLConfig {
  if (!config) {
    return false;
  }

  try {
    return config.getDefault().hasExtension('codegen');
  } catch (e) {}

  try {
    for (const projectName in config.projects) {
      if (config.projects.hasOwnProperty(projectName)) {
        const project = config.projects[projectName];

        if (project.hasExtension('codegen')) {
          return true;
        }
      }
    }
  } catch (e) {}

  return false;
}
