import { GraphQLScalarType } from 'graphql';
import { Scalar } from '../types';
import { debugLog } from '../debugging';

export function transformScalar(scalar: GraphQLScalarType): Scalar {
  debugLog(`[transformInterface] transformed custom scalar ${scalar.name}`);

  return {
    name: scalar.name,
    description: scalar.description || '',
  };
}
