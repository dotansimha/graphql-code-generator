import { RawClientSideBasePluginConfig } from '@graphql-codegen/visitor-plugin-common';

/**
 * @description This plugin generates `msw` (https://github.com/mswjs/msw) mock handlers with TypeScript typings.
 */
export interface MSWRawPluginConfig extends RawClientSideBasePluginConfig {
  /**
   * GraphQL endpoint to use when working with multiple backends.
   * @see https://mswjs.io/docs/api/graphql/link
   */
  link?: {
    endpoint: string;
    name: string;
  };
}
