import { parse, GraphQLSchema, printSchema, visit } from 'graphql';
import { PluginFunction, Types } from '@graphql-codegen/plugin-helpers';
import { RawConfig, EnumValuesMap } from '@graphql-codegen/visitor-plugin-common';
import { JavaResolversVisitor } from './visitor';
import { buildPackageNameFromPath } from '@graphql-codegen/java-common';
import { dirname, normalize } from 'path';

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

export const plugin: PluginFunction<JavaResolversPluginRawConfig> = async (schema: GraphQLSchema, documents: Types.DocumentFile[], config: JavaResolversPluginRawConfig, { outputFile }): Promise<string> => {
  const relevantPath = dirname(normalize(outputFile));
  const defaultPackageName = buildPackageNameFromPath(relevantPath);
  const visitor = new JavaResolversVisitor(config, schema, defaultPackageName);
  const printedSchema = printSchema(schema);
  const astNode = parse(printedSchema);
  const visitorResult = visit(astNode, { leave: visitor as any });
  const imports = visitor.getImports();
  const packageName = visitor.getPackageName();
  const blockContent = visitorResult.definitions.filter(d => typeof d === 'string').join('\n');
  const wrappedContent = visitor.wrapWithClass(blockContent);

  return [packageName, imports, wrappedContent].join('\n');
};
