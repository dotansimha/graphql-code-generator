const nodeExternals = require('webpack-node-externals');

module.exports = {
  context: __dirname + "/src/",
  entry: "./index.ts",
  output: {
    path: __dirname + "/dist/",
    filename: "index.js",
    libraryTarget: "commonjs"
  },
  target: 'node',
  externals: [nodeExternals()],
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx']
  },
  devtool: 'source-map',
  module: {
    loaders: [
      {
        test: /\.tsx?$/,
        loader: 'awesome-typescript-loader'
      },
      {
        test: /\.handlebars/,
        use: 'raw-loader'
      }
    ]
  },
};
