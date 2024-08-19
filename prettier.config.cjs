/* eslint-disable import/no-extraneous-dependencies */
const { plugins, ...prettierConfig } = require('@theguild/prettier-config');

module.exports = {
  ...prettierConfig,
  plugins: [
    ...plugins,
    // `prettier-plugin-svelte` and `svelte` packages used for formatting ```svelte code blocks in md/mdx files
    require('prettier-plugin-svelte'),
    // Sort classes in website
    require('prettier-plugin-tailwindcss'),
  ],
  tailwindConfig: './website/tailwind.config.ts',
};
