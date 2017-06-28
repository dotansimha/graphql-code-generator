import { GraphQLScalarType } from 'graphql';
import { Scalar } from '../types';

export function transformScalar(scalar: GraphQLScalarType): Scalar {
  return {
    name: scalar.name,
    description: scalar.description || '',
  };
}
