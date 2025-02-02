// @ts-check

/** @type {import("@graphql-codegen/cli").CodegenConfig} */
const config = {
  schema: 'https://graphql.org/graphql/',
  documents: ['src/**/*.ts'],
  emitLegacyCommonJSImports: false,
  generates: {
    './src/gql/': {
      preset: 'client-preset',
    },
  },
  hooks: { afterAllFileWrite: ['prettier --write'] },
};

module.exports = config;
