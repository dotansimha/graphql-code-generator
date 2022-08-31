import { withGuildDocs } from 'guild-docs/next.config';
import { CategoryToPackages } from './src/category-to-packages.mjs';

const PLUGINS_REDIRECTS = Object.entries(CategoryToPackages).flatMap(([category, packageNames]) =>
  packageNames.map(packageName => [`/plugins/${packageName}`, `/plugins/${category}/${packageName}`])
);
export default withGuildDocs({
  basePath: process.env.NEXT_BASE_PATH && process.env.NEXT_BASE_PATH !== '' ? process.env.NEXT_BASE_PATH : undefined,
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    urlImports: [
      'https://graphql-modules.com/assets/subheader-logo.svg',
      'https://pbs.twimg.com/profile_images/1004185780313395200/ImZxrDWf_400x400.jpg',
      'https://raw.githubusercontent.com/mswjs/msw/HEAD/media/msw-logo.svg',
    ],
    images: {
      unoptimized: true, // doesn't work with `next export`
      allowFutureImage: true,
    },
  },
  typescript: {
    // Todo: remove it before merge to master
    ignoreBuildErrors: true,
  },
  webpack(config) {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      module: false,
    };
    return config;
  },
  redirects: () =>
    Object.entries({
      '/docs/presets/:presetName': '/plugins/:presetName-preset',
      '/docs/plugins/:pluginName': '/plugins/:pluginName',
      '/docs/getting-started/config-reference/codegen-config': '/docs/config-reference/codegen-config',
      '/docs/getting-started/codegen-config': '/docs/config-reference/codegen-config',
      '/docs/getting-started/documents-field': '/docs/config-reference/documents-field',
      '/docs/getting-started/schema-field': '/docs/config-reference/schema-field',
      '/docs/getting-started/config-field': '/docs/config-reference/config-field',
      '/docs/getting-started/lifecycle-hooks': '/docs/config-reference/lifecycle-hooks',
      '/docs/getting-started/require-field': '/docs/config-reference/require-field',
      '/docs/getting-started/naming-convention': '/docs/config-reference/naming-convention',
      '/docs/getting-started/how-does-it-work': '/docs/advanced/how-does-it-work',
    })
      .concat(PLUGINS_REDIRECTS)
      .map(([from, to]) => ({
        source: from,
        destination: to,
        permanent: true,
      })),
});
