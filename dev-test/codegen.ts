import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  hooks: { afterAllFileWrite: ['prettier --write'] },
  emitLegacyCommonJSImports: false,
  generates: {
    './dev-test/test-schema/resolvers-types.ts': {
      schema: './dev-test/test-schema/schema-text.js',
      plugins: ['typescript', 'typescript-resolvers'],
    },
    './dev-test/test-schema/flow-types.flow.js': {
      schema: './dev-test/test-schema/schema.json',
      plugins: ['flow', 'flow-resolvers'],
    },
    './dev-test/test-schema/resolvers-root.ts': {
      schema: './dev-test/test-schema/schema-with-root.graphql',
      plugins: ['typescript', 'typescript-resolvers'],
    },
    './dev-test/test-schema/resolvers-federation.ts': {
      schema: './dev-test/test-schema/schema-federation.graphql',
      config: { federation: true },
      plugins: ['typescript', 'typescript-resolvers'],
    },
    './dev-test/test-schema/resolvers-stitching.ts': {
      schema: './dev-test/test-schema/schema-text.js',
      plugins: ['typescript', { 'typescript-resolvers': { noSchemaStitching: false } }],
    },
    './dev-test/test-schema/typings.ts': {
      schema: './dev-test/test-schema/schema.json',
      plugins: ['typescript', 'typescript-resolvers'],
    },
    './dev-test/test-schema/typings.avoidOptionals.ts': {
      schema: './dev-test/test-schema/schema.json',
      config: { avoidOptionals: true },
      plugins: ['typescript'],
    },
    './dev-test/test-schema/typings.wrapped.ts': {
      schema: './dev-test/test-schema/schema.json',
      plugins: [
        { add: { content: 'declare namespace GraphQL {' } },
        { add: { placement: 'append', content: '}' } },
        'typescript',
        'typescript-operations',
      ],
    },
    './dev-test/test-schema/env.types.ts': { schema: process.env.SCHEMA_PATH, plugins: ['typescript'] },
    './dev-test/test-schema/typings.immutableTypes.ts': {
      schema: './dev-test/test-schema/schema.json',
      config: { imutableTypes: true },
      plugins: ['typescript'],
    },
    './dev-test/test-schema/typings.enum.ts': {
      schema: './dev-test/test-schema/schema-object.js',
      plugins: ['typescript'],
    },
    './dev-test/githunt/graphql-declared-modules.d.ts': {
      schema: './dev-test/githunt/schema.json',
      documents: [
        './dev-test/githunt/**/*.graphql',
        './dev-test-outer-dir/githunt/**/*.graphql',
        '!**/nothing-should-use-this-query.graphql',
      ],
      plugins: ['typescript-graphql-files-modules'],
    },
    './dev-test/githunt/typed-document-nodes.ts': {
      schema: './dev-test/githunt/schema.json',
      documents: './dev-test/githunt/**/*.graphql',
      plugins: ['typescript', 'typescript-operations', 'typed-document-node'],
    },
    './dev-test/githunt/types.ts': {
      schema: './dev-test/githunt/schema.json',
      documents: './dev-test/githunt/**/*.graphql',
      plugins: ['typescript', 'typescript-operations'],
    },
    './dev-test/githunt/types.preResolveTypes.ts': {
      schema: './dev-test/githunt/schema.json',
      documents: './dev-test/githunt/**/*.graphql',
      config: { preResolveTypes: true },
      plugins: ['typescript', 'typescript-operations'],
    },
    './dev-test/githunt/types.onlyEnums.ts': {
      schema: './dev-test/githunt/schema.json',
      documents: './dev-test/githunt/**/*.graphql',
      config: { onlyEnums: true },
      plugins: ['typescript'],
    },
    './dev-test/githunt/types.preResolveTypes.onlyOperationTypes.ts': {
      schema: './dev-test/githunt/schema.json',
      documents: './dev-test/githunt/**/*.graphql',
      config: { preResolveTypes: true, onlyOperationTypes: true },
      plugins: ['typescript', 'typescript-operations'],
    },
    './dev-test/githunt/types.flatten.preResolveTypes.ts': {
      schema: './dev-test/githunt/schema.json',
      documents: './dev-test/githunt/**/*.graphql',
      config: { preResolveTypes: true, flattenGeneratedTypes: true },
      plugins: ['typescript', 'typescript-operations'],
    },
    './dev-test/githunt/types.enumsAsTypes.ts': {
      schema: './dev-test/githunt/schema.json',
      documents: './dev-test/githunt/**/*.graphql',
      config: { enumsAsTypes: true },
      plugins: ['typescript', 'typescript-operations'],
    },
    './dev-test/githunt/types.d.ts': {
      schema: './dev-test/githunt/schema.json',
      documents: './dev-test/githunt/**/*.graphql',
      config: { enumsAsTypes: true },
      plugins: ['typescript', 'typescript-operations'],
    },
    './dev-test/githunt/types.avoidOptionals.ts': {
      schema: './dev-test/githunt/schema.json',
      documents: './dev-test/githunt/**/*.graphql',
      config: { avoidOptionals: true },
      plugins: ['typescript', 'typescript-operations'],
    },
    './dev-test/githunt/types.immutableTypes.ts': {
      schema: './dev-test/githunt/schema.json',
      documents: './dev-test/githunt/**/*.graphql',
      config: { immutableTypes: true },
      plugins: ['typescript', 'typescript-operations'],
    },
    './dev-test/star-wars/types.ts': {
      schema: './dev-test/star-wars/schema.json',
      documents: './dev-test/star-wars/**/*.graphql',
      plugins: ['typescript', 'typescript-operations'],
    },
    './dev-test/star-wars/types.excludeQueryAlpha.ts': {
      schema: './dev-test/star-wars/schema.json',
      documents: ['./dev-test/star-wars/**/*.graphql', '!./dev-test/star-wars/**/ExcludeQueryAlpha.graphql'],
      plugins: ['typescript', 'typescript-operations'],
    },
    './dev-test/star-wars/types.excludeQueryBeta.ts': {
      schema: './dev-test/star-wars/schema.json',
      documents: ['./dev-test/star-wars/**/*.graphql', '!./dev-test/star-wars/**/ExcludeQueryBeta.graphql'],
      plugins: ['typescript', 'typescript-operations'],
    },
    './dev-test/star-wars/types.preResolveTypes.ts': {
      schema: './dev-test/star-wars/schema.json',
      documents: './dev-test/star-wars/**/*.graphql',
      config: { preResolveTypes: true },
      plugins: ['typescript', 'typescript-operations'],
    },
    './dev-test/star-wars/types.OnlyEnums.ts': {
      schema: './dev-test/star-wars/schema.json',
      documents: './dev-test/star-wars/**/*.graphql',
      config: { onlyEnums: true },
      plugins: ['typescript'],
    },
    './dev-test/star-wars/types.preResolveTypes.onlyOperationTypes.ts': {
      schema: './dev-test/star-wars/schema.json',
      documents: './dev-test/star-wars/**/*.graphql',
      config: { preResolveTypes: true, onlyOperationTypes: true },
      plugins: ['typescript', 'typescript-operations'],
    },
    './dev-test/test-schema/types.preResolveTypes.ts': {
      schema: './dev-test/test-schema/schema.graphql',
      documents: ['query test { testArr1 testArr2 testArr3 }'],
      config: { preResolveTypes: true },
      plugins: ['typescript', 'typescript-operations'],
    },
    './dev-test/test-schema/types.preResolveTypes.onlyOperationTypes.ts': {
      schema: './dev-test/test-schema/schema.graphql',
      documents: ['query test { testArr1 testArr2 testArr3 }'],
      config: { preResolveTypes: true, onlyOperationTypes: true },
      plugins: ['typescript', 'typescript-operations'],
    },
    './dev-test/star-wars/types.d.ts': {
      schema: './dev-test/star-wars/schema.json',
      config: { enumsAsTypes: true },
      plugins: ['typescript', 'typescript-operations'],
    },
    './dev-test/modules/': {
      schema: './dev-test/modules/*/types/*.graphql',
      preset: 'graphql-modules',
      presetConfig: { baseTypesPath: 'types.ts', filename: 'generated.ts' },
      plugins: ['typescript', 'typescript-resolvers'],
    },
    './dev-test/star-wars/types.globallyAvailable.d.ts': {
      schema: './dev-test/star-wars/schema.json',
      documents: './dev-test/star-wars/**/*.graphql',
      config: { enumsAsTypes: true, noExport: true },
      plugins: ['typescript', 'typescript-operations'],
    },
    './dev-test/star-wars/types.avoidOptionals.ts': {
      schema: './dev-test/star-wars/schema.json',
      documents: './dev-test/star-wars/**/*.graphql',
      config: { avoidOptionals: true },
      plugins: ['typescript', 'typescript-operations'],
    },
    './dev-test/star-wars/types.immutableTypes.ts': {
      schema: './dev-test/star-wars/schema.json',
      documents: './dev-test/star-wars/**/*.graphql',
      config: { immutableTypes: true },
      plugins: ['typescript', 'typescript-operations'],
    },
    './dev-test/star-wars/types.skipSchema.ts': {
      schema: './dev-test/star-wars/schema.json',
      documents: './dev-test/star-wars/**/*.graphql',
      plugins: ['typescript', 'typescript-operations'],
    },
    './dev-test/gql-tag-operations/gql/': {
      schema: './dev-test/gql-tag-operations/schema.graphql',
      documents: './dev-test/gql-tag-operations/src/**/*.ts',
      preset: 'client',
    },
    './dev-test/gql-tag-operations/graphql/': {
      schema: './dev-test/gql-tag-operations/schema.graphql',
      documents: './dev-test/gql-tag-operations/src/**/*.ts',
      preset: 'client',
    },
    './dev-test/gql-tag-operations-urql/gql/': {
      schema: './dev-test/gql-tag-operations-urql/schema.graphql',
      documents: './dev-test/gql-tag-operations-urql/src/**/*.ts',
      preset: 'client',
      presetConfig: { augmentedModuleName: '@urql/core' },
    },
    './dev-test/gql-tag-operations-masking/gql/': {
      schema: './dev-test/gql-tag-operations-masking/schema.graphql',
      documents: './dev-test/gql-tag-operations-masking/src/**/*.tsx',
      preset: 'client',
      presetConfig: { fragmentMasking: true },
    },
    './dev-test/test-null-value/result.d.ts': {
      schema: './dev-test/test-null-value/schema.graphql',
      documents: ['./dev-test/test-null-value/query.ts'],
      plugins: ['typescript', 'typescript-operations'],
      config: {
        // The combination of these two flags caused the following issue:
        // https://github.com/dotansimha/graphql-code-generator/pull/9709
        skipTypename: true,
        mergeFragmentTypes: true,
      },
    },
    './dev-test/subpath-import/result.d.ts': {
      schema: './dev-test/subpath-import/schema.graphql',
      plugins: ['typescript', 'typescript-resolvers'],
      config: {
        contextType: '\\#test-null-value/context#TestContext',
        fieldContextTypes: ['mutation.createUser#\\#test/root#FiedContextType'],
        enumValues: {
          RoleStatus: '\\#changeName/server/drizzle/schema#RoleStatus',
        },
      },
    },
    './dev-test/test-federation/generated/types.ts': {
      schema: './dev-test/test-federation/schema.gql',
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
  },
};

export default config;
