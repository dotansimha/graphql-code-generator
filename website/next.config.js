const { register } = require('esbuild-register/dist/node');

register({
  extensions: ['.ts', '.tsx'],
});

const { i18n } = require('./next-i18next.config');
const { withGuildDocs } = require('@guild-docs/server');
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
    config.resolve.fallback = { ...config.resolve.fallback, module: false };
    return config;
  },
});
