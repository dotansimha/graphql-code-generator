import { RawConfig, EnumValuesMap } from '@graphql-codegen/visitor-plugin-common';
export interface CSharpResolversPluginRawConfig extends RawConfig {
  /**
   * @name package
   * @type string
   * @description Customize the CSharp package name. The default package name will be generated according to the output file path.
   *
   * @example
   * ```yml
   * generates:
   *   src/main/c-sharp/my-org/my-app/Resolvers.cs:
   *     plugins:
   *       - c-sharp
   *     config:
   *       package: custom.package.name
   * ```
   */
  package?: string;
  /**
   * @name enumValues
   * @type EnumValuesMap
   * @description Overrides the default value of enum values declared in your GraphQL schema.
   *
   * @example With Custom Values
   * ```yml
   *   config:
   *     enumValues:
   *       MyEnum:
   *         A: 'foo'
   * ```
   */
  enumValues?: EnumValuesMap;
  /**
   * @name className
   * @type string
   * @default Types
   * @description Allow you to customize the parent class name.
   *
   * @example
   * ```yml
   * generates:
   *   src/main/c-sharp/my-org/my-app/MyGeneratedTypes.cs:
   *     plugins:
   *       - c-sharp
   *     config:
   *       className: MyGeneratedTypes
   * ```
   */
  className?: string;
  /**
   * @name listType
   * @type string
   * @default IEnumberable
   * @description Allow you to customize the list type
   *
   * @example
   * ```yml
   * generates:
   *   src/main/c-sharp/my-org/my-app/Types.cs:
   *     plugins:
   *       - c-sharp
   *     config:
   *       listType: Map
   * ```
   */
  listType?: string;
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
}
