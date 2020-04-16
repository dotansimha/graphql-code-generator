import { RawClientSideBasePluginConfig, DocumentMode } from '@graphql-codegen/visitor-plugin-common';
export interface ApolloDotNetRawPluginConfig extends RawClientSideBasePluginConfig {
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
  /**
   * @name documentMode
   * @type 'graphQLTag' | 'documentNode' | 'documentNodeImportFragments' | 'external'
   * @default 'graphQLTag'
   * @description Declares how DocumentNode are created:
   * - `graphQLTag`: `graphql-tag` or other modules (check `gqlImport`) will be used to generate document nodes. If this is used, document nodes are generated on client side i.e. the module used to generate this will be shipped to the client
   * - `documentNode`: document nodes will be generated as objects when we generate the templates.
   * - `documentNodeImportFragments`: Similar to documentNode except it imports external fragments instead of embedding them.
   * - `external`: document nodes are imported from an external file. To be used with `importDocumentNodeExternallyFrom`
   */
  documentMode?: DocumentMode;

  /**
   * @name omitOperationSuffix
   * @type boolean
   * @default false
   * @description Set this configuration to `true` if you wish to disable auto add suffix of operation name, like `Query`, `Mutation`, `Subscription`, `Fragment`.
   */
  omitOperationSuffix: boolean;
}
