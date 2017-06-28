import { GraphQLInputObjectType, GraphQLObjectType } from 'graphql';
import { resolveFields } from './transform-fields';
import { Type } from '../types';

export function transformGraphQLObject(object: GraphQLObjectType | GraphQLInputObjectType): Type {
  return {
    name: object.name,
    description: object.description || '',
    fields: resolveFields((object as any).getFields()),
    interfaces: object instanceof GraphQLObjectType ? object.getInterfaces().map(inf => inf.name) : [],
    isInputType: object instanceof GraphQLInputObjectType,
  };
}
