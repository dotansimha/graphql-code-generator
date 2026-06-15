import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  hooks: { afterAllFileWrite: ['prettier --write'] },
  emitLegacyCommonJSImports: false,
  generates: {
    './test-schema/resolvers-types.ts': {
      schema: './test-schema/schema-text.js',
      plugins: ['typescript', 'typescript-resolvers'],
    },
    './test-schema/flow-types.flow.js': {
      schema: './test-schema/schema.json',
      plugins: ['flow', 'flow-resolvers'],
    },
    './test-schema/resolvers-root.ts': {
      schema: './test-schema/schema-with-root.graphql',
      plugins: ['typescript', 'typescript-resolvers'],
    },
    './test-schema/resolvers-federation.ts': {
      schema: './test-schema/schema-federation.graphql',
      config: { federation: true },
      plugins: ['typescript', 'typescript-resolvers'],
    },
    './test-schema/resolvers-stitching.ts': {
      schema: './test-schema/schema-text.js',
      plugins: ['typescript', { 'typescript-resolvers': { noSchemaStitching: false } }],
    },
    './test-schema/typings.ts': {
      schema: './test-schema/schema.json',
      plugins: ['typescript', 'typescript-resolvers'],
    },
    './test-schema/typings.avoidOptionals.ts': {
      schema: './test-schema/schema.json',
      config: { avoidOptionals: true },
      plugins: ['typescript'],
    },
    './test-schema/typings.wrapped.ts': {
      schema: './test-schema/schema.json',
      plugins: [
        { add: { content: 'declare namespace GraphQL {' } },
        { add: { placement: 'append', content: '}' } },
        'typescript',
      ],
    },
    './test-schema/env.types.ts': {
      schema: process.env.SCHEMA_PATH,
      plugins: ['typescript'],
    },
    './test-schema/typings.immutableTypes.ts': {
      schema: './test-schema/schema.json',
      config: { imutableTypes: true },
      plugins: ['typescript'],
    },
    './test-schema/typings.enum.ts': {
      schema: './test-schema/schema-object.js',
      plugins: ['typescript'],
    },
    './githunt/graphql-declared-modules.d.ts': {
      schema: './githunt/schema.json',
      documents: [
        './githunt/**/*.graphql',
        './dev-test/general-outer-dir/githunt/**/*.graphql',
        '!**/nothing-should-use-this-query.graphql',
      ],
      plugins: ['typescript-graphql-files-modules'],
    },
    './githunt/typed-document-nodes.ts': {
      schema: './githunt/schema.json',
      documents: './githunt/**/*.graphql',
      plugins: ['typescript-operations', 'typed-document-node'],
    },
    './githunt/types.ts': {
      schema: './githunt/schema.json',
      documents: './githunt/**/*.graphql',
      plugins: ['typescript-operations'],
    },
    './githunt/types.preResolveTypes.ts': {
      schema: './githunt/schema.json',
      documents: './githunt/**/*.graphql',
      config: { preResolveTypes: true },
      plugins: ['typescript-operations'],
    },
    './githunt/types.onlyEnums.ts': {
      schema: './githunt/schema.json',
      documents: './githunt/**/*.graphql',
      config: { generateOperationTypes: false },
      plugins: ['typescript-operations'],
    },
    './githunt/types.preResolveTypes.onlyOperationTypes.ts': {
      schema: './githunt/schema.json',
      documents: './githunt/**/*.graphql',
      config: { preResolveTypes: true },
      plugins: ['typescript-operations'],
    },
    './githunt/types.flatten.preResolveTypes.ts': {
      schema: './githunt/schema.json',
      documents: './githunt/**/*.graphql',
      config: { preResolveTypes: true, flattenGeneratedTypes: true },
      plugins: ['typescript-operations'],
    },
    './githunt/types.enumsAsTypes.ts': {
      schema: './githunt/schema.json',
      documents: './githunt/**/*.graphql',
      config: { enumType: 'string-literal' },
      plugins: ['typescript-operations'],
    },
    './githunt/types.d.ts': {
      schema: './githunt/schema.json',
      documents: './githunt/**/*.graphql',
      config: {},
      plugins: ['typescript-operations'],
    },
    './githunt/types.avoidOptionals.ts': {
      schema: './githunt/schema.json',
      documents: './githunt/**/*.graphql',
      config: { avoidOptionals: true },
      plugins: ['typescript-operations'],
    },
    './githunt/types.immutableTypes.ts': {
      schema: './githunt/schema.json',
      documents: './githunt/**/*.graphql',
      config: { immutableTypes: true },
      plugins: ['typescript-operations'],
    },
    './star-wars/types.ts': {
      schema: './star-wars/schema.json',
      documents: './star-wars/**/*.graphql',
      plugins: ['typescript-operations'],
    },
    './star-wars/types.excludeQueryAlpha.ts': {
      schema: './star-wars/schema.json',
      documents: ['./star-wars/**/*.graphql', '!./star-wars/**/ExcludeQueryAlpha.graphql'],
      plugins: ['typescript-operations'],
    },
    './star-wars/types.excludeQueryBeta.ts': {
      schema: './star-wars/schema.json',
      documents: ['./star-wars/**/*.graphql', '!./star-wars/**/ExcludeQueryBeta.graphql'],
      plugins: ['typescript-operations'],
    },
    './star-wars/types.preResolveTypes.ts': {
      schema: './star-wars/schema.json',
      documents: './star-wars/**/*.graphql',
      config: { preResolveTypes: true },
      plugins: ['typescript-operations'],
    },
    './star-wars/types.OnlyEnums.ts': {
      schema: './star-wars/schema.json',
      documents: './star-wars/**/*.graphql',
      config: { onlyEnums: true },
      plugins: ['typescript'],
    },
    './star-wars/types.preResolveTypes.onlyOperationTypes.ts': {
      schema: './star-wars/schema.json',
      documents: './star-wars/**/*.graphql',
      config: { preResolveTypes: true },
      plugins: ['typescript-operations'],
    },
    './test-schema/types.preResolveTypes.ts': {
      schema: './test-schema/schema.graphql',
      documents: ['query test { testArr1 testArr2 testArr3 }'],
      config: { preResolveTypes: true },
      plugins: ['typescript-operations'],
    },
    './test-schema/types.preResolveTypes.onlyOperationTypes.ts': {
      schema: './test-schema/schema.graphql',
      documents: ['query test { testArr1 testArr2 testArr3 }'],
      config: { preResolveTypes: true },
      plugins: ['typescript-operations'],
    },
    './star-wars/types.d.ts': {
      schema: './star-wars/schema.json',
      config: { enumType: 'string-literal' },
      plugins: ['typescript-operations'],
    },
    './modules/': {
      schema: './modules/*/types/*.graphql',
      preset: 'graphql-modules',
      presetConfig: { baseTypesPath: 'types.ts', filename: 'generated.ts' },
      plugins: ['typescript', 'typescript-resolvers'],
    },
    './star-wars/types.globallyAvailable.d.ts': {
      schema: './star-wars/schema.json',
      documents: './star-wars/**/*.graphql',
      config: { noExport: true },
      plugins: ['typescript-operations'],
    },
    './star-wars/types.avoidOptionals.ts': {
      schema: './star-wars/schema.json',
      documents: './star-wars/**/*.graphql',
      config: { avoidOptionals: true },
      plugins: ['typescript-operations'],
    },
    './star-wars/types.immutableTypes.ts': {
      schema: './star-wars/schema.json',
      documents: './star-wars/**/*.graphql',
      config: { immutableTypes: true },
      plugins: ['typescript-operations'],
    },
    './star-wars/types.skipSchema.ts': {
      schema: './star-wars/schema.json',
      documents: './star-wars/**/*.graphql',
      plugins: ['typescript-operations'],
    },
    './gql-tag-operations/gql/': {
      schema: './gql-tag-operations/schema.graphql',
      documents: './gql-tag-operations/src/**/*.ts',
      preset: 'client',
    },
    './gql-tag-operations/graphql/': {
      schema: './gql-tag-operations/schema.graphql',
      documents: './gql-tag-operations/src/**/*.ts',
      preset: 'client',
    },
    './gql-tag-operations-urql/gql/': {
      schema: './gql-tag-operations-urql/schema.graphql',
      documents: './gql-tag-operations-urql/src/**/*.ts',
      preset: 'client',
      presetConfig: { augmentedModuleName: '@urql/core' },
    },
    './gql-tag-operations-masking/gql/': {
      schema: './gql-tag-operations-masking/schema.graphql',
      documents: './gql-tag-operations-masking/src/**/*.tsx',
      preset: 'client',
      presetConfig: { fragmentMasking: true },
    },
    './test-null-value/result.d.ts': {
      schema: './test-null-value/schema.graphql',
      documents: ['./test-null-value/query.ts'],
      plugins: ['typescript-operations'],
      config: {
        // The combination of these two flags caused the following issue:
        // https://github.com/dotansimha/graphql-code-generator/pull/9709
        skipTypename: true,
        mergeFragmentTypes: true,
      },
    },
    './subpath-import/result.d.ts': {
      schema: './subpath-import/schema.graphql',
      plugins: ['typescript', 'typescript-resolvers'],
      config: {
        contextType: '\\#test-null-value/context#TestContext',
        fieldContextTypes: ['mutation.createUser#\\#test/root#FiedContextType'],
        enumValues: {
          RoleStatus: '\\#changeName/server/drizzle/schema#RoleStatus',
        },
      },
    },
    './test-federation/generated/types.ts': {
      schema: './test-federation/schema.gql',
      plugins: ['typescript', 'typescript-resolvers'],
      config: {
        mapperTypeSuffix: 'Mapper',
        enumsAsTypes: true,
        useIndexSignature: true,
        maybeValue: 'T | null | undefined',
        scalars: {
          CarKey: 'string',
        },
      },
    },
    // #region externalDocuments option
    './external-documents/app/types.generated.ts': {
      schema: './external-documents/schema.graphqls',
      documents: ['./external-documents/app/*.graphql.ts'],
      externalDocuments: ['./external-documents/lib/*.graphql.ts'],
      plugins: ['typescript-operations'],
    },
    // #endregion

    // standalone-operations/import-schema-types
    './standalone-operations/import-schema-types/_base.generated.ts': {
      schema: './standalone-operations/schema.graphql',
      documents: ['./standalone-operations/import-schema-types/*.graphql'],
      plugins: ['typescript-operations'],
      config: {
        generateOperationTypes: false,
      },
    },
    './standalone-operations/import-schema-types/_types.generated.ts': {
      schema: './standalone-operations/schema.graphql',
      documents: ['./standalone-operations/import-schema-types/*.graphql'],
      plugins: ['typescript-operations'],
      config: {
        importSchemaTypesFrom: './standalone-operations/import-schema-types/_base.generated.ts',
      },
    },

    // standalone-operations/with-typescript-plugin
    './standalone-operations/with-typescript-plugin/_base.generated.ts': {
      schema: './standalone-operations/schema.graphql',
      plugins: ['typescript'],
    },
    './standalone-operations/with-typescript-plugin/_types.generated.ts': {
      schema: './standalone-operations/schema.graphql',
      documents: ['./standalone-operations/with-typescript-plugin/*.graphql'],
      plugins: ['typescript-operations'],
      config: {
        importSchemaTypesFrom: './standalone-operations/with-typescript-plugin/_base.generated.ts',
      },
    },
  },
};

export default config;
