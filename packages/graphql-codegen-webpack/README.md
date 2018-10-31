# `graphql-codegen-webpack`

Integrates GraphQL Code Generator with Webpack

```javascript
const { GraphQLCodegenPlugin } = require('graphql-codegen-webpack');

new GraphQLCodegenPlugin({
  schema: 'src/schema.graphql',
  template: 'graphql-codegen-typescript-template',
  out: 'src/types.ts',
  overwrite: true
});
```

Full example of webpack configuration:

```javascript
const { GraphQLCodegenPlugin } = require('graphql-codegen-webpack');

module.exports = {
  mode: 'development',
  devtool: 'inline-source-map',
  entry: './src/index.ts',
  output: {
    filename: 'bundle.js'
  },
  resolve: {
    extensions: ['.ts', '.ts', '.js', '.mjs']
  },
  plugins: [
    // GraphQL Code Generator
    new GraphQLCodegenPlugin({
      schema: 'src/schema.graphql',
      template: 'graphql-codegen-typescript-template',
      out: 'src/types.ts',
      overwrite: true
    })
  ],
  module: {
    rules: [
      { test: /\.ts$/, loader: 'ts-loader' },
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto'
      }
    ]
  }
};
```
