import { RawConfig, EnumValuesMap } from '@graphql-codegen/visitor-plugin-common';

/**
 * @description You can use this plugin to generate Java enums based on your GraphQL schema, and it also generates a type-safe Java transformer for GraphQL `input` types.
 */
export interface JavaResolversPluginRawConfig extends RawConfig {
  /**
   * @description Customize the class members prefix. The default is empty (this might be a breaking change from the default that was _)
   *
   * @exampleMarkdown
   * ```yaml
   *   src/main/java/my-org/my-app/Resolvers.java:
   *     plugins:
   *       - java
   *     config:
   *       classMembersPrefix: '_'
   * ```
   */
  classMembersPrefix?: string;
  /**
   * @description Customize the Java package name. The default package name will be generated according to the output file path.
   *
   * @exampleMarkdown
   * ```yaml
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
   * @default Types
   * @description Allow you to customize the parent class name.
   *
   * @exampleMarkdown
   * ```yaml
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
   * @exampleMarkdown
   * ```yaml
   * generates:
   *   src/main/java/my-org/my-app/Types.java:
   *     plugins:
   *       - java
   *     config:
   *       listType: Map
   * ```
   */
  listType?: string;
  /**
   * @default Boolean, false
   * @description If true, will create empty constructor instead of args map
   *
   * @exampleMarkdown
   * ```yaml
   * generates:
   *   src/main/java/my-org/my-app/Types.java:
   *     plugins:
   *       - java
   *     config:
   *       useEmptyCtor: true
   * ```
   */
  useEmptyCtor?: boolean;
}
