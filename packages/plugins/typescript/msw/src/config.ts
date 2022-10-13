import { RawClientSideBasePluginConfig, ClientSideBasePluginConfig } from '@graphql-codegen/visitor-plugin-common';

/**
 * @description This plugin generates `msw` (https://github.com/mswjs/msw) mock handlers with TypeScript typings.
 */
export interface MSWConfig {
  /**
   * @description GraphQL endpoint to use when working with multiple backends.
   *
   * @see https://mswjs.io/docs/api/graphql/link
   *
   * @exampleMarkdown
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file.ts': {
   *        // plugins...
   *        config: {
   *          link: {
   *            name: 'stripe',
   *            endpoint: 'https://api.stripe.com/graphql'
   *          }
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  link?: {
    endpoint: string;
    name: string;
  };
}

export interface MSWRawPluginConfig extends RawClientSideBasePluginConfig, MSWConfig {}
export interface MSWPluginConfig extends ClientSideBasePluginConfig, MSWConfig {}
