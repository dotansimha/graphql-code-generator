import {
  GraphQLObjectType,
  GraphQLOutputType,
  GraphQLNonNull,
  GraphQLList,
  GraphQLScalarType,
  GraphQLInterfaceType,
  GraphQLUnionType,
  GraphQLEnumType,
  isListType,
  isNonNullType
} from 'graphql';

function isWrapperType(t: GraphQLOutputType): t is GraphQLNonNull<any> | GraphQLList<any> {
  return isListType(t) || isNonNullType(t);
}

export type GraphQLBaseType =
  | GraphQLScalarType
  | GraphQLObjectType
  | GraphQLInterfaceType
  | GraphQLUnionType
  | GraphQLEnumType;

export function getBaseType(type: GraphQLOutputType): GraphQLBaseType {
  if (isWrapperType(type)) {
    return getBaseType(type.ofType);
  } else {
    return type;
  }
}
