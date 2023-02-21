// eslint-disable-next-line import/no-extraneous-dependencies -- should be in devDeps
const { babelOptimizerPlugin } = require('@graphql-codegen/client-preset');

module.exports = {
  presets: ['react-app'],
  plugins: [[babelOptimizerPlugin, { artifactDirectory: './src/gql' }]],
};
