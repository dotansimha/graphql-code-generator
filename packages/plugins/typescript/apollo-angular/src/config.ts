import { RawClientSideBasePluginConfig } from '@graphql-codegen/visitor-plugin-common';
export interface ApolloAngularRawPluginConfig extends RawClientSideBasePluginConfig {
  /**
   * @name ngModule
   * @type string
   * @description Allows to define `ngModule` as part of the plugin's config so it's globally available.
   *
   * @example graphql.macro
   * ```yml
   * config:
   *   ngModule: ./path/to/module#MyModule
   * ```
   */
  ngModule?: string;
  /**
   * @name namedClient
   * @type string
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
   * @type string
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
   * @name serviceProvidedInRoot
   * @type string
   * @description Defined the global value of `serviceProvidedInRoot`.
   *
   * @example graphql.macro
   * ```yml
   * config:
   *   serviceProvidedInRoot: false
   * ```
   */
  serviceProvidedInRoot?: boolean;
  /**
   * @name sdkClass
   * @type boolean
   * @description Set to `true` in order to generate a SDK service class that uses all generated services.
   * @default false
   *
   */
  sdkClass?: boolean;
  /**
   * @name querySuffix
   * @type string
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
   * @type string
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
   * @type string
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
