import { getNamedType, GraphQLInputType, GraphQLOutputType, GraphQLType } from 'graphql';

export interface ResolvedType {
  name: string;
  isRequired: boolean;
  isArray: boolean;
}

export const isRequired = (type: GraphQLOutputType | GraphQLInputType): boolean => {
  return (String(type)).indexOf('!') > -1;
};

export const isArray = (type: GraphQLOutputType | GraphQLInputType): boolean => {
  return (String(type)).indexOf('[') > -1;
};

export function resolveType(type: GraphQLOutputType | GraphQLInputType): ResolvedType {
  return {
    name: getNamedType(type).name,
    isRequired: isRequired(type),
    isArray: isArray(type),
  }
}
