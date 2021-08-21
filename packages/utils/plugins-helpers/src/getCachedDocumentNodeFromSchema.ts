import { getDocumentNodeFromSchema } from '@graphql-tools/utils';
import { GraphQLSchema, DocumentNode } from 'graphql';

const schemaDocumentNodeCache = new WeakMap<GraphQLSchema, DocumentNode>();

export function getCachedDocumentNodeFromSchema(schema: GraphQLSchema) {
  let documentNode = schemaDocumentNodeCache.get(schema);
  if (!documentNode) {
    documentNode = getDocumentNodeFromSchema(schema);
    schemaDocumentNodeCache.set(schema, documentNode);
  }
  return documentNode;
}
