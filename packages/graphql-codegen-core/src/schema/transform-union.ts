import { GraphQLSchema, GraphQLUnionType } from 'graphql';
import { Union } from '../types';
import { debugLog } from '../debugging';
import { getDirectives } from '../utils/get-directives';

export function transformUnion(schema: GraphQLSchema, union: GraphQLUnionType): Union {
  debugLog(`[transformUnion] transformed union ${union.name}`);
  const directives = getDirectives(schema, union);

  return {
    name: union.name,
    description: union.description || '',
    possibleTypes: union.getTypes().map(type => type.name),
    directives,
    usesDirectives: Object.keys(directives).length > 0
  };
}
