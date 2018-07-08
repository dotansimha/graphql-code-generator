import {
  getNamedType,
  GraphQLInputType,
  GraphQLOutputType,
  GraphQLType,
  isListType,
  isNamedType,
  isNonNullType,
  isObjectType,
  isWrappingType
} from 'graphql';
import { debugLog } from '../debugging';

export interface ResolvedType {
  raw: string;
  name: string;
  isRequired: boolean;
  isArray: boolean;
  isNullableArray: boolean;
  nestedTypeInfo: NestedInfoNode;
}

export type NestedInfoNode = RequiredNode | ArrayNode | TypeNameNode;

export type RequiredNode = {
  leafType: 'REQUIRED';
  inner?: NestedInfoNode;
};

export type ArrayNode = {
  leafType: 'ARRAY';
  inner?: NestedInfoNode;
};

export type TypeNameNode = {
  leafType: 'TYPENAME';
  name: string;
};

export function resolveTypeInfo(type: GraphQLOutputType | GraphQLInputType): NestedInfoNode {
  if (isNonNullType(type)) {
    return {
      leafType: 'REQUIRED',
      inner: resolveTypeInfo(type.ofType)
    };
  }

  if (isListType(type)) {
    return {
      leafType: 'ARRAY',
      inner: resolveTypeInfo(type.ofType)
    };
  }

  if (isNamedType(type)) {
    return {
      leafType: 'TYPENAME',
      name: type.name
    };
  }

  return null;
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
    nestedTypeInfo: resolveTypeInfo(type),
    isNullableArray: isNullable(type)
  };
}
