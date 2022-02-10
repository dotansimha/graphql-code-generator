module.exports = {
  root: true,
  ignorePatterns: ['!.*', '.next'],
  reportUnusedDisableDirectives: true,
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'next', 'prettier'],
  settings: {
    next: {
      rootDir: './src',
    },
  },
  rules: {
    'no-else-return': ['error', { allowElseIf: false }],
    'react/jsx-curly-brace-presence': ['error', 'never'],
    'react/jsx-filename-extension': ['error', { extensions: ['.tsx'] }],
  },
  overrides: [
    {
      files: ['.babelrc.js', '.eslintrc.js', 'next-i18next.config.js', 'next.config.js'],
      env: {
        node: true,
      },
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
  ],
};
