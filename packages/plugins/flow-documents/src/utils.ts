import { GraphQLOutputType, GraphQLNonNull, GraphQLList, isListType, isNonNullType, GraphQLNamedType } from 'graphql';

function isWrapperType(t: GraphQLOutputType): t is GraphQLNonNull<any> | GraphQLList<any> {
  return isListType(t) || isNonNullType(t);
}

export function getBaseType(type: GraphQLOutputType): GraphQLNamedType {
  if (isWrapperType(type)) {
    return getBaseType(type.ofType);
  } else {
    return type;
  }
}

export function quoteIfNeeded(array: string[], joinWith = ' & '): string {
  if (array.length === 0) {
    return '';
  } else if (array.length === 1) {
    return array[0];
  } else {
    return `(${array.join(joinWith)})`;
  }
}
