import { GraphQLInputObjectType, GraphQLObjectType } from 'graphql';
import { resolveFields } from './transform-fields';
import { Type } from '../types';

export function transformGraphQLObject(object: GraphQLObjectType | GraphQLInputObjectType): Type {
  const resolvedFields = resolveFields((object as any).getFields());
  const resolvedInterfaces = object instanceof GraphQLObjectType ? object.getInterfaces().map(inf => inf.name) : [];

  return {
    name: object.name,
    description: object.description || '',
    fields: resolvedFields,
    interfaces: resolvedInterfaces,
    isInputType: object instanceof GraphQLInputObjectType,
    hasFields: resolvedFields.length > 0,
    hasInterfaces: resolvedInterfaces.length > 0,
  };
}
