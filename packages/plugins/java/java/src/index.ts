import { parse, GraphQLSchema, printSchema, visit } from 'graphql';
import { PluginFunction, Types } from '@graphql-codegen/plugin-helpers';
import { RawConfig } from '@graphql-codegen/visitor-plugin-common';
import { JavaResolversVisitor } from './visitor';
import { buildPackageNameFromPath } from '../../common/dist/esnext';
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
   *       - java-resolvers
   *     config:
   *       package: custom.package.name
   * ```
   */
  package?: string;
}

export const plugin: PluginFunction<JavaResolversPluginRawConfig> = async (schema: GraphQLSchema, documents: Types.DocumentFile[], config: JavaResolversPluginRawConfig, { outputFile }): Promise<string> => {
  const relevantPath = dirname(normalize(outputFile));
  const defaultPackageName = buildPackageNameFromPath(relevantPath);
  const visitor = new JavaResolversVisitor(config, schema, defaultPackageName);
  const printedSchema = printSchema(schema);
  const astNode = parse(printedSchema);
  const visitorResult = visit(astNode, { leave: visitor as any });
  const mappersImports = visitor.getImports();
  const packageName = visitor.getPackageName();
  const blockContent = visitorResult.definitions.filter(d => typeof d === 'string').join('\n');

  return [packageName, mappersImports, blockContent].join('\n');
};
