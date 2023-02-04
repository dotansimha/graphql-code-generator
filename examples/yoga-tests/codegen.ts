// eslint-disable-next-line import/no-extraneous-dependencies
import { type CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: './src/yoga.ts',
  documents: ['src/**/*.ts'],
  generates: {
    './src/gql/': {
      plugins: [],
      preset: 'client-preset',
    },
  },
};

export default config;
