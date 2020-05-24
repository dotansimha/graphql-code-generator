import { Types } from '@graphql-codegen/plugin-helpers';
import { GraphQLSchema } from 'graphql';
import { optimizeDocuments } from '@graphql-tools/relay-operation-optimizer';

export function optimizeOperations(schema: GraphQLSchema, documents: Types.DocumentFile[]): Types.DocumentFile[] {
  const newDocuments = optimizeDocuments(
    schema,
    documents.map(s => s.document)
  );

  return newDocuments.map(document => ({
    location: 'optimized by relay',
    document,
  }));
}
