import { RawConfig, EnumValuesMap } from '@graphql-codegen/visitor-plugin-common';
export interface CSharpResolversPluginRawConfig extends RawConfig {
  /**
   * @name enumValues
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
}
