import { defineProject, mergeConfig } from 'vitest/config';
import { sharedConfig } from '../../vitest.config.mjs';

export default mergeConfig(
  sharedConfig,
  defineProject({
    test: {
      name: 'examples-yoga-tests',
      include: ['**/*.spec.ts'],
    },
  }),
);
