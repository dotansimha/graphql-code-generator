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
}
