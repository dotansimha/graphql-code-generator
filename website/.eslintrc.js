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
};
