import { createRequire } from 'module';
import { withGuildDocs } from '@guild-docs/server';
import { register } from 'esbuild-register/dist/node.js';
import { i18n } from './next-i18next.config.js';

const require = createRequire(import.meta.url);

register({ extensions: ['.ts', '.tsx'] });

const { getRoutes } = require('./routes.ts');

export default withGuildDocs({
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
  async redirects() {
    return [
      {
        source: '/docs/presets/:presetName',
        destination: '/plugins/:presetName-preset',
        permanent: true,
      },
      {
        source: '/docs/plugins/:pluginName',
        destination: '/plugins/:pluginName',
        permanent: true,
      },
      {
        source: '/docs/getting-started/config-reference/codegen-config',
        destination: '/docs/config-reference/codegen-config',
        permanent: true,
      },
      {
        source: '/docs/getting-started/codegen-config',
        destination: '/docs/config-reference/codegen-config',
        permanent: true,
      },
      {
        source: '/docs/getting-started/documents-field',
        destination: '/docs/config-reference/documents-field',
        permanent: true,
      },
      {
        source: '/docs/getting-started/schema-field',
        destination: '/docs/config-reference/schema-field',
        permanent: true,
      },
      {
        source: '/docs/getting-started/config-field',
        destination: '/docs/config-reference/config-field',
        permanent: true,
      },
      {
        source: '/docs/getting-started/lifecycle-hooks',
        destination: '/docs/config-reference/lifecycle-hooks',
        permanent: true,
      },
      {
        source: '/docs/getting-started/require-field',
        destination: '/docs/config-reference/require-field',
        permanent: true,
      },
      {
        source: '/docs/getting-started/naming-convention',
        destination: '/docs/config-reference/naming-convention',
        permanent: true,
      },
      {
        source: '/docs/getting-started/how-does-it-work',
        destination: '/docs/advanced/how-does-it-work',
        permanent: true,
      },
    ];
  },
});
