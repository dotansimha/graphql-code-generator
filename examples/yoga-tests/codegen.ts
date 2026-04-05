import { type CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: './src/yoga.ts',
  documents: ['src/**/*.ts'],
  generates: {
    './src/gql/': {
      preset: 'client-preset',
    },
  },
  hooks: { afterAllFileWrite: ['prettier --write'] },
};

export default config;
