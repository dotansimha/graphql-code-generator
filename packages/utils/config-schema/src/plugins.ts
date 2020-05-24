export type PluginConfig = { file: string; identifier: string; pluginName: string; link?: string };

export const relevantConfigurations: PluginConfig[] = [
  {
    file: '../../plugins/typescript/typescript/src/config.ts',
    identifier: 'TypeScriptPluginConfig',
    pluginName: 'typescript',
  },
  {
    file: '../../plugins/typescript/operations/src/config.ts',
    identifier: 'TypeScriptDocumentsPluginConfig',
    pluginName: 'typescript-operations',
  },
  {
    file: '../../plugins/c-sharp/c-sharp/src/config.ts',
    identifier: 'CSharpResolversPluginRawConfig',
    pluginName: 'c-sharp',
  },
  {
    file: '../../plugins/c-sharp/c-sharp-operations/src/config.ts',
    identifier: 'CSharpOperationsRawPluginConfig',
    pluginName: 'c-sharp-operations',
  },
  {
    file: '../../plugins/other/schema-ast/src/index.ts',
    identifier: 'SchemaASTConfig',
    pluginName: 'schema-ast',
  },
  {
    file: '../..//plugins/typescript/type-graphql/src/config.ts',
    identifier: 'TypeGraphQLPluginConfig',
    pluginName: 'typescript-type-graphql',
  },
  {
    file: '../../plugins/typescript/graphql-files-modules/src/index.ts',
    identifier: 'TypeScriptFilesModulesPluginConfig',
    pluginName: 'typescript-graphql-files-modules',
  },
  {
    file: '../../plugins/typescript/named-operations-object/src/index.ts',
    identifier: 'NamedOperationsObjectPluginConfig',
    pluginName: 'named-operations-object',
  },
  {
    file: '../../plugins/typescript/graphql-request/src/config.ts',
    identifier: 'RawGraphQLRequestPluginConfig',
    pluginName: 'typescript-graphql-request',
  },
  {
    file: '../../plugins/typescript/compatibility/src/config.ts',
    identifier: 'CompatibilityPluginRawConfig',
    pluginName: 'typescript-compatibility',
  },
  {
    file: '../../plugins/typescript/mongodb/src/config.ts',
    identifier: 'TypeScriptMongoPluginConfig',
    pluginName: 'typescript-mongodb',
  },
  {
    file: '../../plugins/typescript/resolvers/src/config.ts',
    identifier: 'TypeScriptResolversPluginConfig',
    pluginName: 'typescript-resolvers',
  },
  {
    file: '../../plugins/typescript/apollo-angular/src/config.ts',
    identifier: 'ApolloAngularRawPluginConfig',
    pluginName: 'typescript-apollo-angular',
  },
  {
    file: '../../plugins/typescript/urql/src/config.ts',
    identifier: 'UrqlRawPluginConfig',
    pluginName: 'typescript-urql',
  },
  {
    file: '../../plugins/typescript/react-apollo/src/config.ts',
    identifier: 'ReactApolloRawPluginConfig',
    pluginName: 'typescript-react-apollo',
  },
  {
    file: '../../plugins/typescript/vue-apollo/src/config.ts',
    identifier: 'VueApolloRawPluginConfig',
    pluginName: 'typescript-vue-apollo',
  },
  {
    file: '../../plugins/typescript/stencil-apollo/src/config.ts',
    identifier: 'StencilApolloRawPluginConfig',
    pluginName: 'typescript-stencil-apollo',
  },
  {
    file: '../../plugins/typescript/document-nodes/src/index.ts',
    identifier: 'TypeScriptDocumentNodesRawPluginConfig',
    pluginName: 'typescript-document-nodes',
  },
  {
    file: '../../plugins/java/apollo-android/src/plugin.ts',
    identifier: 'JavaApolloAndroidPluginConfig',
    pluginName: 'java-apollo-android',
  },
  {
    file: '../../plugins/java/resolvers/src/config.ts',
    identifier: 'JavaResolversPluginRawConfig',
    pluginName: 'java-resolvers',
  },
  {
    file: '../../plugins/java/java/src/config.ts',
    identifier: 'JavaResolversPluginRawConfig',
    pluginName: 'java',
  },
  {
    file: '../../plugins/java/kotlin/src/config.ts',
    identifier: 'KotlinResolversPluginRawConfig',
    pluginName: 'kotlin',
  },
  {
    file: '../../plugins/flow/flow/src/config.ts',
    identifier: 'FlowPluginConfig',
    pluginName: 'flow',
  },
  {
    file: '../../plugins/flow/resolvers/src/index.ts',
    identifier: 'RawFlowResolversConfig',
    pluginName: 'flow-resolvers',
  },
  {
    file: '../../plugins/flow/operations/src/config.ts',
    identifier: 'FlowDocumentsPluginConfig',
    pluginName: 'flow-operations',
  },
  {
    file: '../../plugins/other/introspection/src/index.ts',
    identifier: 'IntrospectionPluginConfig',
    pluginName: 'introspection',
  },
  {
    file: '../../plugins/other/fragment-matcher/src/index.ts',
    identifier: 'FragmentMatcherConfig',
    pluginName: 'fragment-matcher',
  },
];
