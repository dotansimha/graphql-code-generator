import { GraphQLScalarType, GraphQLSchema } from 'graphql';
import { Scalar } from '../types';
import { debugLog } from '../debugging';
import { getDirectives } from '../utils/get-directives';

export function transformScalar(schema: GraphQLSchema, scalar: GraphQLScalarType): Scalar {
  debugLog(`[transformInterface] transformed custom scalar ${scalar.name}`);
  const directives = getDirectives(schema, scalar);

  return {
    name: scalar.name,
    description: scalar.description || '',
    directives,
    usesDirectives: Object.keys(directives).length > 0
  };
}
