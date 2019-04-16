import { parse, GraphQLSchema, printSchema, visit } from 'graphql';
import { PluginFunction, Types } from '@graphql-codegen/plugin-helpers';
import { RawConfig } from '@graphql-codegen/visitor-plugin-common';
import { JavaResolversVisitor } from './visitor';
import { buildPackageNameFromPath } from './utils';
import { dirname, normalize } from 'path';

export interface JavaResolversPluginRawConfig extends RawConfig {
  package?: string;
  mappers?: { [typeName: string]: string };
  defaultMapper?: string;
  className?: string;
  listType?: string;
}

export const plugin: PluginFunction<JavaResolversPluginRawConfig> = async (schema: GraphQLSchema, documents: Types.DocumentFile[], config: JavaResolversPluginRawConfig, { outputFile }): Promise<string> => {
  const relevantPath = dirname(normalize(outputFile)).replace(/src\/main\/.*?\//, '');
  const defaultPackageName = buildPackageNameFromPath(relevantPath);
  const visitor = new JavaResolversVisitor(config, schema, defaultPackageName);
  const printedSchema = printSchema(schema);
  const astNode = parse(printedSchema);
  const visitorResult = visit(astNode, { leave: visitor as any });
  const mappersImports = visitor.getImports();
  const packageName = visitor.getPackageName();
  const blockContent = visitorResult.definitions.filter(d => typeof d === 'string').join('\n');
  const wrappedContent = visitor.wrapWithClass(blockContent);

  return [packageName, mappersImports, wrappedContent].join('\n');
};
