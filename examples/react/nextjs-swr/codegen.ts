// eslint-disable-next-line import/no-extraneous-dependencies
import { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'https://swapi-graphql.netlify.app/.netlify/functions/index',
  documents: ['components/**/*.tsx', 'pages/**/*.tsx'],
  generates: {
    './gql/': {
      preset: 'client',
      plugins: [],
    },
  },
  hooks: { afterAllFileWrite: ['prettier --write'] },
};

export default config;
