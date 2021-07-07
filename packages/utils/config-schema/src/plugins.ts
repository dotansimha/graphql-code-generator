export type PluginConfig = { file: string; identifier: string; name: string };
export type PresetConfig = { file: string; identifier: string; name: string };

export const presetsConfigurations: PresetConfig[] = [
  {
    file: '../../presets/graphql-modules/src/config.ts',
    identifier: 'ModulesConfig',
    name: 'graphql-modules-preset',
  },
  {
    file: '../../presets/near-operation-file/src/index.ts',
    identifier: 'NearOperationFileConfig',
    name: 'near-operation-file-preset',
  },
  {
    file: '../../presets/import-types/src/index.ts',
    identifier: 'ImportTypesConfig',
    name: 'import-types-preset',
  },
  {
    file: '../../presets/gql-tag/src/index.ts',
    identifier: 'GqlTagConfig',
    name: 'gql-tag-preset',
  },
];

export const pluginsConfigurations: PluginConfig[] = [
  {
    file: '../../plugins/typescript/react-query/src/config.ts',
    identifier: 'ReactQueryRawPluginConfig',
    name: 'typescript-react-query',
  },
  {
    file: '../../plugins/typescript/rtk-query/src/config.ts',
    identifier: 'RTKConfig',
    name: 'typescript-rtk-query',
  },
  {
    file: '../../plugins/typescript/generic-sdk/src/config.ts',
    identifier: 'RawGenericSdkPluginConfig',
    name: 'typescript-generic-sdk',
  },
  {
    file: '../../plugins/typescript/apollo-client-helpers/src/config.ts',
    identifier: 'ApolloClientHelpersConfig',
    name: 'typescript-apollo-client-helpers',
  },
  {
    file: '../../plugins/other/add/src/config.ts',
    identifier: 'AddPluginConfig',
    name: 'add',
  },
  {
    file: '../../plugins/other/time/src/config.ts',
    identifier: 'TimePluginConfig',
    name: 'time',
  },
  {
    file: '../../plugins/typescript/typescript/src/config.ts',
    identifier: 'TypeScriptPluginConfig',
    name: 'typescript',
  },
  {
    file: '../../plugins/typescript/operations/src/config.ts',
    identifier: 'TypeScriptDocumentsPluginConfig',
    name: 'typescript-operations',
  },
  {
    file: '../../plugins/c-sharp/c-sharp/src/config.ts',
    identifier: 'CSharpResolversPluginRawConfig',
    name: 'c-sharp',
  },
  {
    file: '../../plugins/c-sharp/c-sharp-operations/src/config.ts',
    identifier: 'CSharpOperationsRawPluginConfig',
    name: 'c-sharp-operations',
  },
  {
    file: '../../plugins/other/schema-ast/src/index.ts',
    identifier: 'SchemaASTConfig',
    name: 'schema-ast',
  },
  {
    file: '../..//plugins/typescript/type-graphql/src/config.ts',
    identifier: 'TypeGraphQLPluginConfig',
    name: 'typescript-type-graphql',
  },
  {
    file: '../../plugins/typescript/graphql-files-modules/src/index.ts',
    identifier: 'TypeScriptFilesModulesPluginConfig',
    name: 'typescript-graphql-files-modules',
  },
  {
    file: '../../plugins/typescript/named-operations-object/src/index.ts',
    identifier: 'NamedOperationsObjectPluginConfig',
    name: 'named-operations-object',
  },
  {
    file: '../../plugins/typescript/graphql-request/src/config.ts',
    identifier: 'RawGraphQLRequestPluginConfig',
    name: 'typescript-graphql-request',
  },
  {
    file: '../../plugins/typescript/compatibility/src/config.ts',
    identifier: 'CompatibilityPluginRawConfig',
    name: 'typescript-compatibility',
  },
  {
    file: '../../plugins/typescript/mongodb/src/config.ts',
    identifier: 'TypeScriptMongoPluginConfig',
    name: 'typescript-mongodb',
  },
  {
    file: '../../plugins/typescript/resolvers/src/config.ts',
    identifier: 'TypeScriptResolversPluginConfig',
    name: 'typescript-resolvers',
  },
  {
    file: '../../plugins/typescript/apollo-angular/src/config.ts',
    identifier: 'ApolloAngularRawPluginConfig',
    name: 'typescript-apollo-angular',
  },
  {
    file: '../../plugins/typescript/urql/src/config.ts',
    identifier: 'UrqlRawPluginConfig',
    name: 'typescript-urql',
  },
  {
    file: '../../plugins/typescript/react-apollo/src/config.ts',
    identifier: 'ReactApolloRawPluginConfig',
    name: 'typescript-react-apollo',
  },
  {
    file: '../../plugins/typescript/vue-apollo/src/config.ts',
    identifier: 'VueApolloRawPluginConfig',
    name: 'typescript-vue-apollo',
  },
  {
    file: '../../plugins/typescript/vue-apollo-smart-ops/src/config.ts',
    identifier: 'VueApolloSmartOpsRawPluginConfig',
    name: 'typescript-vue-apollo-smart-ops',
  },
  {
    file: '../../plugins/typescript/vue-urql/src/config.ts',
    identifier: 'VueUrqlRawPluginConfig',
    name: 'typescript-vue-urql',
  },
  {
    file: '../../plugins/typescript/stencil-apollo/src/config.ts',
    identifier: 'StencilApolloRawPluginConfig',
    name: 'typescript-stencil-apollo',
  },
  {
    file: '../../plugins/typescript/document-nodes/src/index.ts',
    identifier: 'TypeScriptDocumentNodesRawPluginConfig',
    name: 'typescript-document-nodes',
  },
  {
    file: '../../plugins/java/apollo-android/src/plugin.ts',
    identifier: 'JavaApolloAndroidPluginConfig',
    name: 'java-apollo-android',
  },
  {
    file: '../../plugins/java/resolvers/src/config.ts',
    identifier: 'JavaResolversPluginRawConfig',
    name: 'java-resolvers',
  },
  {
    file: '../../plugins/java/java/src/config.ts',
    identifier: 'JavaResolversPluginRawConfig',
    name: 'java',
  },
  {
    file: '../../plugins/java/kotlin/src/config.ts',
    identifier: 'KotlinResolversPluginRawConfig',
    name: 'kotlin',
  },
  {
    file: '../../plugins/flow/flow/src/config.ts',
    identifier: 'FlowPluginConfig',
    name: 'flow',
  },
  {
    file: '../../plugins/flow/resolvers/src/index.ts',
    identifier: 'RawFlowResolversConfig',
    name: 'flow-resolvers',
  },
  {
    file: '../../plugins/flow/operations/src/config.ts',
    identifier: 'FlowDocumentsPluginConfig',
    name: 'flow-operations',
  },
  {
    file: '../../plugins/other/introspection/src/index.ts',
    identifier: 'IntrospectionPluginConfig',
    name: 'introspection',
  },
  {
    file: '../../plugins/other/fragment-matcher/src/index.ts',
    identifier: 'FragmentMatcherConfig',
    name: 'fragment-matcher',
  },
  {
    file: '../../plugins/other/urql-introspection/src/index.ts',
    identifier: 'UrqlIntrospectionConfig',
    name: 'urql-introspection',
  },
];
