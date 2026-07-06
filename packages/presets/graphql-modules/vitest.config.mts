import { defineProject, mergeConfig } from 'vitest/config';
import { sharedConfig } from '../../../vitest.config.mjs';

export default mergeConfig(
  sharedConfig,
  defineProject({
    test: {
      name: 'graphql-modules-preset',
      setupFiles: './vitest.setup.ts',
      include: ['**/*.spec.ts'],
    },
  }),
);
