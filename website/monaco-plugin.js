const path = require('path');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

const MONACO_DIR = path.resolve(__dirname, '../node_modules/monaco-editor');

module.exports = function() {
  return {
    name: 'monaco-plugin',
    configureWebpack(config) {
      const existingCssRule = config.module.rules.find(r => r.test.toString() === '/\\.css$/');
      
      existingCssRule.exclude = [
        existingCssRule.exclude,
        MONACO_DIR
      ];

      config.module.rules.unshift({
        test: /\.css$/,
        include: MONACO_DIR,
        use: ['style-loader', 'css-loader'],
      });

      config.module.rules.unshift({
          test: /\.ttf$/,
          use: ['file-loader']
      })

      config.plugins = [
        ...(config.plugins || []),
        new MonacoWebpackPlugin({
          publicPath: '/'
        })
      ];
    },
  };
};