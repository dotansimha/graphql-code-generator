import { printSchemaWithDirectives } from '@graphql-toolkit/common';
import { parse, GraphQLSchema, DefinitionNode } from 'graphql';
import { Types, PluginFunction } from '@graphql-codegen/plugin-helpers';

import * as SkipRedundantNodesTransform from 'relay-compiler/lib/transforms/SkipRedundantNodesTransform';
import * as InlineFragmentsTransform from 'relay-compiler/lib/transforms/InlineFragmentsTransform';
import * as ApplyFragmentArgumentTransform from 'relay-compiler/lib/transforms/ApplyFragmentArgumentTransform';
import * as FlattenTransform from 'relay-compiler/lib/transforms/FlattenTransform';
import { GraphQLCompilerContext, CompilerContextDocument } from 'relay-compiler/lib/core/GraphQLCompilerContext';
import * as RelayParser from 'relay-compiler/lib/core/RelayParser';
import * as RelayPrinter from 'relay-compiler/lib/core/GraphQLIRPrinter';
import { transformASTSchema } from 'relay-compiler/lib/core/ASTConvert';
import * as RelayCreate from 'relay-compiler/lib/core/Schema';

declare module 'relay-compiler/lib/core/Schema' {
  export function create(schema: string): GraphQLSchema;
}

declare module 'relay-compiler/lib/core/GraphQLIRPrinter' {
  export function print(schema: GraphQLSchema, document: CompilerContextDocument): string;
}

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
    return [...prev, ...v.document.definitions];
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

  const newQueryDocuments: Types.DocumentFile[] = queryCompilerContext.documents().map(doc => ({
    location: 'optimized by relay',
    content: parse(RelayPrinter.print(adjustedSchema, doc)),
  }));

  const newDocuments: Types.DocumentFile[] = [
    ...fragmentDocuments.map(doc => ({
      location: 'optimized by relay',
      document: parse(RelayPrinter.print(adjustedSchema, doc)),
    })),
    ...newQueryDocuments,
  ];

  documents.splice(0, documents.length);
  documents.push(...newDocuments);

  return {
    content: '',
  };
};
