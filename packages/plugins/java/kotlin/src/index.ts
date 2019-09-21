import { parse, GraphQLSchema, printSchema, visit } from 'graphql';
import { PluginFunction, Types } from '@graphql-codegen/plugin-helpers';
import { RawConfig, EnumValuesMap } from '@graphql-codegen/visitor-plugin-common';
import { KotlinResolversVisitor } from './visitor';
import { buildPackageNameFromPath } from '@graphql-codegen/java-common';
import { dirname, normalize } from 'path';

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
}

export const plugin: PluginFunction<KotlinResolversPluginRawConfig> = async (schema: GraphQLSchema, documents: Types.DocumentFile[], config: KotlinResolversPluginRawConfig, { outputFile }): Promise<string> => {
  const relevantPath = dirname(normalize(outputFile));
  const defaultPackageName = buildPackageNameFromPath(relevantPath);
  const visitor = new KotlinResolversVisitor(config, schema, defaultPackageName);
  const printedSchema = printSchema(schema);
  const astNode = parse(printedSchema);
  const visitorResult = visit(astNode, { leave: visitor as any });
  const packageName = visitor.getPackageName();
  const blockContent = visitorResult.definitions.filter(d => typeof d === 'string').join('\n\n');

  return [packageName, blockContent].join('\n');
};
