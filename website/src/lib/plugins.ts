export const ALL_TAGS = [
  'typescript',
  'csharp',
  'flow',
  'java',
  'utilities',
  'mongodb',
  'angular',
  'react',
  'svelte',
  'next',
  'apollo',
  'urql',
  'vue',
  'kotlin',
  'android',
  'reason',
  'relay',
  'jsdoc',
  'resolvers',
  'plugin',
  'preset',
  'hasura',
  'validation',
  'yup',
  'zod',
] as const;

export type Tags = typeof ALL_TAGS[number];

export const PACKAGES: Record<
  string,
  {
    title: string;
    npmPackage: string;
    iconUrl: string;
    tags: Tags[];
  }
> = {
  add: {
    title: 'Add',
    npmPackage: '@graphql-codegen/add',
    iconUrl: '/assets/img/icons/graphql.svg',
    tags: ['plugin'],
  },
  'c-sharp-operations': {
    title: 'C# Operations',
    npmPackage: '@graphql-codegen/c-sharp-operations',
    iconUrl: '/assets/img/icons/csharp.svg',
    tags: ['plugin', 'csharp'],
  },
  'flow-operations': {
    title: 'Flow Operations',
    npmPackage: '@graphql-codegen/flow-operations',
    iconUrl: '/assets/img/icons/flow.svg',
    tags: ['plugin', 'flow'],
  },
  'flow-resolvers': {
    title: 'Flow Resolvers',
    npmPackage: '@graphql-codegen/flow-resolvers',
    iconUrl: '/assets/img/icons/flow.svg',
    tags: ['plugin', 'flow'],
  },
  'fragment-matcher': {
    title: 'Fragment Matcher',
    npmPackage: '@graphql-codegen/fragment-matcher',
    iconUrl: '/assets/img/icons/graphql.svg',
    tags: ['plugin', 'apollo'],
  },
  'gql-tag-operations-preset': {
    title: 'Gql Tag Operations Preset',
    npmPackage: '@graphql-codegen/gql-tag-operations-preset',
    iconUrl: '/assets/img/icons/codegen.svg',
    tags: ['preset', 'utilities', 'typescript'],
  },
  'graphql-modules-preset': {
    title: 'GraphQL Modules Preset',
    npmPackage: '@graphql-codegen/graphql-modules-preset',
    iconUrl: 'https://graphql-modules.com/assets/subheader-logo.svg',
    tags: ['preset', 'utilities', 'resolvers'],
  },
  'hasura-allow-list': {
    title: 'Hasura Allow List',
    npmPackage: '@graphql-codegen/hasura-allow-list',
    iconUrl: '/assets/img/icons/hasura.svg',
    tags: ['plugin', 'utilities', 'hasura'],
  },
  'import-types-preset': {
    title: 'Import Types Preset',
    npmPackage: '@graphql-codegen/import-types-preset',
    iconUrl: '/assets/img/icons/codegen.svg',
    tags: ['preset', 'utilities'],
  },
  introspection: {
    title: 'Introspection',
    npmPackage: '@graphql-codegen/introspection',
    iconUrl: '/assets/img/icons/graphql.svg',
    tags: ['plugin', 'utilities'],
  },
  java: {
    title: 'Java',
    npmPackage: '@graphql-codegen/java',
    iconUrl: '/assets/img/icons/java.svg',
    tags: ['plugin', 'java'],
  },
  'java-apollo-android': {
    title: 'Java Apollo Android',
    npmPackage: '@graphql-codegen/java-apollo-android',
    iconUrl: '/assets/img/icons/java.svg',
    tags: ['plugin', 'java', 'apollo', 'android'],
  },
  'java-resolvers': {
    title: 'Java Resolvers',
    npmPackage: '@graphql-codegen/java-resolvers',
    iconUrl: '/assets/img/icons/java.svg',
    tags: ['plugin', 'java'],
  },
  jsdoc: {
    title: 'JSDoc',
    npmPackage: '@graphql-codegen/jsdoc',
    iconUrl: '/assets/img/icons/graphql.svg',
    tags: ['plugin', 'jsdoc'],
  },
  kotlin: {
    title: 'Kotlin',
    npmPackage: '@graphql-codegen/kotlin',
    iconUrl: '/assets/img/icons/java.svg',
    tags: ['plugin', 'java', 'kotlin'],
  },
  'named-operations-object': {
    title: 'Named Operations Object',
    npmPackage: '@graphql-codegen/named-operations-object',
    iconUrl: '/assets/img/icons/typescript.svg',
    tags: ['plugin', 'typescript'],
  },
  'near-operation-file-preset': {
    title: 'Near Operation File Preset',
    npmPackage: '@graphql-codegen/near-operation-file-preset',
    iconUrl: '/assets/img/icons/codegen.svg',
    tags: ['preset', 'utilities'],
  },
  'reason-client': {
    title: 'Reason Client',
    npmPackage: 'graphql-codegen-reason-client',
    iconUrl: 'https://pbs.twimg.com/profile_images/1004185780313395200/ImZxrDWf_400x400.jpg',
    tags: ['plugin', 'reason'],
  },
  'relay-operation-optimizer': {
    title: 'Relay Operation Optimizer',
    npmPackage: '@graphql-codegen/relay-operation-optimizer',
    iconUrl: '/assets/img/icons/graphql.svg',
    tags: ['plugin', 'relay'],
  },
  'schema-ast': {
    title: 'Schema AST',
    npmPackage: '@graphql-codegen/schema-ast',
    iconUrl: '/assets/img/icons/graphql.svg',
    tags: ['plugin', 'utilities'],
  },
  time: {
    title: 'Time',
    npmPackage: '@graphql-codegen/time',
    iconUrl: '/assets/img/icons/graphql.svg',
    tags: ['plugin', 'utilities'],
  },
  'typed-document-node': {
    title: 'TypedDocumentNode',
    npmPackage: '@graphql-codegen/typed-document-node',
    iconUrl: '/assets/img/icons/typescript.svg',
    tags: ['plugin', 'typescript'],
  },
  typescript: {
    title: 'TypeScript',
    npmPackage: '@graphql-codegen/typescript',
    iconUrl: '/assets/img/icons/typescript.svg',
    tags: ['plugin', 'typescript'],
  },
  'typescript-apollo-angular': {
    title: 'TypeScript Apollo Angular',
    npmPackage: '@graphql-codegen/typescript-apollo-angular',
    iconUrl: '/assets/img/icons/angular.svg',
    tags: ['plugin', 'typescript', 'apollo', 'angular'],
  },
  'typescript-apollo-client-helpers': {
    title: 'Apollo-Client Helpers',
    npmPackage: '@graphql-codegen/typescript-apollo-client-helpers',
    iconUrl: '/assets/img/icons/typescript.svg',
    tags: ['plugin', 'typescript', 'apollo'],
  },
  'typescript-apollo-next': {
    title: 'Typescript Apollo Next.js',
    npmPackage: 'graphql-codegen-apollo-next-ssr',
    iconUrl: '/assets/img/icons/apollo.svg',
    tags: ['plugin', 'typescript', 'apollo', 'next'],
  },
  'typescript-document-nodes': {
    title: 'TypeScript Document Nodes',
    npmPackage: '@graphql-codegen/typescript-document-nodes',
    iconUrl: '/assets/img/icons/typescript.svg',
    tags: ['plugin', 'typescript'],
  },
  'typescript-generic-sdk': {
    title: 'TypeScript Generic SDK',
    npmPackage: '@graphql-codegen/typescript-generic-sdk',
    iconUrl: '/assets/img/icons/typescript.svg',
    tags: ['plugin', 'typescript'],
  },
  'typescript-graphql-files-modules': {
    title: 'TypeScript GraphQL Files Modules',
    npmPackage: '@graphql-codegen/typescript-graphql-files-modules',
    iconUrl: '/assets/img/icons/typescript.svg',
    tags: ['plugin', 'typescript'],
  },
  'typescript-graphql-request': {
    title: 'TypeScript GraphQL-Request',
    npmPackage: '@graphql-codegen/typescript-graphql-request',
    iconUrl: '/assets/img/icons/typescript.svg',
    tags: ['plugin', 'typescript'],
  },
  'typescript-mongodb': {
    title: 'TypeScript MongoDB',
    npmPackage: '@graphql-codegen/typescript-mongodb',
    iconUrl: '/assets/img/icons/mongodb.png',
    tags: ['plugin', 'typescript', 'mongodb'],
  },
  'typescript-msw': {
    title: 'TypeScript Msw',
    npmPackage: '@graphql-codegen/typescript-msw',
    iconUrl: 'https://raw.githubusercontent.com/mswjs/msw/HEAD/media/msw-logo.svg',
    tags: ['plugin', 'typescript', 'utilities'],
  },
  'typescript-oclif': {
    title: 'TypeScript Oclif',
    npmPackage: '@graphql-codegen/typescript-oclif',
    iconUrl: '/assets/img/icons/typescript.svg',
    tags: ['plugin', 'typescript'],
  },
  'typescript-operations': {
    title: 'TypeScript Operations',
    npmPackage: '@graphql-codegen/typescript-operations',
    iconUrl: '/assets/img/icons/typescript.svg',
    tags: ['plugin', 'typescript'],
  },
  'typescript-react-apollo': {
    title: 'TypeScript React Apollo',
    npmPackage: '@graphql-codegen/typescript-react-apollo',
    iconUrl: '/assets/img/icons/apollo.svg',
    tags: ['plugin', 'typescript', 'react', 'apollo'],
  },
  'typescript-react-query': {
    title: 'TypeScript React-Query',
    npmPackage: '@graphql-codegen/typescript-react-query',
    iconUrl: '/assets/img/icons/react-query.svg',
    tags: ['plugin', 'typescript', 'react'],
  },
  'typescript-resolvers': {
    title: 'TypeScript Resolvers',
    npmPackage: '@graphql-codegen/typescript-resolvers',
    iconUrl: '/assets/img/icons/typescript.svg',
    tags: ['plugin', 'typescript'],
  },
  'typescript-rtk-query': {
    title: 'TypeScript RTK-Query',
    npmPackage: '@graphql-codegen/typescript-rtk-query',
    iconUrl: '/assets/img/icons/typescript.svg',
    tags: ['plugin', 'typescript', 'react'],
  },
  'typescript-stencil-apollo': {
    title: 'TypeScript Stencil Apollo',
    npmPackage: '@graphql-codegen/typescript-stencil-apollo',
    iconUrl: '/assets/img/icons/apollo.svg',
    tags: ['plugin', 'typescript', 'apollo'],
  },
  'typescript-svelte-apollo': {
    title: 'TypeScript Svelte Apollo',
    npmPackage: 'graphql-codegen-svelte-apollo',
    iconUrl: '/assets/img/icons/apollo.svg',
    tags: ['plugin', 'typescript', 'svelte', 'apollo'],
  },
  'typescript-type-graphql': {
    title: 'TypeScript TypeGraphQL',
    npmPackage: '@graphql-codegen/typescript-type-graphql',
    iconUrl: '/assets/img/icons/type-graphql.png',
    tags: ['plugin', 'typescript'],
  },
  'typescript-urql': {
    title: 'TypeScript Urql',
    npmPackage: '@graphql-codegen/typescript-urql',
    iconUrl: '/assets/img/icons/typescript.svg',
    tags: ['plugin', 'typescript', 'urql', 'react'],
  },
  'typescript-validation-schema': {
    title: 'TypeScript Validation Schema',
    npmPackage: 'graphql-codegen-typescript-validation-schema',
    iconUrl: '/assets/img/icons/graphql.svg',
    tags: ['plugin', 'validation', 'yup', 'zod', 'typescript'],
  },
  'typescript-vue-apollo': {
    title: 'TypeScript Vue Apollo Composition API',
    npmPackage: '@graphql-codegen/typescript-vue-apollo',
    iconUrl: '/assets/img/icons/vue.svg',
    tags: ['plugin', 'typescript', 'vue', 'apollo'],
  },
  'typescript-vue-apollo-smart-ops': {
    title: 'TypeScript Vue Apollo Smart Operations',
    npmPackage: '@graphql-codegen/typescript-vue-apollo-smart-ops',
    iconUrl: '/assets/img/icons/vue.svg',
    tags: ['plugin', 'typescript', 'vue', 'apollo'],
  },
  'typescript-vue-urql': {
    title: 'TypeScript Vue Urql',
    npmPackage: '@graphql-codegen/typescript-vue-urql',
    iconUrl: '/assets/img/icons/vue.svg',
    tags: ['plugin', 'typescript', 'vue', 'urql'],
  },
  'urql-introspection': {
    title: 'Urql Introspection for Schema Awareness',
    npmPackage: '@graphql-codegen/urql-introspection',
    iconUrl: '/assets/img/icons/graphql.svg',
    tags: ['plugin', 'urql', 'typescript'],
  },
};
