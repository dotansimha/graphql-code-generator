import { GraphQLInterfaceType } from 'graphql';
import { Interface } from '../types';
import { resolveFields } from './transform-fields';

export function transformInterface(gqlInterface: GraphQLInterfaceType): Interface {
  const resolvedFields = resolveFields(gqlInterface.getFields());

  return {
    name: gqlInterface.name,
    description: gqlInterface.description || '',
    fields: resolvedFields,
    hasFields: resolvedFields.length > 0,
  };
}
