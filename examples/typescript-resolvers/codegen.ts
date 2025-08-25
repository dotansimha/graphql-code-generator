import { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: './src/main.ts',
  generates: {
    './src/type-defs.d.ts': {
      plugins: ['typescript', 'typescript-resolvers'],
    },
  },
  hooks: { afterAllFileWrite: ['prettier --write'] },
};

export default config;
