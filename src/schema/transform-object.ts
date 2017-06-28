import { GraphQLInputObjectType, GraphQLObjectType } from 'graphql';
import { resolveFields } from './transform-fields';

export function transformGraphQLObject(object: GraphQLObjectType | GraphQLInputObjectType) {
  return {
    name: object.name,
    description: object.description,
    fields: resolveFields(object),
    interfaces: object instanceof GraphQLObjectType ? object.getInterfaces().map(inf => inf.name) : [],
    isInputType: object instanceof GraphQLInputObjectType,
  };
}
