import { StaticImageData } from 'next/image';
import angularIcon from './icons/angular.svg';
import apolloIcon from './icons/apollo.svg';
import codegenIcon from './icons/codegen.svg';
import csharpIcon from './icons/csharp.svg';
import dartIcon from './icons/dart.svg';
import flowIcon from './icons/flow.svg';
import graphqlIcon from './icons/graphql.svg';
import hasuraIcon from './icons/hasura.svg';
import javaIcon from './icons/java.svg';
import mongodbIcon from './icons/mongodb.png';
import nhostIcon from './icons/nhost.svg';
import nodeJsIcon from './icons/nodejs.svg';
import reactIcon from './icons/react.svg';
import reactQueryIcon from './icons/react-query.svg';
import typeGraphqlIcon from './icons/type-graphql.png';
import typescriptIcon from './icons/typescript.svg';
import urqlIcon from './icons/urql.svg';
import vueIcon from './icons/vue.svg';
import graphqlModulesIcon from './icons/graphql-modules.svg';
import mswIcon from './icons/msw.svg';
import reasonClientIcon from 'https://pbs.twimg.com/profile_images/1004185780313395200/ImZxrDWf_400x400.jpg';

const ALL_ICONS = [
  'graphql',
  'csharp',
  'flow',
  'codegen',
  'hasura',
  'java',
  'typescript',
  'angular',
  'apollo',
  'react_query',
  'type_graphql',
  'vue',
  'dart',
  'mongodb',
  'nhost',
  'graphql_modules',
  'reason_client',
  'msw',
  'nodejs',
  'react',
  'urql',
] as const;

export type Icon = (typeof ALL_ICONS)[number];

// TODO: These icons need to be swapped.
/* eslint sort-keys: error */
export const icons: Record<Icon, StaticImageData> = {
  angular: angularIcon,
  apollo: apolloIcon,
  codegen: codegenIcon,
  csharp: csharpIcon,
  dart: dartIcon,
  flow: flowIcon,
  graphql: graphqlIcon,
  graphql_modules: graphqlModulesIcon,
  hasura: hasuraIcon,
  java: javaIcon,
  mongodb: mongodbIcon,
  nhost: nhostIcon,
  msw: mswIcon,
  nodejs: nodeJsIcon,
  react: reactIcon,
  react_query: reactQueryIcon,
  reason_client: reasonClientIcon,
  type_graphql: typeGraphqlIcon,
  typescript: typescriptIcon,
  urql: urqlIcon,
  vue: vueIcon,
};
/* eslint-disable */

export const ALL_TAGS = [
  'preset',
  'plugin',
  'typescript',
  'csharp',
  'dart',
  'flutter',
  'flow',
  'java',
  'utilities',
  'mongodb',
  'nhost',
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
  'hasura',
  'validation',
  'yup',
  'zod',
] as const;

export type Tag = (typeof ALL_TAGS)[number];

export const PACKAGES: Record<
  string,
  {
    title: string;
    npmPackage: string;
    icon: Icon | `https://${string}`;
    tags: Tag[];
  }
