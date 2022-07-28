import { withGuildDocs } from 'guild-docs/next.config';
import { CategoryToPackages } from './src/category-to-packages.mjs';

const PLUGINS_REDIRECTS = Object.entries(CategoryToPackages).flatMap(([category, packageNames]) =>
  packageNames.map(packageName => ({
    source: `/plugins/${packageName}`,
    destination: `/plugins/${category}/${packageName}`,
  }))
);

export default withGuildDocs({
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Todo: remove it before merge to master
    ignoreBuildErrors: true,
  },
  swcMinify: true,
  reactStrictMode: true,
  webpack(config) {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      module: false,
    };
    return config;
  },
  redirects: () =>
    [
      {
        source: '/docs/presets/:presetName',
        destination: '/plugins/:presetName-preset',
      },
      {
        source: '/docs/plugins/:pluginName',
        destination: '/plugins/:pluginName',
      },
      {
        source: '/docs/getting-started/config-reference/codegen-config',
        destination: '/docs/config-reference/codegen-config',
      },
      {
        source: '/docs/getting-started/codegen-config',
        destination: '/docs/config-reference/codegen-config',
      },
      {
        source: '/docs/getting-started/documents-field',
        destination: '/docs/config-reference/documents-field',
      },
      {
        source: '/docs/getting-started/schema-field',
        destination: '/docs/config-reference/schema-field',
      },
      {
        source: '/docs/getting-started/config-field',
        destination: '/docs/config-reference/config-field',
      },
      {
        source: '/docs/getting-started/lifecycle-hooks',
        destination: '/docs/config-reference/lifecycle-hooks',
      },
      {
        source: '/docs/getting-started/require-field',
        destination: '/docs/config-reference/require-field',
      },
      {
        source: '/docs/getting-started/naming-convention',
        destination: '/docs/config-reference/naming-convention',
      },
      {
        source: '/docs/getting-started/how-does-it-work',
        destination: '/docs/advanced/how-does-it-work',
      },
      ...PLUGINS_REDIRECTS,
    ].map(redirect => ({
      ...redirect,
      permanent: true,
    })),
});
