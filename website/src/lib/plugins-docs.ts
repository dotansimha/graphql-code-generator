export type PluginConfig = { file: string; identifier: string; name: string };
export type PresetConfig = { file: string; identifier: string; name: string };

export const presetsConfigurations: PresetConfig[] = [
  {
    file: '../node_modules/@graphql-codegen/graphql-modules-preset/src/config.ts',
    identifier: 'ModulesConfig',
    name: 'graphql-modules-preset',
  },
  {
    file: '../node_modules/@graphql-codegen/near-operation-file-preset/typings/index.d.ts',
    identifier: 'NearOperationFileConfig',
    name: 'near-operation-file-preset',
  },
  {
    file: '../node_modules/@graphql-codegen/import-types-preset/typings/index.d.ts',
    identifier: 'ImportTypesConfig',
    name: 'import-types-preset',
  },
  {
    file: '../node_modules/@graphql-codegen/gql-tag-operations-preset/src/index.ts',
    identifier: 'GqlTagConfig',
    name: 'gql-tag-operations-preset',
  },
];

export const pluginsConfigurations: PluginConfig[] = [
  {
    file: '../node_modules/@graphql-codegen/flutter-freezed/typings/config.d.ts',
    identifier: 'FlutterFreezedPluginConfig',
    name: 'flutter-freezed',
  },
  {
    file: '../node_modules/@graphql-codegen/typescript-react-query/typings/config.d.ts',
    identifier: 'ReactQueryRawPluginConfig',
    name: 'typescript-react-query',
  },
  {
    file: '../node_modules/@graphql-codegen/typescript-rtk-query/typings/config.d.ts',
    identifier: 'RTKConfig',
    name: 'typescript-rtk-query',
  },
  {
    file: '../node_modules/@graphql-codegen/typescript-generic-sdk/typings/config.d.ts',
    identifier: 'RawGenericSdkPluginConfig',
    name: 'typescript-generic-sdk',
  },
  {
    file: '../node_modules/@graphql-codegen/typescript-apollo-client-helpers/typings/config.d.ts',
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
    file: '../node_modules/@graphql-codegen/c-sharp/typings/config.d.ts',
    identifier: 'CSharpResolversPluginRawConfig',
    name: 'c-sharp',
  },
  {
    file: '../node_modules/@graphql-codegen/c-sharp-operations/typings/config.d.ts',
    identifier: 'CSharpOperationsRawPluginConfig',
    name: 'c-sharp-operations',
  },
  {
    file: '../packages/plugins/other/schema-ast/src/index.ts',
    identifier: 'SchemaASTConfig',
    name: 'schema-ast',
  },
  {
    file: '../node_modules/@graphql-codegen/typescript-type-graphql/typings/config.d.ts',
    identifier: 'TypeGraphQLPluginConfig',
    name: 'typescript-type-graphql',
  },
  {
    file: '../node_modules/@graphql-codegen/typescript-graphql-files-modules/typings/index.d.ts',
    identifier: 'TypeScriptFilesModulesPluginConfig',
    name: 'typescript-graphql-files-modules',
  },
  {
    file: '../node_modules/@graphql-codegen/named-operations-object/typings/index.d.ts',
    identifier: 'NamedOperationsObjectPluginConfig',
    name: 'named-operations-object',
  },
  {
    file: '../node_modules/@graphql-codegen/typescript-graphql-request/typings/config.d.ts',
    identifier: 'RawGraphQLRequestPluginConfig',
    name: 'typescript-graphql-request',
  },
  {
    file: '../node_modules/@graphql-codegen/typescript-mongodb/typings/config.d.ts',
    identifier: 'TypeScriptMongoPluginConfig',
    name: 'typescript-mongodb',
  },
  {
    file: '../packages/plugins/typescript/resolvers/src/config.ts',
    identifier: 'TypeScriptResolversPluginConfig',
    name: 'typescript-resolvers',
  },
  {
    file: '../node_modules/@graphql-codegen/typescript-apollo-angular/typings/config.d.ts',
    identifier: 'ApolloAngularRawPluginConfig',
    name: 'typescript-apollo-angular',
  },
  {
    file: '../packages/plugins/typescript/nhost/src/config.ts',
    identifier: 'NhostPluginConfig',
    name: 'typescript-nhost',
  },
  {
    file: '../node_modules/@graphql-codegen/typescript-urql/typings/config.d.ts',
    identifier: 'UrqlRawPluginConfig',
    name: 'typescript-urql',
  },
  {
    file: '../node_modules/@graphql-codegen/typescript-react-apollo/typings/config.d.ts',
    identifier: 'ReactApolloRawPluginConfig',
    name: 'typescript-react-apollo',
  },
  {
    file: '../node_modules/@graphql-codegen/typescript-vue-apollo/typings/config.d.ts',
    identifier: 'VueApolloRawPluginConfig',
    name: 'typescript-vue-apollo',
  },
  {
    file: '../node_modules/@graphql-codegen/typescript-vue-apollo-smart-ops/typings/config.d.ts',
    identifier: 'VueApolloSmartOpsRawPluginConfig',
    name: 'typescript-vue-apollo-smart-ops',
  },
  {
    file: '../node_modules/@graphql-codegen/typescript-vue-urql/typings/config.d.ts',
    identifier: 'VueUrqlRawPluginConfig',
    name: 'typescript-vue-urql',
  },
  {
    file: '../node_modules/@graphql-codegen/typescript-stencil-apollo/typings/config.d.ts',
    identifier: 'StencilApolloRawPluginConfig',
    name: 'typescript-stencil-apollo',
  },
  {
    file: '../packages/plugins/typescript/document-nodes/src/index.ts',
    identifier: 'TypeScriptDocumentNodesRawPluginConfig',
    name: 'typescript-document-nodes',
  },
  {
    file: '../node_modules/@graphql-codegen/typescript-msw/typings/config.d.ts',
    identifier: 'MSWConfig',
    name: 'typescript-msw',
  },
  {
    file: '../node_modules/@graphql-codegen/java-apollo-android/typings/plugin.d.ts',
    identifier: 'JavaApolloAndroidPluginConfig',
    name: 'java-apollo-android',
  },
  {
    file: '../node_modules/@graphql-codegen/java-resolvers/typings/config.d.ts',
    identifier: 'JavaResolversPluginRawConfig',
    name: 'java-resolvers',
  },
  {
    file: '../node_modules/@graphql-codegen/java/typings/config.d.ts',
    identifier: 'JavaResolversPluginRawConfig',
    name: 'java',
  },
  {
    file: '../node_modules/@graphql-codegen/kotlin/typings/config.d.ts',
    identifier: 'KotlinResolversPluginRawConfig',
    name: 'kotlin',
  },
  {
    file: '../node_modules/@graphql-codegen/flow/typings/config.d.ts',
    identifier: 'FlowPluginConfig',
    name: 'flow',
  },
  {
    file: '../node_modules/@graphql-codegen/flow-resolvers/typings/config.d.ts',
    identifier: 'FlowResolversPluginConfig',
    name: 'flow-resolvers',
  },
  {
    file: '../node_modules/@graphql-codegen/flow-operations/typings/config.d.ts',
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
    file: '../node_modules/@graphql-codegen/urql-introspection/typings/index.d.ts',
    identifier: 'UrqlIntrospectionConfig',
    name: 'urql-introspection',
  },
  {
    file: '../node_modules/@graphql-codegen/hasura-allow-list/typings/config.d.ts',
    identifier: 'HasuraAllowListPluginConfig',
    name: 'hasura-allow-list',
  },
];
