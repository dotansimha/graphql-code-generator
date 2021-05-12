const path = require('path');
const { languagesArr } = require('monaco-editor-webpack-plugin/out/languages');

const yamlLang = languagesArr.find(t => t.label === 'yaml');

yamlLang.entry = [
  yamlLang.entry,
  '../../monaco-yaml/lib/esm/monaco.contribution'
];
yamlLang.worker = {
  id: 'vs/language/yaml/yamlWorker',
  entry: '../../monaco-yaml/lib/esm/yaml.worker.js'
}

const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

const MONACO_DIR = path.resolve(__dirname, '../node_modules/monaco-editor');

const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

module.exports = function () {
  return {
    name: 'monaco-plugin',
    configureWebpack(config) {
      const existingCssRule = config.module.rules.find(r => r.test.toString() === '/\\.css$/');

      existingCssRule.exclude = [
        existingCssRule.exclude,
        MONACO_DIR
      ];

      return {
        module: {
          rules: [
            {
              test: /\.ttf$/,
              use: ['file-loader'],
            },
            {
              test: /\.css$/,
              include: MONACO_DIR,
              use: ['style-loader', 'css-loader'],
            },
          ],
        },
        plugins: [...(config.plugins || []), new MonacoWebpackPlugin(), new NodePolyfillPlugin()],
      };
    },
  };
};