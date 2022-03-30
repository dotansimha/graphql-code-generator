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
  plugins: [
    // `prettier-plugin-svelte` and `svelte` packages used for formatting ```svelte code blocks in md/mdx files
    'prettier-plugin-svelte',
    // for prettifying shellscript, Dockerfile, properties, gitignore, dotenv
    'prettier-plugin-sh',
  ],
};
