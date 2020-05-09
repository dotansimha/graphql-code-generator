import { RawConfig, EnumValuesMap } from '@graphql-codegen/visitor-plugin-common';
export interface KotlinResolversPluginRawConfig extends RawConfig {
  /**
   * @name package
   * @type string
   * @description Customize the Java package name. The default package name will be generated according to the output file path.
   *
   * @example
   * ```yml
   * generates:
   *   src/main/kotlin/my-org/my-app/Resolvers.kt:
   *     plugins:
   *       - kotlin
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
   * @name listType
   * @type string
   * @default Iterable
   * @description Allow you to customize the list type
   *
   * @example
   * ```yml
   * generates:
   *   src/main/kotlin/my-org/my-app/Types.kt:
   *     plugins:
   *       - kotlin
   *     config:
   *       listType: Map
   * ```
   */
  listType?: string;
  /**
   * @name withTypes
   * @type boolean
   * @default false
   * @description Allow you to enable generation for the types
   *
   * @example
   * ```yml
   * generates:
   *   src/main/kotlin/my-org/my-app/Types.kt:
   *     plugins:
   *       - kotlin
   *     config:
   *       withTypes: true
   * ```
   */
  withTypes?: boolean;
}
