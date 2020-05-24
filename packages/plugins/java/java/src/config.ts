import { RawConfig, EnumValuesMap } from '@graphql-codegen/visitor-plugin-common';
export interface JavaResolversPluginRawConfig extends RawConfig {
  /**
   * @description Customize the Java package name. The default package name will be generated according to the output file path.
   *
   * @examples
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
   * @description Overrides the default value of enum values declared in your GraphQL schema.
   *
   * @examples
   * ```yml
   *   config:
   *     enumValues:
   *       MyEnum:
   *         A: 'foo'
   * ```
   */
  enumValues?: EnumValuesMap;
  /**
   * @default Types
   * @description Allow you to customize the parent class name.
   *
   * @examples
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
   * @default Iterable
   * @description Allow you to customize the list type
   *
   * @examples
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
