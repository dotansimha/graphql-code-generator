module.exports = {
  root: true,
  extends: ['@theguild'],
  rules: {
    'no-empty': 'off',
    'no-prototype-builtins': 'off',
    'no-useless-constructor': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/no-namespace': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/ban-ts-ignore': 'off',
    '@typescript-eslint/ban-types': 'off',
    'import/no-extraneous-dependencies': [
      'error',
      { devDependencies: ['**/*.test.ts', '**/*.spec.ts', '**/test/**/*.ts'] },
    ],

    // todo: enable
    'unicorn/prefer-node-protocol': 'off',
    'no-restricted-syntax': 'off',
    'unicorn/filename-case': 'off',
    'import/extensions': 'off',
    'import/no-default-export': 'off',
    'no-undef': 'off',
    'n/no-restricted-import': 'off',
  },
  env: {
    es6: true,
    node: true,
  },
  overrides: [
    {
      files: ['**/tests/**/*.ts', '**/graphql-codegen-testing/**/*.ts', '*.spec.ts'],
      env: {
        jest: true,
      },
      rules: {
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        'import/no-extraneous-dependencies': 'off',
      },
    },
  ],
  ignorePatterns: ['dist', 'node_modules', 'dev-test', 'test-files', 'examples/front-end', '.bob'],
};
