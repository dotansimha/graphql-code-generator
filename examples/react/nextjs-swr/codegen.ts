// eslint-disable-next-line import/no-extraneous-dependencies
// @ts-ignore
import { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'https://swapi-graphql.netlify.app/.netlify/functions/index',
  documents: ['components/**/*.tsx', 'pages/**/*.tsx'],
  generates: {
    './gql/': {
      preset: 'client',
    },
  },
  hooks: { afterAllFileWrite: ['prettier --write'] },
};

export default config;
