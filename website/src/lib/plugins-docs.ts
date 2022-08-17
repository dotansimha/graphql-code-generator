export type PluginConfig = { file: string; identifier: string; name: string };
export type PresetConfig = { file: string; identifier: string; name: string };

export const presetsConfigurations: PresetConfig[] = [
  {
    file: '../packages/presets/graphql-modules/src/config.ts',
    identifier: 'ModulesConfig',
    name: 'graphql-modules-preset',
  },
  {
    file: '../packages/presets/near-operation-file/src/index.ts',
    identifier: 'NearOperationFileConfig',
    name: 'near-operation-file-preset',
  },
  {
    file: '../packages/presets/import-types/src/index.ts',
    identifier: 'ImportTypesConfig',
    name: 'import-types-preset',
  },
  {
    file: '../packages/presets/gql-tag-operations/src/index.ts',
    identifier: 'GqlTagConfig',
    name: 'gql-tag-operations-preset',
  },
];

export const pluginsConfigurations: PluginConfig[] = [
  {
    file: '../packages/plugins/dart/flutter-freezed/src/config.ts',
    identifier: 'FlutterFreezedPluginConfig',
    name: 'flutter-freezed',
  },
  {
    file: '../packages/plugins/typescript/react-query/src/config.ts',
    identifier: 'ReactQueryRawPluginConfig',
    name: 'typescript-react-query',
  },
  {
    file: '../packages/plugins/typescript/rtk-query/src/config.ts',
    identifier: 'RTKConfig',
    name: 'typescript-rtk-query',
  },
  {
    file: '../packages/plugins/typescript/generic-sdk/src/config.ts',
    identifier: 'RawGenericSdkPluginConfig',
    name: 'typescript-generic-sdk',
  },
  {
    file: '../packages/plugins/typescript/apollo-client-helpers/src/config.ts',
    identifier: 'ApolloClientHelpersConfig',
    name: 'typescript-apollo-client-helpers',
  },
  {
    file: '../packages/plugins/other/add/src/config.ts',
    identifier: 'AddPluginConfig',
    name: 'add',
  },
  {
    file: '../packages/plugins/other/time/src/config.ts',
    identifier: 'TimePluginConfig',
    name: 'time',
  },
  {
    file: '../packages/plugins/typescript/typescript/src/config.ts',
    identifier: 'TypeScriptPluginConfig',
    name: 'typescript',
  },
  {
    file: '../packages/plugins/typescript/operations/src/config.ts',
    identifier: 'TypeScriptDocumentsPluginConfig',
    name: 'typescript-operations',
  },
  {
    file: '../packages/plugins/c-sharp/c-sharp/src/config.ts',
    identifier: 'CSharpResolversPluginRawConfig',
    name: 'c-sharp',
  },
  {
    file: '../packages/plugins/c-sharp/c-sharp-operations/src/config.ts',
    identifier: 'CSharpOperationsRawPluginConfig',
    name: 'c-sharp-operations',
  },
  {
    file: '../packages/plugins/other/schema-ast/src/index.ts',
    identifier: 'SchemaASTConfig',
    name: 'schema-ast',
  },
  {
    file: '../packages//plugins/typescript/type-graphql/src/config.ts',
    identifier: 'TypeGraphQLPluginConfig',
    name: 'typescript-type-graphql',
  },
  {
    file: '../packages/plugins/typescript/graphql-files-modules/src/index.ts',
    identifier: 'TypeScriptFilesModulesPluginConfig',
    name: 'typescript-graphql-files-modules',
  },
  {
    file: '../packages/plugins/typescript/named-operations-object/src/index.ts',
    identifier: 'NamedOperationsObjectPluginConfig',
    name: 'named-operations-object',
  },
  {
    file: '../packages/plugins/typescript/graphql-request/src/config.ts',
    identifier: 'RawGraphQLRequestPluginConfig',
    name: 'typescript-graphql-request',
  },
  {
    file: '../packages/plugins/typescript/mongodb/src/config.ts',
    identifier: 'TypeScriptMongoPluginConfig',
    name: 'typescript-mongodb',
  },
  {
    file: '../packages/plugins/typescript/resolvers/src/config.ts',
    identifier: 'TypeScriptResolversPluginConfig',
    name: 'typescript-resolvers',
  },
  {
    file: '../packages/plugins/typescript/apollo-angular/src/config.ts',
    identifier: 'ApolloAngularRawPluginConfig',
    name: 'typescript-apollo-angular',
  },
  {
    file: '../packages/plugins/typescript/urql/src/config.ts',
    identifier: 'UrqlRawPluginConfig',
    name: 'typescript-urql',
  },
  {
    file: '../packages/plugins/typescript/react-apollo/src/config.ts',
    identifier: 'ReactApolloRawPluginConfig',
    name: 'typescript-react-apollo',
  },
  {
    file: '../packages/plugins/typescript/vue-apollo/src/config.ts',
    identifier: 'VueApolloRawPluginConfig',
    name: 'typescript-vue-apollo',
  },
  {
    file: '../packages/plugins/typescript/vue-apollo-smart-ops/src/config.ts',
    identifier: 'VueApolloSmartOpsRawPluginConfig',
    name: 'typescript-vue-apollo-smart-ops',
  },
  {
    file: '../packages/plugins/typescript/vue-urql/src/config.ts',
    identifier: 'VueUrqlRawPluginConfig',
    name: 'typescript-vue-urql',
  },
  {
    file: '../packages/plugins/typescript/stencil-apollo/src/config.ts',
    identifier: 'StencilApolloRawPluginConfig',
    name: 'typescript-stencil-apollo',
  },
  {
    file: '../packages/plugins/typescript/document-nodes/src/index.ts',
    identifier: 'TypeScriptDocumentNodesRawPluginConfig',
    name: 'typescript-document-nodes',
  },
  {
    file: '../packages/plugins/typescript/msw/src/config.ts',
    identifier: 'MSWConfig',
    name: 'typescript-msw',
  },
  {
    file: '../packages/plugins/java/apollo-android/src/plugin.ts',
    identifier: 'JavaApolloAndroidPluginConfig',
    name: 'java-apollo-android',
  },
  {
    file: '../packages/plugins/java/resolvers/src/config.ts',
    identifier: 'JavaResolversPluginRawConfig',
    name: 'java-resolvers',
  },
  {
    file: '../packages/plugins/java/java/src/config.ts',
    identifier: 'JavaResolversPluginRawConfig',
    name: 'java',
  },
  {
    file: '../packages/plugins/java/kotlin/src/config.ts',
    identifier: 'KotlinResolversPluginRawConfig',
    name: 'kotlin',
  },
  {
    file: '../packages/plugins/flow/flow/src/config.ts',
    identifier: 'FlowPluginConfig',
    name: 'flow',
  },
  {
    file: '../packages/plugins/flow/resolvers/src/config.ts',
    identifier: 'FlowResolversPluginConfig',
    name: 'flow-resolvers',
  },
  {
    file: '../packages/plugins/flow/operations/src/config.ts',
    identifier: 'FlowDocumentsPluginConfig',
    name: 'flow-operations',
  },
  {
    file: '../packages/plugins/other/introspection/src/index.ts',
    identifier: 'IntrospectionPluginConfig',
    name: 'introspection',
  },
  {
    file: '../packages/plugins/other/fragment-matcher/src/index.ts',
    identifier: 'FragmentMatcherConfig',
    name: 'fragment-matcher',
  },
  {
    file: '../packages/plugins/other/urql-introspection/src/index.ts',
    identifier: 'UrqlIntrospectionConfig',
    name: 'urql-introspection',
  },
  {
    file: '../packages/plugins/other/hasura-allow-list/src/config.ts',
    identifier: 'HasuraAllowListPluginConfig',
    name: 'hasura-allow-list',
  },
];
