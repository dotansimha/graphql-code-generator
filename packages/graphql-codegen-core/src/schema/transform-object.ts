import { GraphQLInputObjectType, GraphQLObjectType, GraphQLSchema } from 'graphql';
import { resolveFields } from './transform-fields';
import { Type } from '../types';
import { debugLog } from '../debugging';
import { getDirectives } from '../utils/get-directives';

export function transformGraphQLObject(
  schema: GraphQLSchema,
  object: GraphQLObjectType | GraphQLInputObjectType
): Type {
  debugLog(`[transformGraphQLObject] transforming type ${object.name}`);
  const resolvedFields = resolveFields(schema, (object as any).getFields(), object);
  const resolvedInterfaces = object instanceof GraphQLObjectType ? object.getInterfaces().map(inf => inf.name) : [];
  const directives = getDirectives(schema, object);

  return {
    name: object.name,
    description: object.description || '',
    fields: resolvedFields,
    interfaces: resolvedInterfaces,
    isInputType: object instanceof GraphQLInputObjectType,
    hasFields: resolvedFields.length > 0,
    hasInterfaces: resolvedInterfaces.length > 0,
    directives,
    usesDirectives: Object.keys(directives).length > 0
  };
}
