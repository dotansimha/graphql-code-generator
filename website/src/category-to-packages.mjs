/*
  Used to determine right category folder in plugin hub and for redirect legacy links in next.config#redirects
 */
export const CategoryToPackages = {
  'c-sharp': ['c-sharp-operations'],
  flow: ['flow-operations', 'flow-resolvers'],
  java: ['java', 'java-apollo-android', 'java-resolvers', 'kotlin'],
  other: [
    'urql-introspection',
    'time',
    'schema-ast',
    'reason-client',
    'jsdoc',
    'introspection',
    'hasura-allow-list',
    'fragment-matcher',
    'add',
  ],
  presets: ['near-operation-file-preset', 'import-types-preset', 'graphql-modules-preset', 'gql-tag-operations-preset'],
  typescript: [
    'named-operations-object',
    'relay-operation-optimizer',
    'typed-document-node',
    'typescript',
    'typescript-apollo-angular',
    'typescript-apollo-client-helpers',
    'typescript-apollo-next',
    'typescript-document-nodes',
    'typescript-generic-sdk',
    'typescript-graphql-files-modules',
    'typescript-graphql-request',
    'typescript-mongodb',
    'typescript-msw',
    'typescript-oclif',
    'typescript-operations',
    'typescript-react-apollo',
    'typescript-react-query',
    'typescript-resolvers',
    'typescript-rtk-query',
    'typescript-stencil-apollo',
    'typescript-svelte-apollo',
    'typescript-type-graphql',
    'typescript-urql',
    'typescript-validation-schema',
    'typescript-vue-apollo',
    'typescript-vue-apollo-smart-ops',
    'typescript-vue-urql',
  ],
};
