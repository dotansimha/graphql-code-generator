import { GraphQLSchema, DocumentNode } from 'graphql';
import { mergeGraphQLSchemas } from 'graphql-toolkit';
import { makeExecutableSchema } from 'graphql-tools';

export function mergeSchemas(schemas: Array<string | GraphQLSchema | DocumentNode>): DocumentNode {
  const schemasArr = schemas.filter(s => s);

  if (schemasArr.length === 0) {
    return null;
  } else {
    return mergeGraphQLSchemas(schemasArr);
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
