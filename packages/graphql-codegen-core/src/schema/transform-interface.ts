import { GraphQLInterfaceType } from 'graphql';
import { Interface } from '../types';
import { resolveFields } from './transform-fields';
import { debugLog } from '../debugging';

export function transformInterface(gqlInterface: GraphQLInterfaceType): Interface {
  debugLog(`[transformInterface] transformed interface ${gqlInterface.name}`);

  const resolvedFields = resolveFields(gqlInterface.getFields());

  return {
    name: gqlInterface.name,
    description: gqlInterface.description || '',
    fields: resolvedFields,
    hasFields: resolvedFields.length > 0,
  };
}
