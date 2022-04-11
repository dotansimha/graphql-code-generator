import { RawConfig } from '@graphql-codegen/visitor-plugin-common';
export interface JavaResolversPluginRawConfig extends RawConfig {
  /**
   * @description Customize the Java package name. The default package name will be generated according to the output file path.
   *
   * @exampleMarkdown
   * ```yaml
   * generates:
   *   src/main/java/my-org/my-app/Resolvers.java:
   *     plugins:
   *       - java-resolvers
   *     config:
   *       package: custom.package.name
   * ```
   */
  package?: string;
  /**
   * @description Allow you to replace specific GraphQL types with your custom model classes. This is useful when you want to make sure your resolvers returns the correct class.
   * The default value is the values set by `defaultMapper` configuration.
   * You can use a direct path to the package, or use `package#class` syntax to have it imported.
   *
   * @exampleMarkdown
   * ```yaml
   * generates:
   *   src/main/java/my-org/my-app/Resolvers.java:
   *     plugins:
   *       - java-resolvers
   *     config:
   *       mappers:
   *         User: com.app.models#UserObject
   * ```
   */
  mappers?: {
    [typeName: string]: string;
  };
  /**
   * @default Object
   * @description Sets the default mapper value in case it's not specified by `mappers`.
   * You can use a direct path to the package, or use `package#class` syntax to have it imported.
   * The default mapper is Java's `Object`.
   *
   * @exampleMarkdown
   * ```yaml
   * generates:
   *   src/main/java/my-org/my-app/Resolvers.java:
   *     plugins:
   *       - java-resolvers
   *     config:
   *       defaultMapper: my.app.models.BaseEntity
   * ```
   */
  defaultMapper?: string;
  /**
   * @default Resolvers
   * @description Allow you to customize the parent class name.
   *
   * @exampleMarkdown
   * ```yaml
   * generates:
   *   src/main/java/my-org/my-app/Resolvers.java:
   *     plugins:
   *       - java-resolvers
   *     config:
   *       className: MyResolvers
   * ```
   */
  className?: string;
  /**
   * @default Iterable
   * @description Allow you to customize the list type.
   *
   * @exampleMarkdown
   * ```yaml
   * generates:
   *   src/main/java/my-org/my-app/Resolvers.java:
   *     plugins:
   *       - java-resolvers
   *     config:
   *       listType: Map
   * ```
   */
  listType?: string;
}
