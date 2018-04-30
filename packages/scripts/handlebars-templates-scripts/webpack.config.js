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
  externals: [nodeExternals()],
  resolve: {
    mainFields: ['browser', 'main', 'module'],
    extensions: ['.ts', '.tsx', '.js', '.jsx']
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
