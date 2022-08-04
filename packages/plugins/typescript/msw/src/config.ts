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
   * ```yaml
   *   config:
   *     link:
   *       name: stripe
   *       endpoint: https://api.stripe.com/graphql
   * ```
   */
  link?: {
    endpoint: string;
    name: string;
  };
}

export interface MSWRawPluginConfig extends RawClientSideBasePluginConfig, MSWConfig {}
export interface MSWPluginConfig extends ClientSideBasePluginConfig, MSWConfig {}
