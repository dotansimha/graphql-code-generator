import { type GraphQLNamedType, isIntrospectionType, isSpecifiedScalarType } from 'graphql';

export const isNativeNamedType = (namedType: GraphQLNamedType): boolean => {
  // "Native" NamedType in this context means the following:
  // 1. introspection types i.e. with `__` prefixes
  // 2. base scalars e.g. Boolean, Int, etc.
  // 3. Other natives (mostly base scalars) which was not defined in the schema i.e. no `astNode`
  if (isSpecifiedScalarType(namedType) || isIntrospectionType(namedType) || !namedType.astNode) {
    return true;
  }

  return false;
};
