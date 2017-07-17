import { GraphQLNamedType, isLeafType } from 'graphql';

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
    isType: namedType['getFields'] !== undefined && namedType['getInterfaces'] !== undefined,
    isScalar: isLeafType(namedType) && !isEnum,
    isInterface: namedType['resolveType'] !== undefined && namedType['getFields'] !== undefined,
    isUnion: namedType['resolveType'] !== undefined && namedType['getTypes'] !== undefined,
    isInputType: namedType['getFields'] !== undefined && namedType['getInterfaces'] === undefined,
    isEnum: isEnum,
  };
}
