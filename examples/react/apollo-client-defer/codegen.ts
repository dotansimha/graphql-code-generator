import { type CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: './src/yoga.mjs',
  documents: ['src/**/*.tsx'],
  generates: {
    './src/gql/': {
      preset: 'client',
      config: {
        skipTypeNameForRoot: true,
        nonOptionalTypename: true,
      },
    },
  },
  hooks: { afterAllFileWrite: ['prettier --write'] },
};

export default config;
