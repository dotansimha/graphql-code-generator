// eslint-disable-next-line import/no-extraneous-dependencies
import { type CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: './src/yoga.mjs',
  documents: ['src/**/*.tsx'],
  generates: {
    './src/gql/': {
      preset: 'client',
    },
  },
  hooks: { afterAllFileWrite: ['prettier --write'] },
};

export default config;
