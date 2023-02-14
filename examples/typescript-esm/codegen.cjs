// @ts-check

/** @type {import("@graphql-codegen/cli").CodegenConfig} */
const config = {
  schema: 'https://swapi-graphql.netlify.app/.netlify/functions/index',
  documents: ['src/**/*.ts'],
  emitLegacyCommonJSImports: false,
  generates: {
    './src/gql/': {
      plugins: [],
      preset: 'client-preset',
    },
  },
  hooks: { afterAllFileWrite: ['prettier --write'] },
};

module.exports = config;
