import {buildClientSchema, GraphQLSchema, IntrospectionQuery} from 'graphql';

export const validateSchema = (schema: IntrospectionQuery) => {
  if (!schema.__schema) {
    throw new Error('Invalid schema provided!');
  }
};

export const loadSchema = (schemaObject: IntrospectionQuery): GraphQLSchema => {
  validateSchema(schemaObject);

  return buildClientSchema(schemaObject);
};
