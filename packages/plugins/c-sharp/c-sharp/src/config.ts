import { RawConfig, EnumValuesMap } from '@graphql-codegen/visitor-plugin-common';
import { JsonAttributesSource } from './json-attributes.js';

/**
 * @description This plugin generates C# `class` identifier for your schema types.
 */
export interface CSharpResolversPluginRawConfig extends RawConfig {
  /**
   * @description Overrides the default value of enum values declared in your GraphQL schema.
   * @exampleMarkdown
   * ## With Custom Values
   * ```yaml
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
   * ```yaml
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
   * ```yaml
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
   * @default IEnumerable
   * @description Allow you to customize the list type
   *
   * @exampleMarkdown
   * ```yaml
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
   * @default false
   * @description Emit C# 9.0+ records instead of classes
   *
   * @exampleMarkdown
   * ```yaml
   * generates:
   *   src/main/c-sharp/my-org/my-app/Types.cs:
   *     plugins:
   *       - c-sharp
   *     config:
   *       emitRecords: true
   * ```
   */
  emitRecords?: boolean;

  /**
   * @default true
   * @description Should JSON attributes be emitted for produced types and properties ot not
   *
   * @exampleMarkdown
   * ```yaml
   * generates:
   *   src/main/c-sharp/my-org/my-app/Types.cs:
   *     plugins:
   *       - c-sharp
   *     config:
   *       emitJsonAttributes: false
   * ```
   */
  emitJsonAttributes?: boolean;

  /**
   * @default Newtonsoft.Json
   * @description Library that should be used to emit JSON attributes. Ignored when `emitJsonAttributes` is `false` or not specified
   *
   * @exampleMarkdown
   * ```yaml
   * generates:
   *   src/main/c-sharp/my-org/my-app/Types.cs:
   *     plugins:
   *       - c-sharp
   *     config:
   *       jsonAttributesSource: System.Text.Json
   * ```
   */
  jsonAttributesSource?: JsonAttributesSource;
}
