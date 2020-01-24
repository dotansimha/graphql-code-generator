export const pluginLoaderMap: { [name: string]: () => any } = {
  java: () => import('@graphql-codegen/java'),
  'java-resolvers': () => import('@graphql-codegen/java-resolvers'),
  'fragment-matcher': () => import('@graphql-codegen/fragment-matcher'),
  flow: () => import('@graphql-codegen/flow'),
  'flow-operations': () => import('@graphql-codegen/flow-operations'),
  'flow-resolvers': () => import('@graphql-codegen/flow-resolvers'),
  typescript: () => import('@graphql-codegen/typescript'),
  'typescript-compatibility': () => import('@graphql-codegen/typescript-compatibility'),
  'typescript-operations': () => import('@graphql-codegen/typescript-operations'),
  'typescript-resolvers': () => import('@graphql-codegen/typescript-resolvers'),
  'typescript-apollo-angular': () => import('@graphql-codegen/typescript-apollo-angular'),
  'typescript-react-apollo': () => import('@graphql-codegen/typescript-react-apollo'),
  'typescript-vue-apollo': () => import('@graphql-codegen/typescript-vue-apollo'),
  'typescript-stencil-apollo': () => import('@graphql-codegen/typescript-stencil-apollo'),
  'typescript-graphql-files-modules': () => import('@graphql-codegen/typescript-graphql-files-modules'),
  'typescript-mongodb': () => import('@graphql-codegen/typescript-mongodb'),
  'typescript-urql': () => import('@graphql-codegen/typescript-urql'),
  add: () => import('@graphql-codegen/add'),
  time: () => import('@graphql-codegen/time'),
  introspection: () => import('@graphql-codegen/introspection'),
  'schema-ast': () => import('@graphql-codegen/schema-ast'),
};
