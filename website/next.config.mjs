import { withGuildDocs } from 'guild-docs/next.config';
import { applyUnderscoreRedirects } from 'guild-docs/underscore-redirects';
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
  webpack(config, meta) {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      module: false,
    };

    applyUnderscoreRedirects(config, meta);

    return config;
  },
  redirects: () =>
    Object.entries({
      '/docs/presets/presets-index': '/plugins',
      '/docs/guides': '/guides/react',
      '/docs/plugins/typescript-server': '/plugins/typescript/typescript-resolvers',
      '/docs/react': '/docs/guides/react',
      '/docs/custom-codegen/contributing': '/docs/custom-codegen/contributing',
      '/plugins/other': '/plugins',
      '/docs/advanced': '/docs/advanced/generated-files-colocation',
      '/plugins/java-installation': '/plugins/java/java',
      '/docs/plugins/c-sharp': '/plugins/c-sharp/c-sharp-operations',
      '/plugins/dart/flutter': '/plugins/dart/flutter-freezed',
      '/docs/getting-started/programmatic-usage': '/docs/advanced/programmatic-usage',
      '/docs/tags': '/docs/getting-started',
      '/docs': '/docs/getting-started',
      '/docs/plugins': '/plugins',
      '/docs/config-reference': '/docs/config-reference/codegen-config',
      '/docs/config-reference/': '/docs/config-reference/codegen-config',
      '/docs/generated-config/:presetName-preset': '/plugins/:presetName-preset',
      '/docs/generated-config/:pluginName': '/plugins/:pluginName',
      '/docs/custom-codegen/write-your-plugin': '/docs/custom-codegen',
      '/plugins/typescript': '/plugins/typescript/typescript',
      '/docs/plugins/typescript-common': '/plugins/typescript/typescript',
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
