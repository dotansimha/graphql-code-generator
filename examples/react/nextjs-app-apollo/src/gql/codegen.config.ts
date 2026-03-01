import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: 'https://swapi-graphql.netlify.app/.netlify/functions/index',
  documents: './src/(app|components)/**/*.tsx',
  generates: {
    './src/gql/codegen/': {
      preset: 'client',
    },
  },
};

export default config;
