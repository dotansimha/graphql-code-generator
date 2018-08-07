import { getNamedType, GraphQLInputType, GraphQLOutputType, GraphQLType } from 'graphql';
import { debugLog } from '../debugging';

export interface ResolvedType {
  raw: string;
  name: string;
  isRequired: boolean;
  isArray: boolean;
  isNullableArray: boolean;
  dimensionOfArray: number;
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

export function dimensionOfArray(type: GraphQLOutputType | GraphQLInputType): number {
  const result = _dimensionOfArray(type);

  if (typeof result === 'undefined') {
    // tslint:disable
    console.log('wrong type', { ...type });
    console.log('as string', String(type));
    console.log('inspect', type.inspect());
    console.log('json', type.toJSON());
    console.log('is array', isArray(type));
    console.log('characters', Array.from(String(type)));
  }

  return result;
}

export function _dimensionOfArray(type: GraphQLOutputType | GraphQLInputType): number {
  if (isArray(type)) {
    let dimension = 0;
    const characters = Array.from(String(type));
    for (const char of characters) {
      if (char !== '[') {
        return dimension;
      } else {
        dimension++;
      }
    }
  }
  return -1;
}

export function resolveType(type: GraphQLType): ResolvedType {
  const name = getNamedType(type).name;
  debugLog(`[resolveType] resolving type ${name}`);

  return {
    name,
    raw: String(type),
    isRequired: isRequired(type),
    isArray: isArray(type),
    isNullableArray: isNullable(type),
    dimensionOfArray: dimensionOfArray(type)
  };
}
