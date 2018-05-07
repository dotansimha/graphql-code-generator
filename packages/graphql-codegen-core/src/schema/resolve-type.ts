import { getNamedType, GraphQLInputType, GraphQLOutputType, GraphQLType } from 'graphql';
import { debugLog } from '../debugging';

export interface ResolvedType {
  raw: string;
  name: string;
  isRequired: boolean;
  isArray: boolean;
  isNullableArray: boolean;
}

export function isRequired(type: GraphQLOutputType | GraphQLInputType): boolean {
  const stringType = String(type);

  return stringType.lastIndexOf('!') === stringType.length - 1;
}

export function isNullable(type: GraphQLOutputType | GraphQLInputType): boolean {
  const stringType = String(type);

  return isArray(type) && !stringType.includes('!]');
}

export function isArray(type: GraphQLOutputType | GraphQLInputType): boolean {
  return String(type).indexOf('[') > -1;
}

export function resolveType(type: GraphQLType): ResolvedType {
  const name = getNamedType(type).name;
  debugLog(`[resolveType] resolving type ${name}`);

  return {
    name,
    raw: String(type),
    isRequired: isRequired(type),
    isArray: isArray(type),
    isNullableArray: isNullable(type)
  };
}
