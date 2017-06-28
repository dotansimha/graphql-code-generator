import {
  GraphQLEnumType, GraphQLInputObjectType, GraphQLInterfaceType, GraphQLNamedType, GraphQLObjectType, GraphQLScalarType,
  GraphQLSchema,
  GraphQLUnionType
} from 'graphql';
import { SchemaTemplateContext, Type } from '../types';
import { objectMapToArray } from '../utils/object-map-to-array';
import { transformGraphQLObject } from './transform-object';
import { transformGraphQLEnum } from './transform-enum';
import { transformUnion } from './transform-union';
import { transformInterface } from './transform-interface';
import { transformScalar } from './transform-scalar';

const GRAPHQL_PRIMITIVES = ['String', 'Int', 'Boolean'];
type GraphQLTypesMap = { [typeName: string]: GraphQLNamedType };

const clearTypes = (typesMap: GraphQLTypesMap): GraphQLTypesMap => Object.keys(typesMap)
  .filter(key => !GRAPHQL_PRIMITIVES.includes(key) && !key.startsWith('__'))
  .reduce((obj, key) => {
    obj[key] = typesMap[key];
    return obj;
  }, {});

export function schemaToTemplateContext(schema: GraphQLSchema): SchemaTemplateContext {
  const result: SchemaTemplateContext = {
    types: [],
    inputTypes: [],
    enums: [],
    unions: [],
    scalars: [],
    interfaces: [],
  };

  const rawTypesMap = schema.getTypeMap();
  const typesMap = clearTypes(rawTypesMap);
  const typesArray = objectMapToArray<GraphQLNamedType>(typesMap);

  typesArray.map((graphQlType: { key: string, value: GraphQLNamedType }) => {
    const actualTypeDef = graphQlType.value;

    if (actualTypeDef instanceof GraphQLObjectType) {
      result.types.push(transformGraphQLObject(actualTypeDef));
    } else if (actualTypeDef instanceof GraphQLInputObjectType) {
      result.inputTypes.push(transformGraphQLObject(actualTypeDef));
    } else if (actualTypeDef instanceof GraphQLEnumType) {
      result.enums.push(transformGraphQLEnum(actualTypeDef));
    } else if (actualTypeDef instanceof GraphQLUnionType) {
      result.unions.push(transformUnion(actualTypeDef));
    } else if (actualTypeDef instanceof GraphQLInterfaceType) {
      result.interfaces.push(transformInterface(actualTypeDef));
    } else if (actualTypeDef instanceof GraphQLScalarType) {
      result.scalars.push(transformScalar(actualTypeDef));
    } else {
      throw new Error(`Unexpected GraphQL type definition: ${graphQlType.key} => ${String(actualTypeDef)}`);
    }
  });

  return result;
}
