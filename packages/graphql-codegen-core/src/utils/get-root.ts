import { GraphQLObjectType, GraphQLSchema, OperationDefinitionNode } from 'graphql';

export const getRoot = (schema: GraphQLSchema, operation: OperationDefinitionNode): GraphQLObjectType | void => {
  switch (operation.operation) {
    case 'query':
      return schema.getQueryType();
    case 'mutation':
      return schema.getMutationType();
    case 'subscription':
      return schema.getSubscriptionType();
    default:
      return null;
  }
};
