import { RawClientSideBasePluginConfig } from '@graphql-codegen/visitor-plugin-common';

/**
 * @description This plugin generates C# `class` based on your GraphQL operations.
 */
export interface CSharpOperationsRawPluginConfig extends RawClientSideBasePluginConfig {
  /**
   * @description Defined the global value of `namedClient`.
   *
   * @exampleMarkdown
   * ```yml
   * config:
   *   namedClient: 'customName'
   * ```
   */
  namedClient?: string;
  /**
   * @description Defined the global value of `serviceName`.
   *
   * @exampleMarkdown
   * ```yml
   * config:
   *   serviceName: 'MySDK'
   * ```
   */
  serviceName?: string;
  /**
   * @description Allows to define a custom suffix for query operations.
   * @default GQL
   *
   * @exampleMarkdown
   * ```yml
   * config:
   *   querySuffix: 'QueryService'
   * ```
   */
  querySuffix?: string;
  /**
   * @description Allows to define a custom suffix for mutation operations.
   * @default GQL
   *
   * @exampleMarkdown
   * ```yml
   * config:
   *   mutationSuffix: 'MutationService'
   * ```
   */
  mutationSuffix?: string;
  /**
   * @description Allows to define a custom suffix for Subscription operations.
   * @default GQL
   *
   * @exampleMarkdown
   * ```yml
   * config:
   *   subscriptionSuffix: 'SubscriptionService'
   * ```
   */
  subscriptionSuffix?: string;
}
