/** @type {import('graphql-config').IGraphQLConfig } */
module.exports = {
  schema: ['../test-documents/schema.graphql'],
  documents: ['../test-documents/empty.graphql'],
  extensions: {
    codegen: {
      verbose: true,
      generates: {
        './gql/': {
          preset: 'client',
        },
      },
    },
  },
};
