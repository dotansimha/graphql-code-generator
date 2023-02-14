import { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'https://swapi-graphql.netlify.app/.netlify/functions/index',
  documents: ['src/**/*.ts'],
  generates: {
    './src/gql/': {
      preset: 'client',
      plugins: [],
    },
  },
  hooks: { afterAllFileWrite: ['prettier --write'] },
};

export default config;
