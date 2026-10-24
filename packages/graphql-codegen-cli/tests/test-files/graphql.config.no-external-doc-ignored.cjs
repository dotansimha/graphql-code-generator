/** @type {import('graphql-config').IGraphQLConfig } */
module.exports = {
  schema: ['../test-documents/schema.graphql'],
  extensions: {
    codegen: {
      verbose: true,
      ignoreNoDocuments: true,
      externalDocuments: ['../test-documents/empty.graphql'],
      generates: {
        './gql/': {
          preset: 'client',
        },
      },
    },
  },
};
