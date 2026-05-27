import importPlugin from 'eslint-plugin-import';
import tailwindcss from 'eslint-plugin-tailwindcss';
import unicorn from 'eslint-plugin-unicorn';
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

// Use sub-modules of @theguild/eslint-config that don't trigger @rushstack/eslint-patch
// (the main index.js requires @rushstack/eslint-patch/modern-module-resolution which doesn't support ESLint 10)
// FlatCompat uses CJS require() which can't load ESM-only plugins (unicorn v57+).
// We import them directly and patch the FlatCompat output.
const theGuildIndex = compat.config({
  reportUnusedDisableDirectives: true,
  overrides: [
    {
      files: ['*.{,c,m}{j,t}s{,x}'],
      extends: ['./node_modules/@theguild/eslint-config/src/base.js'],
    },
    {
      files: ['*.{,c,m}ts{,x}'],
      excludedFiles: ['**/*.md{,x}/*'],
      parserOptions: {
        projectService: true,
      },
      rules: {
        '@typescript-eslint/prefer-optional-chain': 'error',
      },
    },
    {
      files: ['*.{,c,m}ts{,x}'],
      rules: {
        '@typescript-eslint/consistent-type-assertions': 'error',
      },
    },
    {
      files: ['*.c{j,t}s'],
      env: { node: true },
      rules: { '@typescript-eslint/no-var-requires': 'off' },
    },
    {
      files: [
        'jest.config.js',
        'webpack.config.js',
        'bob.config.js',
        'babel.config.js',
        'postcss.config.{js,cjs}',
        'rollup.config.js',
        'next-sitemap.config.js',
      ],
      env: { node: true },
    },
    {
      files: ['*.{spec,test}.*'],
      env: { jest: true },
      rules: { 'import/extensions': ['error', 'never'] },
    },
    {
      files: ['vite.config.ts', 'jest.config.js', '*.d.ts', 'tsup.config.ts', 'prettier.config.js'],
      rules: { 'import/no-default-export': 'off' },
    },
    {
      files: ['*.d.ts'],
      rules: {
        'no-var': 'off',
      },
    },
  ],
});

export default [
  // Global ignores (replaces ignorePatterns + .gitignore patterns)
  {
    ignores: [
      '.bob/**',
      '.next/**',
      '.cache/**',
      '**/temp/**',
      'dev-test/**',
      'website/**',
      'examples/**',
      '**/tests/test-files/**',
      '**/tests/test-documents/**',
      '**/react-app-env.d.ts',
      'packages/presets/swc-plugin/tests/fixtures/simple-uppercase-operation-name.js',
      'packages/presets/swc-plugin/tests/fixtures/simple-uppercase-operation-name.other-dir.js',
      '**/build/**',
      '**/dist/**',
      '**/*.json',
    ],
  },

  // @theguild base config (via FlatCompat)
  // Patch: replace broken CJS-resolved unicorn plugin with the properly imported ESM version
  ...theGuildIndex.map(config =>
    config.plugins?.unicorn ? { ...config, plugins: { ...config.plugins, unicorn } } : config,
  ),

  // Tailwind CSS plugin (flat config)
  ...tailwindcss.configs['flat/recommended'],

  // Project-level rule overrides
  {
    plugins: {
      import: importPlugin,
    },
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
      'import/no-extraneous-dependencies': 'error',

      // todo: enable
      'unicorn/filename-case': 'off',
      'import/extensions': 'off',
      'import/no-default-export': 'off',
      // todo: enable in v3
      'unicorn/prefer-node-protocol': 'off',
      'prefer-object-has-own': 'off',

      // Rules introduced/tightened by updated plugins in ESLint 10 migration
      'preserve-caught-error': 'off',
      '@typescript-eslint/prefer-optional-chain': 'off',
      'no-useless-assignment': 'off',
    },
  },

  // Node environment for all files
  ...compat.env({ node: true }),

  // Website files: extend @theguild react config
  ...compat
    .config({
      extends: ['./node_modules/@theguild/eslint-config/src/react.js'],
    })
    .map(config => ({ ...config, files: ['website/**'] })),

  // Test files
  {
    files: [
      '**/*.spec.ts',
      '**/tests/**/*.{js,ts,tsx,cjs}',
      '**/graphql-codegen-testing/**/*.ts',
      '**/vitest.config.ts',
      '**/vitest.setup.ts',
      '**/__mocks__/*',
    ],
    rules: {
      'import/no-extraneous-dependencies': 'off',
      '@typescript-eslint/no-require-imports': 'off',
    },
  },

  // Test fixtures
  {
    files: ['**/tests/fixtures/*.{ts,js}'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },

  // Scripts and config files
  {
    files: ['scripts/*.{ts,js}', 'prettier.config.cjs'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
];
