module.exports = {
  trailingComma: 'es5',
  printWidth: 120,
  singleQuote: true,
  arrowParens: 'avoid',
  overrides: [
    {
      files: '*.flow.js',
      options: {
        parser: 'flow',
      },
    },
  ],
  // `svelte` and `prettier-plugin-svelte` packages used for formatting ```svelte code blocks in md/mdx files
  plugins: ['prettier-plugin-svelte'],
};
