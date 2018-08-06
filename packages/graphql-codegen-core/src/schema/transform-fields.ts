import {
  getNamedType,
  GraphQLField,
  GraphQLFieldMap,
  GraphQLSchema,
  GraphQLInterfaceType,
  GraphQLObjectType,
  GraphQLInputObjectType
} from 'graphql';
import { objectMapToArray } from '../utils/object-map-to-array';
import { Field } from '../types';
import { resolveType } from './resolve-type';
import { resolveArguments } from './resolve-arguments';
import { resolveTypeIndicators } from './resolve-type-indicators';
import { debugLog } from '../debugging';
import { getDirectives } from '../utils/get-directives';

export function resolveFields(
  schema: GraphQLSchema,
  rawFields: GraphQLFieldMap<any, any>,
  parent: GraphQLObjectType | GraphQLInterfaceType | GraphQLInputObjectType
): Field[] {
  const fieldsArray = objectMapToArray<GraphQLField<any, any>>(rawFields);

  return fieldsArray.map<Field>(
    (item: { key: string; value: GraphQLField<any, any> }): Field => {
      const type = resolveType(item.value.type);
      const resolvedArguments = resolveArguments(schema, item.value.args || []);
      const namedType = getNamedType(item.value.type);
      const indicators = resolveTypeIndicators(namedType);
      const directives = getDirectives(schema, item.value);

      debugLog(`[resolveFields] transformed field ${item.value.name} of type ${type}, resolved type is: `, type);

      return {
        name: item.value.name,
        description: item.value.description || '',
        arguments: resolvedArguments,
        type: type.name,
        raw: type.raw,
        isNullableArray: type.isNullableArray,
        isArray: type.isArray,
        dimensionOfArray: type.dimensionOfArray,
        isRequired: type.isRequired,
        hasArguments: resolvedArguments.length > 0,
        isEnum: indicators.isEnum,
        isScalar: indicators.isScalar,
        isInterface: indicators.isInterface,
        isUnion: indicators.isUnion,
        isInputType: indicators.isInputType,
        isType: indicators.isType,
        directives,
        usesDirectives: Object.keys(directives).length > 0,
        isQuery: isQuery(schema, parent.name),
        isMutation: isMutation(schema, parent.name),
        isSubscription: isSubscription(schema, parent.name)
      };
    }
  );
}

function isQuery(schema: GraphQLSchema, parent: string): boolean {
  return schema.getQueryType() && schema.getQueryType().name === parent;
}

function isMutation(schema: GraphQLSchema, parent: string): boolean {
  return schema.getMutationType() && schema.getMutationType().name === parent;
}

function isSubscription(schema: GraphQLSchema, parent: string): boolean {
  return schema.getSubscriptionType() && schema.getSubscriptionType().name === parent;
}
