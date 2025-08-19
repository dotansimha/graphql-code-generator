import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      graphql: 'graphql/index.js',
    },
  },
  test: {
    globals: true,
    include: ['packages/**/resolvers/**/*.spec.ts'],
  },
});
