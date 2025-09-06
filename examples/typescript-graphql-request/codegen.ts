import { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'https://graphql.org/graphql/',
  documents: ['src/**/*.ts'],
  generates: {
    './src/gql/': {
      preset: 'client',
      config: {
        documentMode: 'string',
      },
    },
  },
  hooks: { afterAllFileWrite: ['prettier --write'] },
};

export default config;
