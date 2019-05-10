const path = require('path');
const webpack = require('webpack');
const memoryfs = require('memory-fs');

module.exports = (fixture, options = {}) => {
  const compiler = webpack({
    context: __dirname,
    entry: `./fixtures/${fixture}`,
    output: {
      path: path.resolve(__dirname),
      filename: 'bundle.js',
    },
    module: {
      rules: [
        {
          test: /\.graphql$/,
          use: [
            {
              loader: path.resolve(__dirname, '../src/index.ts'),
            },
          ],
        },
      ],
    },
  });

  compiler.outputFileSystem = new memoryfs();

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) reject(err);
      if (stats.hasErrors()) reject(new Error(stats.toJson().errors));

      resolve(stats);
    });
  });
};
