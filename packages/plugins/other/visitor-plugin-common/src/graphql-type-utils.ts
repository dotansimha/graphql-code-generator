import { isIntrospectionType, isSpecifiedScalarType, type GraphQLNamedType } from 'graphql';

export const isNativeNamedType = (namedType: GraphQLNamedType): boolean => {
  // "Native" NamedType in this context means the following:
  // 1. introspection types i.e. with `__` prefixes
  // 2. base scalars e.g. Boolean, Int, etc.
  if (isSpecifiedScalarType(namedType) || isIntrospectionType(namedType)) {
    return true;
  }

  return false;
};
