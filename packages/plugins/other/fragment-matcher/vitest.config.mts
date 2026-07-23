import { defineProject, mergeConfig } from 'vitest/config';
import { sharedConfig } from '../../../../vitest.config.mjs';

export default mergeConfig(
  sharedConfig,
  defineProject({
    test: {
      name: 'fragment-matcher',
      include: ['**/*.spec.ts'],
    },
  }),
);
