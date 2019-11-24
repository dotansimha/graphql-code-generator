import { printSchemaWithDirectives } from '@graphql-toolkit/common';
import { parse, GraphQLSchema, DefinitionNode } from 'graphql';
import { Types, PluginFunction } from '@graphql-codegen/plugin-helpers';

import { transformASTSchema, Parser as RelayParser } from 'relay-compiler';
import * as SkipRedundantNodesTransform from 'relay-compiler/lib/transforms/SkipRedundantNodesTransform';
import * as InlineFragmentsTransform from 'relay-compiler/lib/transforms/InlineFragmentsTransform';
import * as ApplyFragmentArgumentTransform from 'relay-compiler/lib/transforms/ApplyFragmentArgumentTransform';
import * as FlattenTransform from 'relay-compiler/lib/transforms/FlattenTransform';

const RelayCreate = require('relay-compiler/lib/core/Schema');
const GraphQLCompilerContext = require('relay-compiler/lib/core/GraphQLCompilerContext');
const { print } = require('relay-compiler/lib/core/GraphQLIRPrinter');

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
  const adjustedSchema = RelayCreate.create(
    printSchemaWithDirectives(
      transformASTSchema(schema, [
        /* GraphQL */ `
          directive @connection(key: String!) on FIELD
          directive @client on FIELD
        `,
      ])
    )
  );
  const documentAsts = documents.reduce((prev, v) => {
    return [...prev, ...v.content.definitions];
  }, [] as DefinitionNode[]);

  const relayDocuments = RelayParser.transform(adjustedSchema, documentAsts);

  const fragmentCompilerContext = new GraphQLCompilerContext(adjustedSchema).addAll(relayDocuments);

  const fragmentDocuments = fragmentCompilerContext
    .applyTransforms([ApplyFragmentArgumentTransform.transform, FlattenTransform.transformWithOptions({ flattenAbstractTypes: false }), SkipRedundantNodesTransform.transform])
    .documents()
    .filter(doc => doc.kind === 'Fragment');

  const queryCompilerContext = new GraphQLCompilerContext(adjustedSchema)
    .addAll(relayDocuments)
    .applyTransforms([ApplyFragmentArgumentTransform.transform, InlineFragmentsTransform.transform, FlattenTransform.transformWithOptions({ flattenAbstractTypes: false }), SkipRedundantNodesTransform.transform]);

  const newQueryDocuments = queryCompilerContext.documents().map(doc => ({
    filePath: 'optimized by relay',
    content: parse(print(adjustedSchema, doc)),
  }));

  const newDocuments = [
    ...fragmentDocuments.map(doc => ({
      filePath: 'optimized by relay',
      content: parse(print(adjustedSchema, doc)),
    })),
    ...newQueryDocuments,
  ];

  documents.splice(0, documents.length);
  documents.push(...newDocuments);

  return {
    content: '',
  };
};