> = {
  add: {
    title: 'Add',
    npmPackage: '@graphql-codegen/add',
    icon: 'graphql',
    tags: ['plugin'],
  },
  'c-sharp-operations': {
    title: 'C# Operations',
    npmPackage: '@graphql-codegen/c-sharp-operations',
    icon: 'csharp',
    tags: ['plugin', 'csharp'],
  },
  'flow-operations': {
    title: 'Flow Operations',
    npmPackage: '@graphql-codegen/flow-operations',
    icon: 'flow',
    tags: ['plugin', 'flow'],
  },
  'flow-resolvers': {
    title: 'Flow Resolvers',
    npmPackage: '@graphql-codegen/flow-resolvers',
    icon: 'flow',
    tags: ['plugin', 'flow'],
  },
  'fragment-matcher': {
    title: 'Fragment Matcher',
    npmPackage: '@graphql-codegen/fragment-matcher',
    icon: 'graphql',
    tags: ['plugin', 'apollo'],
  },
  'graphql-modules-preset': {
    title: 'GraphQL Modules Preset',
    npmPackage: '@graphql-codegen/graphql-modules-preset',
    icon: 'graphql_modules',
    tags: ['preset', 'utilities', 'resolvers'],
  },
  'hasura-allow-list': {
    title: 'Hasura Allow List',
    npmPackage: '@graphql-codegen/hasura-allow-list',
    icon: 'hasura',
    tags: ['plugin', 'utilities', 'hasura'],
  },
  'import-types-preset': {
    title: 'Import Types Preset',
    npmPackage: '@graphql-codegen/import-types-preset',
    icon: 'codegen',
    tags: ['preset', 'utilities'],
  },
  'preset-client': {
    title: 'Client preset',
    npmPackage: '@graphql-codegen/client-preset',
    icon: 'codegen',
    tags: ['preset', 'next', 'react', 'urql', 'typescript', 'vue'],
  },
  introspection: {
    title: 'Introspection',
    npmPackage: '@graphql-codegen/introspection',
    icon: 'graphql',
    tags: ['plugin', 'utilities'],
  },
  java: {
    title: 'Java',
    npmPackage: '@graphql-codegen/java',
    icon: 'java',
    tags: ['plugin', 'java'],
  },
  'java-apollo-android': {
    title: 'Java Apollo Android',
    npmPackage: '@graphql-codegen/java-apollo-android',
    icon: 'java',
    tags: ['plugin', 'java', 'apollo', 'android'],
  },
  'java-resolvers': {
    title: 'Java Resolvers',
    npmPackage: '@graphql-codegen/java-resolvers',
    icon: 'java',
    tags: ['plugin', 'java'],
  },
  jsdoc: {
    title: 'JSDoc',
    npmPackage: '@graphql-codegen/jsdoc',
    icon: 'graphql',
    tags: ['plugin', 'jsdoc'],
  },
  kotlin: {
    title: 'Kotlin',
    npmPackage: '@graphql-codegen/kotlin',
    icon: 'java',
    tags: ['plugin', 'java', 'kotlin'],
  },
  'named-operations-object': {
    title: 'Named Operations Object',
    npmPackage: '@graphql-codegen/named-operations-object',
    icon: 'typescript',
    tags: ['plugin', 'typescript'],
  },
  'near-operation-file-preset': {
    title: 'Near Operation File Preset',
    npmPackage: '@graphql-codegen/near-operation-file-preset',
    icon: 'codegen',
    tags: ['preset', 'utilities'],
  },
  'reason-client': {
    title: 'Reason Client',
    npmPackage: 'graphql-codegen-reason-client',
    icon: 'reason_client',
    tags: ['plugin', 'reason'],
  },
  'relay-operation-optimizer': {
    title: 'Relay Operation Optimizer',
    npmPackage: '@graphql-codegen/relay-operation-optimizer',
    icon: 'graphql',
    tags: ['plugin', 'relay'],
  },
  'schema-ast': {
    title: 'Schema AST',
    npmPackage: '@graphql-codegen/schema-ast',
    icon: 'graphql',
    tags: ['plugin', 'utilities'],
  },
  time: {
    title: 'Time',
    npmPackage: '@graphql-codegen/time',
    icon: 'graphql',
    tags: ['plugin', 'utilities'],
  },
  'typed-document-node': {
    title: 'TypedDocumentNode',
    npmPackage: '@graphql-codegen/typed-document-node',
    icon: 'typescript',
    tags: ['plugin', 'typescript'],
  },
  typescript: {
    title: 'TypeScript',
    npmPackage: '@graphql-codegen/typescript',
    icon: 'typescript',
    tags: ['plugin', 'typescript'],
  },
  'typescript-apollo-angular': {
    title: 'TypeScript Apollo Angular',
    npmPackage: '@graphql-codegen/typescript-apollo-angular',
    icon: 'angular',
    tags: ['plugin', 'typescript', 'apollo', 'angular'],
  },
  'typescript-apollo-client-helpers': {
    title: 'Apollo-Client Helpers',
    npmPackage: '@graphql-codegen/typescript-apollo-client-helpers',
    icon: 'typescript',
    tags: ['plugin', 'typescript', 'apollo'],
  },
  'typescript-apollo-next': {
    title: 'Typescript Apollo Next.js',
    npmPackage: 'graphql-codegen-apollo-next-ssr',
    icon: 'apollo',
    tags: ['plugin', 'typescript', 'apollo', 'next'],
  },
  'typescript-document-nodes': {
    title: 'TypeScript Document Nodes',
    npmPackage: '@graphql-codegen/typescript-document-nodes',
    icon: 'typescript',
    tags: ['plugin', 'typescript'],
  },
  'typescript-fabbrica': {
    title: 'TypeScript Mock Data Factory',
    npmPackage: '@mizdra/graphql-codegen-typescript-fabbrica',
    icon: 'typescript',
    tags: ['plugin', 'typescript'],
  },
  'typescript-generic-sdk': {
    title: 'TypeScript Generic SDK',
    npmPackage: '@graphql-codegen/typescript-generic-sdk',
    icon: 'typescript',
    tags: ['plugin', 'typescript'],
  },
  'typescript-graphql-files-modules': {
    title: 'TypeScript GraphQL Files Modules',
    npmPackage: '@graphql-codegen/typescript-graphql-files-modules',
    icon: 'typescript',
    tags: ['plugin', 'typescript'],
  },
  'typescript-graphql-request': {
    title: 'TypeScript GraphQL-Request',
    npmPackage: '@graphql-codegen/typescript-graphql-request',
    icon: 'typescript',
    tags: ['plugin', 'typescript'],
  },
  'typescript-mock-data': {
    title: 'TypeScript Mock Data',
    npmPackage: 'graphql-codegen-typescript-mock-data',
    icon: 'typescript',
    tags: ['plugin', 'typescript'],
  },
  'typescript-mongodb': {
    title: 'TypeScript MongoDB',
    npmPackage: '@graphql-codegen/typescript-mongodb',
    icon: 'mongodb',
    tags: ['plugin', 'typescript', 'mongodb'],
  },
  'typescript-nhost': {
    title: 'TypeScript Nhost',
    npmPackage: '@graphql-codegen/typescript-nhost',
    icon: 'nhost',
    tags: ['plugin', 'typescript', 'nhost'],
  },
  'typescript-msw': {
    title: 'TypeScript Msw',
    npmPackage: '@graphql-codegen/typescript-msw',
    icon: 'msw',
    tags: ['plugin', 'typescript', 'utilities'],
  },
  'typescript-oclif': {
    title: 'TypeScript Oclif',
    npmPackage: '@graphql-codegen/typescript-oclif',
    icon: 'typescript',
    tags: ['plugin', 'typescript'],
  },
  'typescript-operations': {
    title: 'TypeScript Operations',
    npmPackage: '@graphql-codegen/typescript-operations',
    icon: 'typescript',
    tags: ['plugin', 'typescript'],
  },
  'typescript-react-apollo': {
    title: 'TypeScript React Apollo',
    npmPackage: '@graphql-codegen/typescript-react-apollo',
    icon: 'apollo',
    tags: ['plugin', 'typescript', 'react', 'apollo'],
  },
  'typescript-react-query': {
    title: 'TypeScript React-Query',
    npmPackage: '@graphql-codegen/typescript-react-query',
    icon: 'react_query',
    tags: ['plugin', 'typescript', 'react'],
  },
  'typescript-resolvers': {
    title: 'TypeScript Resolvers',
    npmPackage: '@graphql-codegen/typescript-resolvers',
    icon: 'typescript',
    tags: ['plugin', 'typescript'],
  },
  'typescript-rtk-query': {
    title: 'TypeScript RTK-Query',
    npmPackage: '@graphql-codegen/typescript-rtk-query',
    icon: 'typescript',
    tags: ['plugin', 'typescript', 'react'],
  },
  'typescript-stencil-apollo': {
    title: 'TypeScript Stencil Apollo',
    npmPackage: '@graphql-codegen/typescript-stencil-apollo',
    icon: 'apollo',
    tags: ['plugin', 'typescript', 'apollo'],
  },
  'typescript-svelte-apollo': {
    title: 'TypeScript Svelte Apollo',
    npmPackage: 'graphql-codegen-svelte-apollo',
    icon: 'apollo',
    tags: ['plugin', 'typescript', 'svelte', 'apollo'],
  },
  'typescript-type-graphql': {
    title: 'TypeScript TypeGraphQL',
    npmPackage: '@graphql-codegen/typescript-type-graphql',
    icon: 'type_graphql',
    tags: ['plugin', 'typescript'],
  },
  'typescript-urql': {
    title: 'TypeScript Urql',
    npmPackage: '@graphql-codegen/typescript-urql',
    icon: 'typescript',
    tags: ['plugin', 'typescript', 'urql', 'react'],
  },
  'typescript-validation-schema': {
    title: 'TypeScript Validation Schema',
    npmPackage: 'graphql-codegen-typescript-validation-schema',
    icon: 'graphql',
    tags: ['plugin', 'validation', 'yup', 'zod', 'typescript'],
  },
  'typescript-vue-apollo': {
    title: 'TypeScript Vue Apollo Composition API',
    npmPackage: '@graphql-codegen/typescript-vue-apollo',
    icon: 'vue',
    tags: ['plugin', 'typescript', 'vue', 'apollo'],
  },
  'typescript-vue-apollo-smart-ops': {
    title: 'TypeScript Vue Apollo Smart Operations',
    npmPackage: '@graphql-codegen/typescript-vue-apollo-smart-ops',
    icon: 'vue',
    tags: ['plugin', 'typescript', 'vue', 'apollo'],
  },
  'typescript-vue-urql': {
    title: 'TypeScript Vue Urql',
    npmPackage: '@graphql-codegen/typescript-vue-urql',
    icon: 'vue',
    tags: ['plugin', 'typescript', 'vue', 'urql'],
  },
  'urql-introspection': {
    title: 'Urql Introspection for Schema Awareness',
    npmPackage: '@graphql-codegen/urql-introspection',
    icon: 'graphql',
    tags: ['plugin', 'urql', 'typescript'],
  },
  'flutter-freezed': {
    title: 'Dart Flutter Freezed Classes',
    npmPackage: '@graphql-codegen/flutter-freezed',
    icon: 'dart',
    tags: ['plugin', 'dart', 'flutter'],
  },
};
