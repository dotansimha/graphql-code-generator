import { defineProject, mergeConfig } from 'vitest/config';
import { sharedConfig } from '../../vitest.config.js';

export default mergeConfig(
  sharedConfig,
  defineProject({
    test: {
      name: 'cli',
      setupFiles: './vitest.setup.ts',
      include: ['**/*.spec.ts'],
      server: {
        deps: {
          inline: [
            // `@graphql-tools/url-loader` needs to be inlined
            // because there is a test that triggers dynamically importing `some-fetch` mocked package
            // Without this, `@graphql-tools/url-loader` acts outside of Vitest mocking
            // i.e. does not know about the `some-fetch` mocked package
            '@graphql-tools/url-loader',
          ],
        },
      },
    },
  })
);
