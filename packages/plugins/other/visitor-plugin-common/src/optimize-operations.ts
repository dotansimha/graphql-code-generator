import { Types } from '@graphql-codegen/plugin-helpers';
import { DefinitionNode, GraphQLSchema, parse } from 'graphql';
import { GraphQLCompilerContext, transformASTSchema, Parser as RelayParser, Printer as GraphQLIRPrinter } from 'relay-compiler';

import * as InlineFragmentsTransform from 'relay-compiler/lib/transforms/InlineFragmentsTransform';
import * as SkipRedundantNodesTransform from 'relay-compiler/lib/transforms/SkipRedundantNodesTransform';
import * as RelayApplyFragmentArgumentTransform from 'relay-compiler/lib/transforms/RelayApplyFragmentArgumentTransform';
import * as FlattenTransform from 'relay-compiler/lib/transforms/FlattenTransform';

export function optimizeOperations(schema: GraphQLSchema, documents: Types.DocumentFile[]): Types.DocumentFile[] {
  const documentAsts = documents.reduce(
    (prev, v) => {
      return [...prev, ...v.content.definitions];
    },
    [] as DefinitionNode[]
  );
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
