import { GraphQLSchema } from 'graphql';
import { PluginFunction, Types, getCachedDocumentNodeFromSchema, oldVisit } from '@graphql-codegen/plugin-helpers';
import { CSharpResolversVisitor } from './visitor';
import { CSharpResolversPluginRawConfig } from './config';
import { CompositionTypeVisitor } from './compositionTypesVisitor';

export const plugin: PluginFunction<CSharpResolversPluginRawConfig> = async (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config: CSharpResolversPluginRawConfig
): Promise<string> => {
  const astNode = getCachedDocumentNodeFromSchema(schema);

  let compositionTypesData;

  if (config.emitCompositionTypes) {
    const compositionTypesVisitor = new CompositionTypeVisitor();
    const compositionTypesResult = oldVisit(astNode, { leave: compositionTypesVisitor });
    const relevantDefinitions = compositionTypesResult.definitions.filter(d => d.constructor === Array);
    compositionTypesData = compositionTypesVisitor.getCompositionTypeDataFromDefinitions(relevantDefinitions);
  }

  const visitor = new CSharpResolversVisitor(config, schema, compositionTypesData);
  const visitorResult = oldVisit(astNode, { leave: visitor });
  const imports = visitor.getImports();
  const blocks = visitorResult.definitions.filter(d => typeof d === 'string');

  const blocksWithUnionData = visitor.addCompositionTypeConverterDefinitions(blocks);

  const blockContent = blocksWithUnionData.join('\n');

  const wrappedBlockContent = visitor.wrapWithClass(blockContent);
  const wrappedContent = visitor.wrapWithNamespace(wrappedBlockContent);

  return [imports, wrappedContent].join('\n');
};
