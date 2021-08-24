import { Types } from '@graphql-codegen/plugin-helpers';
import { GraphQLSchema } from 'graphql';
import { optimizeDocuments } from '@graphql-tools/relay-operation-optimizer';

export function optimizeOperations(
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  options?: { includeFragments: boolean }
): Types.DocumentFile[] {
  const newDocuments = optimizeDocuments(
    schema,
    documents.map(s => s.document),
    options
  );

  return newDocuments.map((document, index) => ({
    location: documents[index]?.location || 'optimized by relay',
    document,
  }));
}
