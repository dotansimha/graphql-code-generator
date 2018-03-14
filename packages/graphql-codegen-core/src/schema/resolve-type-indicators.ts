import {
  GraphQLEnumType,
  GraphQLInputObjectType,
  GraphQLInterfaceType,
  GraphQLNamedType,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLType,
  GraphQLUnionType,
  isLeafType
} from 'graphql';

export interface NamedTypeIndicators {
  isType: boolean;
  isScalar: boolean;
  isInterface: boolean;
  isUnion: boolean;
  isInputType: boolean;
  isEnum: boolean;
}

export function resolveTypeIndicators(namedType: GraphQLNamedType): NamedTypeIndicators {
  const isEnum = namedType['getValues'] !== undefined;

  return {
    isType: namedType instanceof GraphQLObjectType,
    isScalar: namedType instanceof GraphQLScalarType,
    isInterface: namedType instanceof GraphQLInterfaceType,
    isUnion: namedType instanceof GraphQLUnionType,
    isInputType: namedType instanceof GraphQLInputObjectType,
    isEnum: namedType instanceof GraphQLEnumType
  };
}
