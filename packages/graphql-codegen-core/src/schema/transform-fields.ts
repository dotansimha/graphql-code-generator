import {
  getNamedType,
  GraphQLField,
  GraphQLFieldMap,
  GraphQLSchema,
  GraphQLInterfaceType,
  GraphQLObjectType,
  GraphQLInputObjectType,
  GraphQLNamedType,
  GraphQLScalarType,
  GraphQLUnionType,
  GraphQLEnumType
} from 'graphql';
import { objectMapToArray } from '../utils/object-map-to-array';
import { Field, FieldType } from '../types';
import { resolveType } from './resolve-type';
import { resolveArguments } from './resolve-arguments';
import { resolveTypeIndicators } from './resolve-type-indicators';
import { debugLog } from '../debugging';
import { getDirectives } from '../utils/get-directives';

export function resolveFields(
  schema: GraphQLSchema,
  rawFields: GraphQLFieldMap<any, any>,
  _parent: GraphQLObjectType | GraphQLInterfaceType | GraphQLInputObjectType
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
        fieldType: toFieldType(schema, namedType),
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
        usesDirectives: Object.keys(directives).length > 0
      };
    }
  );
}

function toFieldType(schema: GraphQLSchema, type: GraphQLNamedType): FieldType {
  const typeMap = {
    Type: () => type instanceof GraphQLObjectType,
    Scalar: () => type instanceof GraphQLScalarType,
    Interface: () => type instanceof GraphQLInterfaceType,
    Union: () => type instanceof GraphQLUnionType,
    InputType: () => type instanceof GraphQLInputObjectType,
    Enum: () => type instanceof GraphQLEnumType,
    Query: () => schema.getQueryType() && (schema.getQueryType() as GraphQLObjectType).name === type.name,
    Mutation: () => schema.getMutationType() && (schema.getMutationType() as GraphQLObjectType).name === type.name,
    Subscription: () =>
      schema.getSubscriptionType() && (schema.getSubscriptionType() as GraphQLObjectType).name === type.name
  };

  return Object.keys(typeMap).find(fieldType => typeMap[fieldType]()) as FieldType;
}
