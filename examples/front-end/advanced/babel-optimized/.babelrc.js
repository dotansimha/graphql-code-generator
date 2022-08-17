const { babelPlugin } = require('@graphql-codegen/gql-tag-operations-preset');

module.exports = {
  presets: ['react-app'],
  plugins: [[babelPlugin, { artifactDirectory: './src/gql' }]],
};
