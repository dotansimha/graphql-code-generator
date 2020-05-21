import { RawClientSideBasePluginConfig } from '@graphql-codegen/visitor-plugin-common';

export interface CSharpOperationsRawPluginConfig extends RawClientSideBasePluginConfig {
  /**
   * @name namedClient
   * @description Defined the global value of `namedClient`.
   *
   * @example graphql.macro
   * ```yml
   * config:
   *   namedClient: 'customName'
   * ```
   */
  namedClient?: string;
  /**
   * @name serviceName
   * @description Defined the global value of `serviceName`.
   *
   * @example graphql.macro
   * ```yml
   * config:
   *   serviceName: 'MySDK'
   * ```
   */
  serviceName?: string;
  /**
   * @name querySuffix
   * @description Allows to define a custom suffix for query operations.
   * @default 'GQL'
   *
   * @example graphql.macro
   * ```yml
   * config:
   *   querySuffix: 'QueryService'
   * ```
   */
  querySuffix?: string;
  /**
   * @name mutationSuffix
   * @description Allows to define a custom suffix for mutation operations.
   * @default 'GQL'
   *
   * @example graphql.macro
   * ```yml
   * config:
   *   mutationSuffix: 'MutationService'
   * ```
   */
  mutationSuffix?: string;
  /**
   * @name subscriptionSuffix
   * @description Allows to define a custom suffix for Subscription operations.
   * @default 'GQL'
   *
   * @example graphql.macro
   * ```yml
   * config:
   *   subscriptionSuffix: 'SubscriptionService'
   * ```
   */
  subscriptionSuffix?: string;
}
