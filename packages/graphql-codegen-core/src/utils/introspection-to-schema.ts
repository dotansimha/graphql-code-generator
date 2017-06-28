import {buildClientSchema, GraphQLSchema, IntrospectionQuery} from 'graphql';

export const validateIntrospection = (schema: IntrospectionQuery) => {
  if (!schema.__schema) {
    throw new Error('Invalid schema provided!');
  }
};

export function introspectionToGraphQLSchema(introspectionQuery: IntrospectionQuery): GraphQLSchema {
  validateIntrospection(introspectionQuery);

  return buildClientSchema(introspectionQuery);
}
