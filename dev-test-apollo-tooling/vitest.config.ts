import { defineProject, mergeConfig } from 'vitest/config';
import { sharedConfig } from '../vitest.config.js';

export default mergeConfig(
  sharedConfig,
  defineProject({
    test: {
      name: 'dev-test-apollo-tooling',
      include: ['tests/**/*.spec.ts', 'tests/**/*.test.ts'],
    },
  })
);
