import { parse, GraphQLSchema, printSchema, visit } from 'graphql';
import { PluginFunction, Types } from '@graphql-codegen/plugin-helpers';
import { CSharpResolversVisitor } from './visitor';
import { buildPackageNameFromPath } from './common/common';
import { dirname, normalize } from 'path';
import { CSharpResolversPluginRawConfig } from './config';

export const plugin: PluginFunction<CSharpResolversPluginRawConfig> = async (schema: GraphQLSchema, documents: Types.DocumentFile[], config: CSharpResolversPluginRawConfig, { outputFile }): Promise<string> => {
  const relevantPath = dirname(normalize(outputFile));
  const defaultPackageName = buildPackageNameFromPath(relevantPath);
  const visitor = new CSharpResolversVisitor(config, schema, defaultPackageName);
  const printedSchema = printSchema(schema);
  const astNode = parse(printedSchema);
  const visitorResult = visit(astNode, { leave: visitor as any });
  const imports = visitor.getImports();
  const blockContent = visitorResult.definitions.filter(d => typeof d === 'string').join('\n');
  const wrappedBlockContent = visitor.wrapWithClass(blockContent);
  const wrappedContent = visitor.wrapWithNamespace(wrappedBlockContent);

  return [imports, wrappedContent].join('\n');
};
