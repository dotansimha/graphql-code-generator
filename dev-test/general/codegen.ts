import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  hooks: { afterAllFileWrite: ['prettier --write'] },
  emitLegacyCommonJSImports: false,
  generates: {
    './dev-test/general/test-schema/resolvers-types.ts': {
      schema: './dev-test/general/test-schema/schema-text.js',
      plugins: ['typescript', 'typescript-resolvers'],
    },
    './dev-test/general/test-schema/flow-types.flow.js': {
      schema: './dev-test/general/test-schema/schema.json',
      plugins: ['flow', 'flow-resolvers'],
    },
    './dev-test/general/test-schema/resolvers-root.ts': {
      schema: './dev-test/general/test-schema/schema-with-root.graphql',
      plugins: ['typescript', 'typescript-resolvers'],
    },
    './dev-test/general/test-schema/resolvers-federation.ts': {
      schema: './dev-test/general/test-schema/schema-federation.graphql',
      config: { federation: true },
      plugins: ['typescript', 'typescript-resolvers'],
    },
    './dev-test/general/test-schema/resolvers-stitching.ts': {
      schema: './dev-test/general/test-schema/schema-text.js',
      plugins: ['typescript', { 'typescript-resolvers': { noSchemaStitching: false } }],
    },
    './dev-test/general/test-schema/typings.ts': {
      schema: './dev-test/general/test-schema/schema.json',
      plugins: ['typescript', 'typescript-resolvers'],
    },
    './dev-test/general/test-schema/typings.avoidOptionals.ts': {
      schema: './dev-test/general/test-schema/schema.json',
      config: { avoidOptionals: true },
      plugins: ['typescript'],
    },
    './dev-test/general/test-schema/typings.wrapped.ts': {
      schema: './dev-test/general/test-schema/schema.json',
      plugins: [
        { add: { content: 'declare namespace GraphQL {' } },
        { add: { placement: 'append', content: '}' } },
        'typescript',
      ],
    },
    './dev-test/general/test-schema/env.types.ts': {
      schema: process.env.SCHEMA_PATH,
      plugins: ['typescript'],
    },
    './dev-test/general/test-schema/typings.immutableTypes.ts': {
      schema: './dev-test/general/test-schema/schema.json',
      config: { imutableTypes: true },
      plugins: ['typescript'],
    },
    './dev-test/general/test-schema/typings.enum.ts': {
      schema: './dev-test/general/test-schema/schema-object.js',
      plugins: ['typescript'],
    },
    './dev-test/general/githunt/graphql-declared-modules.d.ts': {
      schema: './dev-test/general/githunt/schema.json',
      documents: [
        './dev-test/general/githunt/**/*.graphql',
        './dev-test/general-outer-dir/githunt/**/*.graphql',
        '!**/nothing-should-use-this-query.graphql',
      ],
      plugins: ['typescript-graphql-files-modules'],
    },
    './dev-test/general/githunt/typed-document-nodes.ts': {
      schema: './dev-test/general/githunt/schema.json',
      documents: './dev-test/general/githunt/**/*.graphql',
      plugins: ['typescript-operations', 'typed-document-node'],
    },
    './dev-test/general/githunt/types.ts': {
      schema: './dev-test/general/githunt/schema.json',
      documents: './dev-test/general/githunt/**/*.graphql',
      plugins: ['typescript-operations'],
    },
    './dev-test/general/githunt/types.preResolveTypes.ts': {
      schema: './dev-test/general/githunt/schema.json',
      documents: './dev-test/general/githunt/**/*.graphql',
      config: { preResolveTypes: true },
      plugins: ['typescript-operations'],
    },
    './dev-test/general/githunt/types.onlyEnums.ts': {
      schema: './dev-test/general/githunt/schema.json',
      documents: './dev-test/general/githunt/**/*.graphql',
      config: { generateOperationTypes: false },
      plugins: ['typescript-operations'],
    },
    './dev-test/general/githunt/types.preResolveTypes.onlyOperationTypes.ts': {
      schema: './dev-test/general/githunt/schema.json',
      documents: './dev-test/general/githunt/**/*.graphql',
      config: { preResolveTypes: true },
      plugins: ['typescript-operations'],
    },
    './dev-test/general/githunt/types.flatten.preResolveTypes.ts': {
      schema: './dev-test/general/githunt/schema.json',
      documents: './dev-test/general/githunt/**/*.graphql',
      config: { preResolveTypes: true, flattenGeneratedTypes: true },
      plugins: ['typescript-operations'],
    },
    './dev-test/general/githunt/types.enumsAsTypes.ts': {
      schema: './dev-test/general/githunt/schema.json',
      documents: './dev-test/general/githunt/**/*.graphql',
      config: { enumType: 'string-literal' },
      plugins: ['typescript-operations'],
    },
    './dev-test/general/githunt/types.d.ts': {
      schema: './dev-test/general/githunt/schema.json',
      documents: './dev-test/general/githunt/**/*.graphql',
      config: {},
      plugins: ['typescript-operations'],
    },
    './dev-test/general/githunt/types.avoidOptionals.ts': {
      schema: './dev-test/general/githunt/schema.json',
      documents: './dev-test/general/githunt/**/*.graphql',
      config: { avoidOptionals: true },
      plugins: ['typescript-operations'],
    },
    './dev-test/general/githunt/types.immutableTypes.ts': {
      schema: './dev-test/general/githunt/schema.json',
      documents: './dev-test/general/githunt/**/*.graphql',
      config: { immutableTypes: true },
      plugins: ['typescript-operations'],
    },
    './dev-test/general/star-wars/types.ts': {
      schema: './dev-test/general/star-wars/schema.json',
      documents: './dev-test/general/star-wars/**/*.graphql',
      plugins: ['typescript-operations'],
    },
    './dev-test/general/star-wars/types.excludeQueryAlpha.ts': {
      schema: './dev-test/general/star-wars/schema.json',
      documents: [
        './dev-test/general/star-wars/**/*.graphql',
        '!./dev-test/general/star-wars/**/ExcludeQueryAlpha.graphql',
      ],
      plugins: ['typescript-operations'],
    },
    './dev-test/general/star-wars/types.excludeQueryBeta.ts': {
      schema: './dev-test/general/star-wars/schema.json',
      documents: [
        './dev-test/general/star-wars/**/*.graphql',
        '!./dev-test/general/star-wars/**/ExcludeQueryBeta.graphql',
      ],
      plugins: ['typescript-operations'],
    },
    './dev-test/general/star-wars/types.preResolveTypes.ts': {
      schema: './dev-test/general/star-wars/schema.json',
      documents: './dev-test/general/star-wars/**/*.graphql',
      config: { preResolveTypes: true },
      plugins: ['typescript-operations'],
    },
    './dev-test/general/star-wars/types.OnlyEnums.ts': {
      schema: './dev-test/general/star-wars/schema.json',
      documents: './dev-test/general/star-wars/**/*.graphql',
      config: { onlyEnums: true },
      plugins: ['typescript'],
    },
    './dev-test/general/star-wars/types.preResolveTypes.onlyOperationTypes.ts': {
      schema: './dev-test/general/star-wars/schema.json',
      documents: './dev-test/general/star-wars/**/*.graphql',
      config: { preResolveTypes: true },
      plugins: ['typescript-operations'],
    },
    './dev-test/general/test-schema/types.preResolveTypes.ts': {
      schema: './dev-test/general/test-schema/schema.graphql',
      documents: ['query test { testArr1 testArr2 testArr3 }'],
      config: { preResolveTypes: true },
      plugins: ['typescript-operations'],
    },
    './dev-test/general/test-schema/types.preResolveTypes.onlyOperationTypes.ts': {
      schema: './dev-test/general/test-schema/schema.graphql',
      documents: ['query test { testArr1 testArr2 testArr3 }'],
      config: { preResolveTypes: true },
      plugins: ['typescript-operations'],
    },
    './dev-test/general/star-wars/types.d.ts': {
      schema: './dev-test/general/star-wars/schema.json',
      config: { enumType: 'string-literal' },
      plugins: ['typescript-operations'],
    },
    './dev-test/general/modules/': {
      schema: './dev-test/general/modules/*/types/*.graphql',
      preset: 'graphql-modules',
      presetConfig: { baseTypesPath: 'types.ts', filename: 'generated.ts' },
      plugins: ['typescript', 'typescript-resolvers'],
    },
    './dev-test/general/star-wars/types.globallyAvailable.d.ts': {
      schema: './dev-test/general/star-wars/schema.json',
      documents: './dev-test/general/star-wars/**/*.graphql',
      config: { noExport: true },
      plugins: ['typescript-operations'],
    },
    './dev-test/general/star-wars/types.avoidOptionals.ts': {
      schema: './dev-test/general/star-wars/schema.json',
      documents: './dev-test/general/star-wars/**/*.graphql',
      config: { avoidOptionals: true },
      plugins: ['typescript-operations'],
    },
    './dev-test/general/star-wars/types.immutableTypes.ts': {
      schema: './dev-test/general/star-wars/schema.json',
      documents: './dev-test/general/star-wars/**/*.graphql',
      config: { immutableTypes: true },
      plugins: ['typescript-operations'],
    },
    './dev-test/general/star-wars/types.skipSchema.ts': {
      schema: './dev-test/general/star-wars/schema.json',
      documents: './dev-test/general/star-wars/**/*.graphql',
      plugins: ['typescript-operations'],
    },
    './dev-test/general/gql-tag-operations/gql/': {
      schema: './dev-test/general/gql-tag-operations/schema.graphql',
      documents: './dev-test/general/gql-tag-operations/src/**/*.ts',
      preset: 'client',
    },
    './dev-test/general/gql-tag-operations/graphql/': {
      schema: './dev-test/general/gql-tag-operations/schema.graphql',
      documents: './dev-test/general/gql-tag-operations/src/**/*.ts',
      preset: 'client',
    },
    './dev-test/general/gql-tag-operations-urql/gql/': {
      schema: './dev-test/general/gql-tag-operations-urql/schema.graphql',
      documents: './dev-test/general/gql-tag-operations-urql/src/**/*.ts',
      preset: 'client',
      presetConfig: { augmentedModuleName: '@urql/core' },
    },
    './dev-test/general/gql-tag-operations-masking/gql/': {
      schema: './dev-test/general/gql-tag-operations-masking/schema.graphql',
      documents: './dev-test/general/gql-tag-operations-masking/src/**/*.tsx',
      preset: 'client',
      presetConfig: { fragmentMasking: true },
    },
    './dev-test/general/test-null-value/result.d.ts': {
      schema: './dev-test/general/test-null-value/schema.graphql',
      documents: ['./dev-test/general/test-null-value/query.ts'],
      plugins: ['typescript-operations'],
      config: {
        // The combination of these two flags caused the following issue:
        // https://github.com/dotansimha/graphql-code-generator/pull/9709
        skipTypename: true,
        mergeFragmentTypes: true,
      },
    },
    './dev-test/general/subpath-import/result.d.ts': {
      schema: './dev-test/general/subpath-import/schema.graphql',
      plugins: ['typescript', 'typescript-resolvers'],
      config: {
        contextType: '\\#test-null-value/context#TestContext',
        fieldContextTypes: ['mutation.createUser#\\#test/root#FiedContextType'],
        enumValues: {
          RoleStatus: '\\#changeName/server/drizzle/schema#RoleStatus',
        },
      },
    },
    './dev-test/general/test-federation/generated/types.ts': {
      schema: './dev-test/general/test-federation/schema.gql',
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
    './dev-test/general/external-documents/app/types.generated.ts': {
      schema: './dev-test/general/external-documents/schema.graphqls',
      documents: ['./dev-test/general/external-documents/app/*.graphql.ts'],
      externalDocuments: ['./dev-test/general/external-documents/lib/*.graphql.ts'],
      plugins: ['typescript-operations'],
    },
    // #endregion

    // standalone-operations/import-schema-types
    './dev-test/general/standalone-operations/import-schema-types/_base.generated.ts': {
      schema: './dev-test/general/standalone-operations/schema.graphql',
      documents: ['./dev-test/general/standalone-operations/import-schema-types/*.graphql'],
      plugins: ['typescript-operations'],
      config: {
        generateOperationTypes: false,
      },
    },
    './dev-test/general/standalone-operations/import-schema-types/_types.generated.ts': {
      schema: './dev-test/general/standalone-operations/schema.graphql',
      documents: ['./dev-test/general/standalone-operations/import-schema-types/*.graphql'],
      plugins: ['typescript-operations'],
      config: {
        importSchemaTypesFrom:
          './dev-test/general/standalone-operations/import-schema-types/_base.generated.ts',
      },
    },

    // standalone-operations/with-typescript-plugin
    './dev-test/general/standalone-operations/with-typescript-plugin/_base.generated.ts': {
      schema: './dev-test/general/standalone-operations/schema.graphql',
      plugins: ['typescript'],
    },
    './dev-test/general/standalone-operations/with-typescript-plugin/_types.generated.ts': {
      schema: './dev-test/general/standalone-operations/schema.graphql',
      documents: ['./dev-test/general/standalone-operations/with-typescript-plugin/*.graphql'],
      plugins: ['typescript-operations'],
      config: {
        importSchemaTypesFrom:
          './dev-test/general/standalone-operations/with-typescript-plugin/_base.generated.ts',
      },
    },
  },
};

export default config;
