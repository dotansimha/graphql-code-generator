import { GraphQLSchema, visit } from 'graphql';
import { PluginFunction, Types, getCachedDocumentNodeFromSchema } from '@graphql-codegen/plugin-helpers';
import { CSharpResolversVisitor } from './visitor';
import { CSharpResolversPluginRawConfig } from './config';
import { UnionTypeVisitor } from './unionTypeAndInterfacesVisitor';

export const plugin: PluginFunction<CSharpResolversPluginRawConfig> = async (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config: CSharpResolversPluginRawConfig
): Promise<string> => {
  const astNode = getCachedDocumentNodeFromSchema(schema);

  const unionTypeAndInterfacesVisitor = new UnionTypeVisitor();
  const unionTypesAndInterfacesResult = visit(astNode, { leave: unionTypeAndInterfacesVisitor as any });
  const relevantDefinitions = unionTypesAndInterfacesResult.definitions.filter(d => d.constructor === Array);

  const unionTypesAndInterfacesData =
    unionTypeAndInterfacesVisitor.getUnionTypeDataFromDefinitions(relevantDefinitions);

  const visitor = new CSharpResolversVisitor(config, schema, unionTypesAndInterfacesData);
  const visitorResult = visit(astNode, { leave: visitor as any });
  const imports = visitor.getImports();
  const blocks = visitorResult.definitions.filter(d => typeof d === 'string');

  const blocksWithUnionData = visitor.addUnionTypeConverterDefinitions(blocks);

  const blockContent = blocksWithUnionData.join('\n');

  const wrappedBlockContent = visitor.wrapWithClass(blockContent);
  const wrappedContent = visitor.wrapWithNamespace(wrappedBlockContent);

  return [imports, wrappedContent].join('\n');

  return [imports, wrappedContent].join('\n');
};
