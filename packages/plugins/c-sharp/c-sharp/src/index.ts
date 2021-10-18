import { GraphQLSchema, visit } from 'graphql';
import { PluginFunction, Types, getCachedDocumentNodeFromSchema } from '@graphql-codegen/plugin-helpers';
import { CSharpResolversVisitor } from './visitor';
import { CSharpResolversPluginRawConfig } from './config';
import { CompositionTypeVisitor } from './compositionTypesVisitor';

export const plugin: PluginFunction<CSharpResolversPluginRawConfig> = async (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config: CSharpResolversPluginRawConfig
): Promise<string> => {
  const astNode = getCachedDocumentNodeFromSchema(schema);

  const compositionTypesVisitor = new CompositionTypeVisitor();
  const compositionTypesResult = visit(astNode, { leave: compositionTypesVisitor as any });
  const relevantDefinitions = compositionTypesResult.definitions.filter(d => d.constructor === Array);

  const compositionTypesData = compositionTypesVisitor.getCompositionTypeDataFromDefinitions(relevantDefinitions);

  const visitor = new CSharpResolversVisitor(config, schema, compositionTypesData);
  const visitorResult = visit(astNode, { leave: visitor as any });
  const imports = visitor.getImports();
  const blocks = visitorResult.definitions.filter(d => typeof d === 'string');

  const blocksWithUnionData = visitor.addCompositionTypeConverterDefinitions(blocks);

  const blockContent = blocksWithUnionData.join('\n');

  const wrappedBlockContent = visitor.wrapWithClass(blockContent);
  const wrappedContent = visitor.wrapWithNamespace(wrappedBlockContent);

  return [imports, wrappedContent].join('\n');

  return [imports, wrappedContent].join('\n');
};
