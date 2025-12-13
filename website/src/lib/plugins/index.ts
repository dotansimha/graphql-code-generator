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

export { PACKAGES } from './packages';

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
