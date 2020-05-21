import { RawClientSideBasePluginConfig } from '@graphql-codegen/visitor-plugin-common';
export interface ApolloAngularRawPluginConfig extends RawClientSideBasePluginConfig {
  /**
   * @name ngModule
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
   * @name serviceProvidedInRoot
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
   * @description Set to `true` in order to generate a SDK service class that uses all generated services.
   * @default false
   *
   */
  sdkClass?: boolean;
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
  subscriptionSuffix?: 'GQL' | string;
  /**
   * @name apolloAngularPackage
   * @description Allows to define a custom Apollo-Angular package to import types from.
   * @default 'apollo-angular'
   *
   */
  apolloAngularPackage?: 'apollo-angular' | string;
}
