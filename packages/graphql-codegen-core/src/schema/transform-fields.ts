import { GraphQLField, GraphQLFieldMap } from 'graphql';
import { objectMapToArray } from '../utils/object-map-to-array';
import { Field } from '../types';
import { resolveType } from './resolve-type';
import { resolveArguments } from './resolve-arguments';

export function resolveFields(rawFields: GraphQLFieldMap<any, any>): Field[] {
  const fieldsArray = objectMapToArray<GraphQLField<any, any>>(rawFields);

  return fieldsArray.map<Field>((item: { key: string, value: GraphQLField<any, any> }): Field => {
    const type = resolveType(item.value.type);
    const resolvedArguments = resolveArguments(item.value.args || []);

    return {
      name: item.value.name,
      description: item.value.description || '',
      arguments: resolvedArguments,
      type: type.name,
      isArray: type.isArray,
      isRequired: type.isRequired,
      hasArguments: resolvedArguments.length > 0,
    };
  });
}
