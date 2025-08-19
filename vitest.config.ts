import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths() as any],
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
