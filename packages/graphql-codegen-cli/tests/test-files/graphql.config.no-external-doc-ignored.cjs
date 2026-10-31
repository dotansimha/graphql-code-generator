/** @type {import('graphql-config').IGraphQLConfig } */
module.exports = {
  schema: ['../test-documents/schema.graphql'],
  extensions: {
    codegen: {
      verbose: true,
      ignoreNoDocuments: true,
      // This file does not exist on purpose: a pointer that matches no documents triggers the "no documents found" error, which `ignoreNoDocuments` should ignore
      externalDocuments: ['../test-documents/does-not-exist.graphql'],
      generates: {
        './gql/': {
          preset: 'client',
        },
      },
    },
  },
};
