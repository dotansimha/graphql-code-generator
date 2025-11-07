import { defineProject, mergeConfig } from 'vitest/config';
import { sharedConfig } from '../../../vitest.config.js';

export default mergeConfig(
  sharedConfig,
  defineProject({
    test: {
      name: 'graphql-codegen-testing',
      include: ['**/*.spec.ts'],
    },
  })
);
