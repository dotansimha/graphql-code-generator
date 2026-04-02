import { defineProject, mergeConfig } from 'vitest/config';
import { sharedConfig } from '../../vitest.config.js';

export default mergeConfig(
  sharedConfig,
  defineProject({
    test: {
      name: 'examples-typescript-graphql-request',
      include: ['**/*.spec.ts'],
      testTimeout: 15_000,
    },
  }),
);
