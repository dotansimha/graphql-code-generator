import { GraphQLUnionType } from 'graphql';
import { Union } from '../types';
import { debugLog } from '../debugging';

export function transformUnion(union: GraphQLUnionType): Union {
  debugLog(`[transformUnion] transformed union ${union.name}`);

  return {
    name: union.name,
    description: union.description || '',
    possibleTypes: union.getTypes().map(type => type.name),
  };
}
