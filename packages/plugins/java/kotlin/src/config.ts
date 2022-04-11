import { RawConfig, EnumValuesMap } from '@graphql-codegen/visitor-plugin-common';
export interface KotlinResolversPluginRawConfig extends RawConfig {
  /**
   * @description Customize the Java package name. The default package name will be generated according to the output file path.
   *
   * @exampleMarkdown
   * ```yaml
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
   * @description Overrides the default value of enum values declared in your GraphQL schema.
   *
   * @exampleMarkdown
   * ```yaml
   *   config:
   *     enumValues:
   *       MyEnum:
   *         A: 'foo'
   * ```
   */
  enumValues?: EnumValuesMap;
  /**
   * @default Iterable
   * @description Allow you to customize the list type
   *
   * @exampleMarkdown
   * ```yaml
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
   * @default false
   * @description Allow you to enable generation for the types
   *
   * @exampleMarkdown
   * ```yaml
   * generates:
   *   src/main/kotlin/my-org/my-app/Types.kt:
   *     plugins:
   *       - kotlin
   *     config:
   *       withTypes: true
   * ```
   */
  withTypes?: boolean;
  /**
   * @default false
   * @description Allow you to omit JvmStatic annotation
   *
   * @exampleMarkdoWn
   * ```yaml
   * generates:
   *   src/main/kotlin/my-org/my-app/Types.kt:
   *     plugins:
   *       - kotlin
   *     config:
   *       omitJvmStatic: true
   * ```
   */
  omitJvmStatic?: boolean;
}
