module.exports = {
  singleQuote: true,
  arrowParens: 'avoid',
  printWidth: 120,
  overrides: [
    {
      files: '*.{md,mdx}',
      options: {
        semi: false,
        trailingComma: 'none',
      },
    },
  ],
};
