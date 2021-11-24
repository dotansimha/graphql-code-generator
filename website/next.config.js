const { register } = require('esbuild-register/dist/node');
const { withGuildDocs } = require('@guild-docs/server');
const { i18n } = require('./next-i18next.config');
register({ extensions: ['.ts', '.tsx'] });
const { getRoutes } = require('./routes.ts');

module.exports = withGuildDocs({
  i18n,
  getRoutes,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Todo: remove it before merge to master
    ignoreBuildErrors: true,
  },
  webpack(config) {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      module: false, // Fix error - Module not found: Can't resolve 'module'
      fs: false,
      repl: false,
      console: false,
    };
    return config;
  },
  swcMinify: false,
});
