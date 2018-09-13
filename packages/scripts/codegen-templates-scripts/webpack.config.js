const nodeExternals = require('webpack-node-externals');

module.exports = {
  context: '/src/',
  entry: './index.ts',
  output: {
    path: '/dist/',
    filename: 'index.js',
    libraryTarget: 'commonjs'
  },
  mode: 'production',
  target: 'node',
  optimization: {
    minimize: false
  },
  externals: [nodeExternals(), 'graphql', 'graphql-codegen-core', 'graphql-codegen-compiler', 'graphql-tag', 'lodash'],
  resolve: {
    mainFields: ['browser', 'main', 'module'],
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: {
      handlebars: 'handlebars/dist/handlebars.js'
    }
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'awesome-typescript-loader'
      },
      {
        test: /\.handlebars/,
        use: 'raw-loader'
      }
    ]
  }
};
