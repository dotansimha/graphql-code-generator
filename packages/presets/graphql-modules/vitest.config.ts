import { defineProject, mergeConfig } from 'vitest/config';
import { sharedConfig } from '../../../vitest.config.js';

export default mergeConfig(
  sharedConfig,
  defineProject({
    test: {
      name: 'graphql-modules-preset',
      setupFiles: './vitest.setup.ts',
      include: ['**/*.spec.ts'],
    },
  })
);
