import { GraphQLUnionType } from 'graphql';
import { Union } from '../types';

export function transformUnion(union: GraphQLUnionType): Union {
  return {
    name: union.name,
    description: union.description,
    possibleTypes: union.getTypes().map(type => type.name),
  };
}
