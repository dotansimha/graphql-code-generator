import { getNamedType, GraphQLInputType, GraphQLOutputType, GraphQLType } from 'graphql';
import { debugLog } from '../debugging';

export interface ResolvedType {
  name: string;
  isRequired: boolean;
  isArray: boolean;
}

export function isRequired(type: GraphQLOutputType | GraphQLInputType): boolean {
  const stringType = String(type);
  return stringType.lastIndexOf('!') === stringType.length - 1;
}

export function isArray(type: GraphQLOutputType | GraphQLInputType): boolean {
  return String(type).indexOf('[') > -1;
}

export function resolveType(type: GraphQLType): ResolvedType {
  const name = getNamedType(type).name;
  debugLog(`[resolveType] resolving type ${name}`);

  return {
    name,
    isRequired: isRequired(type),
    isArray: isArray(type)
  };
}
