module.exports = {
  sidebar: {
    'Getting Started': [
      'getting-started/index',
      'getting-started/installation',
      {
        type: 'category',
        label: 'Config Reference',
        items: [
          'getting-started/codegen-config',
          'getting-started/schema-field',
          'getting-started/documents-field',
          'getting-started/config-field',
          'getting-started/require-field',
          'getting-started/naming-convention',
          'getting-started/lifecycle-hooks',
        ],
      },
      'getting-started/development-workflow',
      'getting-started/programmatic-usage',
      'getting-started/further-reading',
    ],
    Plugins: [
      'plugins/index',
      {
        type: 'category',
        label: 'TypeScript',
        items: [
          'plugins/typescript',
          'plugins/typescript-operations',
          'plugins/typescript-resolvers',
          'plugins/typed-document-node',
          'plugins/typescript-apollo-client-helpers',
          'plugins/typescript-graphql-request',
          'plugins/typescript-generic-sdk',
          'plugins/typescript-react-query',
          'plugins/typescript-react-apollo',
          'plugins/typescript-svelte-apollo',
          'plugins/typescript-vue-apollo',
          'plugins/typescript-vue-apollo-smart-ops',
          'plugins/typescript-apollo-angular',
          'plugins/typescript-stencil-apollo',
          'plugins/typescript-rtk-query',
          'plugins/typescript-graphql-files-modules',
          'plugins/typescript-document-nodes',
          'plugins/typescript-mongodb',
          'plugins/typescript-urql',
          'plugins/typescript-vue-urql',
          'plugins/typescript-oclif',
          'plugins/named-operations-object',
          'plugins/typescript-type-graphql',
          'plugins/typescript-apollo-next',
          'plugins/typescript-msw',
        ],
      },
      {
        type: 'category',
        label: 'Flow',
        items: ['plugins/flow', 'plugins/flow-resolvers', 'plugins/flow-operations'],
      },
      {
        type: 'category',
        label: 'Reason',
        items: ['plugins/reason-client'],
      },
      {
        type: 'category',
        label: 'Java',
        items: ['plugins/kotlin', 'plugins/java', 'plugins/java-resolvers', 'plugins/java-apollo-android'],
      },
      {
        type: 'category',
        label: '.NET',
        items: ['plugins/c-sharp', 'plugins/c-sharp-operations'],
      },
      {
        type: 'category',
        label: 'Utilities',
        items: [
          'plugins/fragment-matcher',
          'plugins/urql-introspection',
          'plugins/introspection',
          'plugins/schema-ast',
          'plugins/jsdoc',
          'plugins/add',
          'plugins/time',
          'plugins/relay-operation-optimizer',
        ],
      },
    ],
    Presets: [
      'presets/presets-index',
      'presets/gql-tag-operations',
      'presets/near-operation-file',
      'presets/import-types',
      'presets/graphql-modules',
    ],
    Integrations: [
      'integrations/apollo-local-state',
      'integrations/create-react-app',
      'integrations/gatsby',
      'integrations/prettier',
      'integrations/federation',
      'integrations/vscode',
    ],
    'Custom Plugins': [
      'custom-codegen/index',
      'custom-codegen/write-your-plugin',
      'custom-codegen/validate-configuration',
      'custom-codegen/extend-schema',
      'custom-codegen/using-visitor',
      'custom-codegen/contributing',
    ],
    'Migration Guides': ['migration/from-0-18', 'migration/from-0-13'],
  },
};
