import { GraphQLInterfaceType } from 'graphql';
import { Interface } from '../types';
import { resolveFields } from './transform-fields';

export function transformInterface(gqlInterface: GraphQLInterfaceType): Interface {
  return {
    name: gqlInterface.name,
    description: gqlInterface.description,
    fields: resolveFields(gqlInterface),
  };
}
