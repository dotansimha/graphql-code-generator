import { defineProject, mergeConfig } from 'vitest/config';
import { sharedConfig } from '../../../../vitest.config.mjs';

export default mergeConfig(
  sharedConfig,
  defineProject({
    test: {
      name: 'typescript-resolvers',
      include: ['**/*.spec.ts'],
    },
  }),
);
