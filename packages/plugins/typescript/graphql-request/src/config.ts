import { RawClientSideBasePluginConfig } from '@graphql-codegen/visitor-plugin-common';

/**
 * @description This plugin generates [`graphql-request`](https://npmjs.com/package/graphql-request) ready-to-use SDK, which is fully-typed.
 */

export interface RawGraphQLRequestPluginConfig extends RawClientSideBasePluginConfig {
  /**
   * @description By default, the `request` method return the `data` or `errors` key from the response. If you need to access the `extensions` key you can use the `rawRequest` method.
   * @default false
   *
   * @exampleMarkdown
   * ```yaml
   * generates:
   *   path/to/file.ts:
   *     plugins:
   *       - typescript
   *       - typescript-operations
   *       - typescript-graphql-request
   *     config:
   *       rawRequest: true
   * ```
   */
  rawRequest?: boolean;

  /**
   * @description Allows you to override the type for extensions when `rawRequest` is enabled.
   * @default any
   *
   * @exampleMarkdown
   * ```yaml
   * config:
   *   rawRequest: true
   *   extensionsType: unknown
   * ```
   */
  extensionsType?: string;

  /**
   * @description Allows you to create individual treeshakeable operations as opposed to wrapping them inside a sdk object
   * @default false
   *
   * @exampleMarkdown
   * ```yaml
   * config:
   *   generateIndividualOperations: true
   * ```
   */
  generateIndividualOperations?: boolean;
}
