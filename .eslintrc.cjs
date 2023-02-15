module.exports = {
  root: true,
  extends: ['@theguild'],
  rules: {
    'no-empty': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
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
    'unicorn/filename-case': 'off',
    'import/extensions': 'off',
    'import/no-default-export': 'off',
    // todo: enable in v3
    'unicorn/prefer-node-protocol': 'off',
    'prefer-object-has-own': 'off',
  },
  env: {
    node: true,
  },
  overrides: [
    {
      files: ['website/**'],
      extends: '@theguild/eslint-config/react',
    },
    {
      files: ['**/tests/**/*.{js,ts,tsx}', '**/graphql-codegen-testing/**/*.ts', '*.spec.ts'],
      env: {
        jest: true,
      },
      rules: {
        'import/no-extraneous-dependencies': 'off',
      },
    },
    {
      files: '**/tests/fixtures/*.ts',
      rules: {
        '@typescript-eslint/no-unused-vars': 'off',
      },
    },
  ],
  ignorePatterns: ['dev-test', 'examples/front-end', 'website', 'examples/**/gql/**', '**/react-app-env.d.ts'],
};
