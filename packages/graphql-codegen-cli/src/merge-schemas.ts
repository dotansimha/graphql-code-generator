import { GraphQLSchema } from 'graphql';
import { mergeGraphQLSchemas } from '@graphql-modules/epoxy';
import { makeExecutableSchema } from 'graphql-tools';

export async function mergeSchemas(schemas: GraphQLSchema[]): Promise<GraphQLSchema> {
  if (schemas.length === 0) {
    return null;
  } else if (schemas.length === 1) {
    return schemas[0];
  } else {
    const mergedSchemaString = mergeGraphQLSchemas(schemas.filter(s => s));

    return makeExecutableSchema({
      typeDefs: mergedSchemaString,
      allowUndefinedInResolve: true,
      resolverValidationOptions: {
        requireResolversForResolveType: false,
        requireResolversForAllFields: false,
        requireResolversForNonScalar: false,
        requireResolversForArgs: false
      }
    });
  }
}
