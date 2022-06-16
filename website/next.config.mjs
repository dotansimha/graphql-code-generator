import nextra from 'nextra';

const withNextra = nextra({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.tsx',
  unstable_staticImage: true,
});

export default withNextra({
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
  redirects: () => [
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
  ],
});
