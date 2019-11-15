import { parse, GraphQLSchema, DefinitionNode } from 'graphql';
import { Types, PluginFunction } from '@graphql-codegen/plugin-helpers';

import { GraphQLCompilerContext, transformASTSchema, Parser as RelayParser, Printer as GraphQLIRPrinter } from 'relay-compiler';

import InlineFragmentsTransform from 'relay-compiler/lib/transforms/InlineFragmentsTransform';
import SkipRedundantNodesTransform from 'relay-compiler/lib/transforms/SkipRedundantNodesTransform';
import RelayApplyFragmentArgumentTransform from 'relay-compiler/lib/transforms/RelayApplyFragmentArgumentTransform';
import FlattenTransform from 'relay-compiler/lib/transforms/FlattenTransform';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface RelayOptimizerPluginConfig {}

export const plugin: PluginFunction<RelayOptimizerPluginConfig> = (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  config: RelayOptimizerPluginConfig
) => {
  // @TODO way for users to define directives they use, otherwise relay will throw an unknown directive error
  // Maybe we can scan the queries and add them dynamically without users having to do some extra stuff
  // transformASTSchema creates a new schema instance instead of mutating the old one
  const adjustedSchema = transformASTSchema(schema, [
    /* GraphQL */ `
      directive @connection(key: String!) on FIELD
      directive @client on FIELD
    `,
  ]);
  const documentAsts = documents.reduce((prev, v) => {
    return [...prev, ...v.content.definitions];
  }, [] as DefinitionNode[]);

  const relayDocuments = RelayParser.transform(adjustedSchema, documentAsts);

  const fragmentCompilerContext = new GraphQLCompilerContext(adjustedSchema).addAll(relayDocuments);

  const fragmentDocuments = fragmentCompilerContext
    .applyTransforms([RelayApplyFragmentArgumentTransform.transform, FlattenTransform.transformWithOptions({ flattenAbstractTypes: false }), SkipRedundantNodesTransform.transform])
    .documents()
    .filter(doc => doc.kind === 'Fragment');

  const queryCompilerContext = new GraphQLCompilerContext(adjustedSchema)
    .addAll(relayDocuments)
    .applyTransforms([RelayApplyFragmentArgumentTransform.transform, InlineFragmentsTransform.transform, FlattenTransform.transformWithOptions({ flattenAbstractTypes: false }), SkipRedundantNodesTransform.transform]);

  const newQueryDocuments = queryCompilerContext.documents().map(doc => ({
    filePath: 'optimized by relay',
    content: parse(GraphQLIRPrinter.print(doc)),
  }));

  const newDocuments = [
    ...fragmentDocuments.map(doc => ({
      filePath: 'optimized by relay',
      content: parse(GraphQLIRPrinter.print(doc)),
    })),
    ...newQueryDocuments,
  ];

  documents.splice(0, documents.length);
  documents.push(...newDocuments);

  return {
    content: '',
  };
};
