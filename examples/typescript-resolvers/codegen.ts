import { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'https://swapi-graphql.netlify.app/.netlify/functions/index',
  generates: {
    './src/type-defs.d.ts': {
      plugins: ['typescript', 'typescript-resolvers'],
    },
  },
  hooks: { afterAllFileWrite: ['prettier --write'] },
};

export default config;
