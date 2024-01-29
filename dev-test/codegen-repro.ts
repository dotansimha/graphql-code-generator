import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  ignoreNoDocuments: true,
  emitLegacyCommonJSImports: false,
  generates: {
    './dev-test/toast-repro/gql/': {
      schema: './dev-test/gql-tag-operations/schema.graphql',
      documents: ['./dev-test/gql-tag-operations/src/index.ts', './dev-test/gql-tag-operations/src/bar.ts'],
      preset: 'client',
    },
  },
};

export default config;
