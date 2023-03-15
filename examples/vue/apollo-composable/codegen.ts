import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'https://swapi-graphql.netlify.app/.netlify/functions/index',
  documents: ['src/**/*.vue', '!src/gql/**/*'],
  generates: {
    './src/gql/': {
      preset: 'client',
      config: {
        useTypeImports: true,
      },
    },
  },
  hooks: { afterAllFileWrite: ['prettier --write'] },
};

export default config;
