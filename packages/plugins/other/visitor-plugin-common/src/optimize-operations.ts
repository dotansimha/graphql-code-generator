import { Types } from '@graphql-codegen/plugin-helpers';
import { DefinitionNode, GraphQLSchema, parse } from 'graphql';
import { printSchemaWithDirectives } from '@graphql-toolkit/common';

import { Parser as RelayParser } from 'relay-compiler';
import * as InlineFragmentsTransform from 'relay-compiler/lib/transforms/InlineFragmentsTransform';
import * as SkipRedundantNodesTransform from 'relay-compiler/lib/transforms/SkipRedundantNodesTransform';
import * as ApplyFragmentArgumentTransform from 'relay-compiler/lib/transforms/ApplyFragmentArgumentTransform';
import * as FlattenTransform from 'relay-compiler/lib/transforms/FlattenTransform';

const RelayCreate = require('relay-compiler/lib/core/Schema');
const GraphQLCompilerContext = require('relay-compiler/lib/core/GraphQLCompilerContext');
const { print } = require('relay-compiler/lib/core/GraphQLIRPrinter');

export function optimizeOperations(schema: GraphQLSchema, documents: Types.DocumentFile[]): Types.DocumentFile[] {
  const documentAsts = documents.reduce((prev, v) => {
    return [...prev, ...v.content.definitions];
  }, [] as DefinitionNode[]);
  const adjustedSchema = RelayCreate.create(
    printSchemaWithDirectives(schema)
  );
  const relayDocuments = RelayParser.transform(adjustedSchema, documentAsts);

  const queryCompilerContext = new GraphQLCompilerContext(adjustedSchema)
    .addAll(relayDocuments)
    .applyTransforms([ApplyFragmentArgumentTransform.transform, InlineFragmentsTransform.transform, FlattenTransform.transformWithOptions({ flattenAbstractTypes: false }), SkipRedundantNodesTransform.transform]);

    const newQueryDocuments = queryCompilerContext.documents().map(doc => ({
      filePath: 'optimized by relay',
      content: parse(print(adjustedSchema, doc)),
    }));

  return newQueryDocuments;
}
