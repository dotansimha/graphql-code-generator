import { getNamedType, GraphQLInputType, GraphQLOutputType } from 'graphql';

export interface ResolvedType {
  name: string;
  isRequired: boolean;
  isArray: boolean;
}

export function isRequired(type: GraphQLOutputType | GraphQLInputType): boolean {
  return (String(type)).indexOf('!') > -1;
}

export function isArray(type: GraphQLOutputType | GraphQLInputType): boolean {
  return (String(type)).indexOf('[') > -1;
}

export function resolveType(type: GraphQLOutputType | GraphQLInputType): ResolvedType {
  return {
    name: getNamedType(type).name,
    isRequired: isRequired(type),
    isArray: isArray(type),
  };
}
