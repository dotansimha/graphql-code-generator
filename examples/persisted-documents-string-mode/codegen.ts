import { type CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: './src/yoga.ts',
  documents: ['src/**/*.ts'],
  generates: {
    './src/gql/': {
      preset: 'client-preset',
      presetConfig: {
        persistedDocuments: true,
      },
      config: {
        documentMode: 'string',
      },
    },
  },
  hooks: { afterAllFileWrite: ['prettier --write'] },
};

export default config;
