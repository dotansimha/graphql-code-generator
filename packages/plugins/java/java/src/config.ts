import { RawConfig, EnumValuesMap } from '@graphql-codegen/visitor-plugin-common';
export interface JavaResolversPluginRawConfig extends RawConfig {
  /**
   * @name package
   * @type string
   * @description Customize the Java package name. The default package name will be generated according to the output file path.
   *
   * @example
   * ```yml
   * generates:
   *   src/main/java/my-org/my-app/Resolvers.java:
   *     plugins:
   *       - java
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
   *   src/main/java/my-org/my-app/MyGeneratedTypes.java:
   *     plugins:
   *       - java
   *     config:
   *       className: MyGeneratedTypes
   * ```
   */
  className?: string;
  /**
   * @name listType
   * @type string
   * @default Iterable
   * @description Allow you to customize the list type
   *
   * @example
   * ```yml
   * generates:
   *   src/main/java/my-org/my-app/Types.java:
   *     plugins:
   *       - java
   *     config:
   *       listType: Map
   * ```
   */
  listType?: string;
}
