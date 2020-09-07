import { RawConfig, EnumValuesMap } from '@graphql-codegen/visitor-plugin-common';

/**
 * @description This plugin generates C# `class` identifier for your schema types.
 */
export interface CSharpResolversPluginRawConfig extends RawConfig {
  /**
   * @description Overrides the default value of enum values declared in your GraphQL schema.
   * @exampleMarkdown
   * ## With Custom Values
   * ```yml
   *   config:
   *     enumValues:
   *       MyEnum:
   *         A: 'foo'
   * ```
   */
  enumValues?: EnumValuesMap;
  /**
   * @default GraphQLCodeGen
   * @description Allow you to customize the namespace name.
   *
   * @exampleMarkdown
   * ```yml
   * generates:
   *   src/main/c-sharp/my-org/my-app/MyTypes.cs:
   *     plugins:
   *       - c-sharp
   *     config:
   *       namespaceName: MyCompany.MyNamespace
   * ```
   */
  namespaceName?: string;
  /**
   * @default Types
   * @description Allow you to customize the parent class name.
   *
   * @exampleMarkdown
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
   * @default IEnumberable
   * @description Allow you to customize the list type
   *
   * @exampleMarkdown
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
}
