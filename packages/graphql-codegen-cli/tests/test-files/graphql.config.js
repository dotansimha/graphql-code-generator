/** @type {import('graphql-config').IGraphQLConfig } */
module.exports = {
  generates: {},
  projects: {
    prj1: {
      schema: ['**/test-documents/schema.graphql'],
      documents: ['**/test-documents/valid.graphql'],
      extensions: {
        codegen: {
          generates: {
            'graphqlTypes.ts': {
              schema: ['**/test-documents/schema.graphql'],
              documents: ['**/test-documents/valid.graphql'],
              plugins: ['typed-document-node'],
            },
          },
        },
      },
    },
  },
};
