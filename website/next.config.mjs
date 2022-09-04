import { writeFile } from 'fs/promises';
import { withGuildDocs } from 'guild-docs/next.config';
import { join } from 'path';
import { CategoryToPackages } from './src/category-to-packages.mjs';

const PLUGINS_REDIRECTS = Object.entries(CategoryToPackages).flatMap(([category, packageNames]) =>
  packageNames.map(packageName => [`/plugins/${packageName}`, `/plugins/${category}/${packageName}`])
);

class RunPromiseWebpackPlugin {
  asyncHook;

  constructor(asyncHook) {
    this.asyncHook = asyncHook;
  }

  apply(compiler) {
    compiler.hooks.beforeCompile.tapPromise('RunPromiseWebpackPlugin', this.asyncHook);
  }
}

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

    config.plugins.push(
      new RunPromiseWebpackPlugin(async () => {
        const outDir = meta.dir;
        const outFile = join(outDir, './public/_redirects');

        try {
          const redirects = meta.config.redirects
            ? Array.isArray(typeof meta.config.redirects)
              ? typeof meta.config.redirects
              : await meta.config.redirects()
            : [];

          if (redirects.length > 0) {
            const redirectsTxt = redirects
              .map(r => `${r.source} ${r.destination} ${r.permanent ? '301' : '302'}`)
              .join('\n');
            await writeFile(outFile, redirectsTxt);
            console.info(`✅ "_redirects" file created under "public" dir, with ${redirects.length} records`);
          } else {
            console.warn(`No redirects defined, no "_redirect" file is created!`);
          }
        } catch (e) {
          console.error('Error while generating redirects', e);
          throw new Error(`Failed to generate "_redirects" file during build: ${e.message}`);
        }
      })
    );

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
