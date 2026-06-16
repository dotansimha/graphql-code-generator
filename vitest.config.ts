import { defineConfig } from 'vitest/config';

export const sharedConfig = defineConfig({
  resolve: {
    alias: {
      graphql: 'graphql/index.js',
    },
    tsconfigPaths: true,
  },
  test: {
    globals: true,
  },
});

export default defineConfig({
  test: {
    projects: ['packages/**/vitest.config.ts', 'examples/**/vitest.config.ts'],
    watch: false,
  },
});
