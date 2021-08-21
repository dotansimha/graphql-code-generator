const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

module.exports = function() {
  return {
    name: 'custom-plugin',
    configureWebpack(config, isServer) {
      const { plugins = [] } = config;

      if (!isServer) {
        plugins.push(new NodePolyfillPlugin());
      }

      return {
        plugins,
        resolve: {
          fallback: {
            module: false
          }
        }
      };
    },
  };
};
