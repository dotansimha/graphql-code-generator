module.exports = {
  trailingComma: 'es5',
  printWidth: 120,
  singleQuote: true,
  arrowParens: 'avoid',
  overrides: [
    {
      files: '*.{md,mdx}',
      options: {
        semi: false,
        trailingComma: 'none',
      },
    },
  ],
  // `svelte` and `prettier-plugin-svelte` packages used for formatting ```svelte code blocks in md/mdx files
  plugins: ['prettier-plugin-svelte'],
};
