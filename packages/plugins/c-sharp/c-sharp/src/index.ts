import { GraphQLSchema, visit } from 'graphql';
import { PluginFunction, Types, getCachedDocumentNodeFromSchema } from '@graphql-codegen/plugin-helpers';
import { CSharpResolversVisitor } from './visitor';
import { CSharpResolversPluginRawConfig } from './config';

export const plugin: PluginFunction<CSharpResolversPluginRawConfig> = async (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config: CSharpResolversPluginRawConfig
): Promise<string> => {
  const visitor = new CSharpResolversVisitor(config, schema);
  const astNode = getCachedDocumentNodeFromSchema(schema);
  const visitorResult = visit(astNode, { leave: visitor as any });
  const imports = visitor.getImports();
  const blockContent = visitorResult.definitions.filter(d => typeof d === 'string').join('\n');
  const wrappedBlockContent = visitor.wrapWithClass(blockContent);
  const wrappedContent = visitor.wrapWithNamespace(wrappedBlockContent);

  return [imports, wrappedContent].join('\n');
};
