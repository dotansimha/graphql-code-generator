import prettierConfig from '@theguild/prettier-config';

export default {
  ...prettierConfig,
  plugins: [...prettierConfig.plugins, 'prettier-plugin-svelte', 'prettier-plugin-tailwindcss'],
  importOrderParserPlugins: [
    'explicitResourceManagement',
    ...prettierConfig.importOrderParserPlugins,
  ],
};
