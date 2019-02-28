import { GraphQLSchema, DocumentNode } from 'graphql';
import { mergeTypeDefs } from 'graphql-toolkit';
import { makeExecutableSchema } from 'graphql-tools';

export function mergeSchemas(schemas: Array<string | GraphQLSchema | DocumentNode>): DocumentNode {
  const compactSchemas = schemas.filter(s => s);

  if (compactSchemas.length === 0) {
    return null;
  } else {
    return mergeTypeDefs(compactSchemas);
  }
}

export function buildSchema(node: DocumentNode): GraphQLSchema {
  return makeExecutableSchema({
    typeDefs: node,
    allowUndefinedInResolve: true,
    resolverValidationOptions: {
      requireResolversForResolveType: false,
      requireResolversForAllFields: false,
      requireResolversForNonScalar: false,
      requireResolversForArgs: false
    }
  });
}
