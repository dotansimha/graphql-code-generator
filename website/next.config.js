import { withGuildDocs } from '@theguild/components/next.config';
import { CategoryToPackages } from './src/category-to-packages.mjs';

const PLUGINS_REDIRECTS = Object.entries(CategoryToPackages).flatMap(([category, packageNames]) =>
  packageNames.map(packageName => [`/plugins/${packageName}`, `/plugins/${category}/${packageName}`])
);

export default withGuildDocs({
  nextraConfig: {
    autoImportThemeStyle: false,
  },
  output: 'export',
  experimental: {
    urlImports: [
      'https://graphql-modules.com/assets/subheader-logo.svg',
      'https://pbs.twimg.com/profile_images/1004185780313395200/ImZxrDWf_400x400.jpg',
      'https://raw.githubusercontent.com/mswjs/msw/HEAD/media/msw-logo.svg',
    ],
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
    return config;
  },
  redirects: () =>
    Object.entries({
      '/live-demo': '/',
      '/docs/presets/presets-index': '/plugins',
      '/docs/guides': '/docs/guides/react',
      '/docs/plugins/typescript-server': '/plugins/typescript/typescript-resolvers',
      '/docs/react': '/docs/guides/react',
      '/docs/guides/react-vue-angular': '/docs/guides/react-vue',
      '/docs/guides/front-end-typescript-only': '/docs/guides/react-vue',
      '/plugins/other': '/plugins',
      '/plugins/c-sharp': '/plugins/c-sharp/c-sharp-operations',
      '/docs/integrations': '/plugins',
      '/docs/advanced': '/docs/advanced/generated-files-colocation',
      '/plugins/java-installation': '/plugins/java/java',
      '/docs/plugins/c-sharp': '/plugins/c-sharp/c-sharp-operations',
      '/plugins/dart/flutter': '/plugins/dart/flutter-freezed',
      '/docs/getting-started/programmatic-usage': '/docs/advanced/programmatic-usage',
      '/docs/tags': '/docs/getting-started',
      '/docs': '/docs/getting-started',
      '/docs/plugins': '/plugins',
      '/docs/generated-config/base-documents-visitor': '/plugins',
      '/docs/config-reference': '/docs/config-reference/codegen-config',
      '/docs/config-reference/': '/docs/config-reference/codegen-config',
      '/plugins/flow': '/plugins/flow/flow-operations',
      '/plugins/typescript-common': '/plugins/typescript/typescript',
      '/plugins/other/typescript-operations': '/plugins/typescript/typescript-operations',
      '/plugins/typescript-urql-graphcache': '/plugins/typescript/typescript-urql',
      '/plugins/typescript/typescript-urql-graphcache': '/plugins/typescript/typescript-urql',
      '/docs/generated-config/:presetName-preset': '/plugins/:presetName-preset',
      '/docs/generated-config/:pluginName': '/plugins/:pluginName',
      '/docs/custom-codegen/write-your-plugin': '/docs/custom-codegen',
      '/plugins/typescript': '/plugins/typescript/typescript',
      '/docs/plugins/typescript-common': '/plugins/typescript/typescript',
      '/docs/presets/:presetName': '/plugins/:presetName-preset',
      '/docs/plugins/:pluginName': '/plugins/:pluginName',
      '/docs/plugins/client-note': '/plugins',
      '/docs/getting-started/config-reference/codegen-config': '/docs/config-reference/codegen-config',
      '/docs/getting-started/codegen-config': '/docs/config-reference/codegen-config',
      '/docs/getting-started/documents-field': '/docs/config-reference/documents-field',
      '/docs/getting-started/schema-field': '/docs/config-reference/schema-field',
      '/docs/getting-started/config-field': '/docs/config-reference/config-field',
      '/docs/getting-started/lifecycle-hooks': '/docs/config-reference/lifecycle-hooks',
      '/docs/getting-started/require-field': '/docs/config-reference/require-field',
      '/docs/getting-started/naming-convention': '/docs/config-reference/naming-convention',
      '/docs/getting-started/how-does-it-work': '/docs/advanced/how-does-it-work',
      '/docs/guides/react': '/docs/guides/react-vue',
      '/docs/guides/vue': '/docs/guides/react-vue',
      '/plugins/typescript-svelte-urql': '/plugins',
      '/plugins/presets': '/plugins',
      '/docs/getting-startedinstallation': '/docs/getting-started',
      '/docs/plugins/typescript-graphql-requesttypescript-graphql-request':
        '/plugins/typescript/typescript-graphql-request',
      '/plugins/typescript/fragment-matcher': '/plugins/other/fragment-matcher',
      '/plugins/core': '/plugins',
      '/plugins/dart': '/plugins',
      '/docs/presets': '/plugins',
      '/home': '/',
      '/plugins/presets/client': '/docs/guides/react-vue',
      '/plugins/presets/client-preset': '/docs/guides/react-vue',
      '/plugins/typescript/add': '/plugins/other/add',
      '/plugins/typescript/typescript-add': '/plugins/other/add',
      '/docs/generated-config/base-visitor': '/docs/custom-codegen/using-visitor',
      '/plugins/base-visitor': '/docs/custom-codegen/using-visitor',
      '/plugins/typescript/instrospection': '/plugins/other/introspection',
      '/docs/custom-codegen/using-handlebars': '/docs/custom-codegen',
      '/plugins/presets/near-operation-file': '/plugins/presets/near-operation-file-preset',
      '/plugins/typescript/near-operation-file': '/plugins/presets/near-operation-file-preset',
      '/typescript/typescript-resolvers': '/plugins/typescript/typescript-resolvers',
      '/docs/guides/graphql-cli': '/docs/migration/graphql-cli',
      '/plugins/presets/gql-tag-operations-preset': '/plugins/presets/preset-client',
    })
      .concat(PLUGINS_REDIRECTS)
      .map(([from, to]) => ({
        source: from,
        destination: to,
        permanent: true,
      })),
});
