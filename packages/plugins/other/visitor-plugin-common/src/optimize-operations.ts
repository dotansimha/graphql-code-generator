import { Types } from '@graphql-codegen/plugin-helpers';
import { DefinitionNode, GraphQLSchema, parse } from 'graphql';
import { GraphQLCompilerContext, Parser as RelayParser, Printer as GraphQLIRPrinter } from 'relay-compiler';

const InlineFragmentsTransform = require('relay-compiler/lib/transforms/InlineFragmentsTransform');
const SkipRedundantNodesTransform = require('relay-compiler/lib/transforms/SkipRedundantNodesTransform');
const RelayApplyFragmentArgumentTransform = require('relay-compiler/lib/transforms/RelayApplyFragmentArgumentTransform');
const FlattenTransform = require('relay-compiler/lib/transforms/FlattenTransform');

export function optimizeOperations(schema: GraphQLSchema, documents: Types.DocumentFile[]): Types.DocumentFile[] {
  const documentAsts = documents.reduce((prev, v) => {
    return [...prev, ...v.content.definitions];
  }, [] as DefinitionNode[]);
  const relayDocuments = RelayParser.transform(schema, documentAsts);

  const queryCompilerContext = new GraphQLCompilerContext(schema)
    .addAll(relayDocuments)
    .applyTransforms([RelayApplyFragmentArgumentTransform.transform, InlineFragmentsTransform.transform, FlattenTransform.transformWithOptions({ flattenAbstractTypes: false }), SkipRedundantNodesTransform.transform]);

  const newQueryDocuments = queryCompilerContext.documents().map(doc => ({
    filePath: 'optimized by relay',
    content: parse(GraphQLIRPrinter.print(doc)),
  }));

  return newQueryDocuments;
}
