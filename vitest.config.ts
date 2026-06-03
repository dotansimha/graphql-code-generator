import { createRequire } from 'module';
import { dirname, resolve } from 'path';
import { defineConfig } from 'vitest/config';

// Use an absolute path to graphql/index.mjs so ALL imports (Vite-processed
// and Node.js-native) resolve to the same ESM module in Node.js's module cache,
// preventing graphql@17's devInstanceOf from detecting false cross-realm usage.
const _require = createRequire(
  // @ts-ignore __filename is injected by CJS
  import.meta.url,
);
// require.resolve('graphql') returns index.mjs in Node.js v24 (via module-sync condition)
const graphqlIndexMjs = resolve(dirname(_require.resolve('graphql')), 'index.mjs');

export const sharedConfig = defineConfig({
  resolve: {
    alias: {
      graphql: graphqlIndexMjs,
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
