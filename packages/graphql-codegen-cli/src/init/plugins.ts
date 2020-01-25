import { italic } from './helpers';
import { PluginOption, Tags } from './types';

export const plugins: Array<PluginOption> = [
  {
    name: `TypeScript ${italic('(required by other typescript plugins)')}`,
    package: '@graphql-codegen/typescript',
    value: 'typescript',
    pathInRepo: 'typescript/typescript',
    available: hasTag(Tags.typescript),
    shouldBeSelected: tags => oneOf(tags, Tags.angular, Tags.stencil) || allOf(tags, Tags.typescript, Tags.react) || noneOf(tags, Tags.flow),
    defaultExtension: '.ts',
  },
  {
    name: `TypeScript Operations ${italic('(operations and fragments)')}`,
    package: '@graphql-codegen/typescript-operations',
    value: 'typescript-operations',
    pathInRepo: 'typescript/operations',
    available: tags => allOf(tags, Tags.browser, Tags.typescript),
    shouldBeSelected: tags => oneOf(tags, Tags.angular, Tags.stencil) || allOf(tags, Tags.typescript, Tags.react),
    defaultExtension: '.ts',
  },
  {
    name: `TypeScript Resolvers ${italic('(strongly typed resolve functions)')}`,
    package: '@graphql-codegen/typescript-resolvers',
    value: 'typescript-resolvers',
    pathInRepo: 'typescript/resolvers',
    available: tags => allOf(tags, Tags.node, Tags.typescript),
    shouldBeSelected: tags => noneOf(tags, Tags.flow),
    defaultExtension: '.ts',
  },
  {
    name: `Flow ${italic('(required by other flow plugins)')}`,
    package: '@graphql-codegen/flow',
    value: 'flow',
    pathInRepo: 'flow/flow',
    available: hasTag(Tags.flow),
    shouldBeSelected: tags => noneOf(tags, Tags.typescript),
    defaultExtension: '.js',
  },
  {
    name: `Flow Operations ${italic('(operations and fragments)')}`,
    package: '@graphql-codegen/flow-operations',
    value: 'flow-operations',
    pathInRepo: 'flow/operations',
    available: tags => allOf(tags, Tags.browser, Tags.flow),
    shouldBeSelected: tags => noneOf(tags, Tags.typescript),
    defaultExtension: '.js',
  },
  {
    name: `Flow Resolvers ${italic('(strongly typed resolve functions)')}`,
    package: '@graphql-codegen/flow-resolvers',
    value: 'flow-resolvers',
    pathInRepo: 'flow/resolvers',
    available: tags => allOf(tags, Tags.node, Tags.flow),
    shouldBeSelected: tags => noneOf(tags, Tags.typescript),
    defaultExtension: '.js',
  },
  {
    name: `TypeScript Apollo Angular ${italic('(typed GQL services)')}`,
    package: '@graphql-codegen/typescript-apollo-angular',
    value: 'typescript-apollo-angular',
    pathInRepo: 'typescript/apollo-angular',
    available: hasTag(Tags.angular),
    shouldBeSelected: () => true,
    defaultExtension: '.js',
  },
  {
    name: `TypeScript Vue Apollo ${italic('(typed composition functions)')}`,
    package: '@graphql-codegen/typescript-vue-apollo',
    value: 'typescript-vue-apollo',
    pathInRepo: 'typescript/vue-apollo',
    available: tags => allOf(tags, Tags.vue, Tags.typescript),
    shouldBeSelected: () => true,
    defaultExtension: '.ts',
  },
  {
    name: `TypeScript React Apollo ${italic('(typed components and HOCs)')}`,
    package: '@graphql-codegen/typescript-react-apollo',
    value: 'typescript-react-apollo',
    pathInRepo: 'typescript/react-apollo',
    available: tags => allOf(tags, Tags.react, Tags.typescript),
    shouldBeSelected: () => true,
    defaultExtension: '.tsx',
  },
  {
    name: `TypeScript Stencil Apollo ${italic('(typed components)')}`,
    package: '@graphql-codegen/typescript-stencil-apollo',
    value: 'typescript-stencil-apollo',
    pathInRepo: 'typescript/stencil-apollo',
    available: hasTag(Tags.stencil),
    shouldBeSelected: () => true,
    defaultExtension: '.tsx',
  },
  {
    name: `TypeScript MongoDB ${italic('(typed MongoDB objects)')}`,
    package: '@graphql-codegen/typescript-mongodb',
    value: 'typescript-mongodb',
    pathInRepo: 'typescript/mongodb',
    available: tags => allOf(tags, Tags.node, Tags.typescript),
    shouldBeSelected: () => false,
    defaultExtension: '.ts',
  },
  {
    name: `TypeScript GraphQL files modules ${italic('(declarations for .graphql files)')}`,
    package: '@graphql-codegen/typescript-graphql-files-modules',
    value: 'typescript-graphql-files-modules',
    pathInRepo: 'typescript/graphql-files-modules',
    available: tags => allOf(tags, Tags.browser, Tags.typescript),
    shouldBeSelected: () => false,
    defaultExtension: '.ts',
  },
  {
    name: `TypeScript GraphQL document nodes ${italic('(embedded GraphQL document)')}`,
    package: '@graphql-codegen/typescript-document-nodes',
    value: 'typescript-document-nodes',
    pathInRepo: 'typescript/document-nodes',
    available: tags => allOf(tags, Tags.typescript),
    shouldBeSelected: () => false,
    defaultExtension: '.ts',
  },
  {
    name: `Introspection Fragment Matcher ${italic('(for Apollo Client)')}`,
    package: '@graphql-codegen/fragment-matcher',
    value: 'fragment-matcher',
    pathInRepo: 'other/fragment-matcher',
    available: hasTag(Tags.browser),
    shouldBeSelected: () => false,
    defaultExtension: '.ts',
  },
];

function hasTag(tag: Tags) {
  return (tags: Tags[]) => tags.includes(tag);
}

function oneOf<T>(list: T[], ...items: T[]): boolean {
  return list.some(i => items.includes(i));
}

function noneOf<T>(list: T[], ...items: T[]): boolean {
  return !list.some(i => items.includes(i));
}

function allOf<T>(list: T[], ...items: T[]): boolean {
  return items.every(i => list.includes(i));
}
