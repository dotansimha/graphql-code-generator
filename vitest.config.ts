import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export const sharedConfig = defineConfig({
  plugins: [tsconfigPaths() as any],
  resolve: {
    alias: {
      graphql: 'graphql/index.js',
    },
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
