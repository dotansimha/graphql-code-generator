import { GraphQLSchema, DocumentNode } from 'graphql';
import { mergeTypeDefs } from 'graphql-toolkit';

export function mergeSchemas(schemas: Array<string | GraphQLSchema | DocumentNode>): DocumentNode {
  const compactSchemas = schemas.filter(s => s);

  if (compactSchemas.length === 0) {
    return null;
  } else {
    return mergeTypeDefs(compactSchemas);
  }
}
