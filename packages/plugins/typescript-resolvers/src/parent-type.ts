import { Type, Interface, Union } from 'graphql-codegen-core';
import { GraphQLSchema, GraphQLObjectType, GraphQLNamedType } from 'graphql';
import { pickMapper, useDefaultMapper } from './mappers';
import { isInterface } from './helpers';

const emptyParent = '{}';

function getRootTypeNames(schema: GraphQLSchema): string[] {
  const query = ((schema.getQueryType() || {}) as GraphQLObjectType).name;
  const mutation = ((schema.getMutationType() || {}) as GraphQLObjectType).name;
  const subscription = ((schema.getSubscriptionType() || {}) as GraphQLObjectType).name;

  return [query, mutation, subscription];
}

function isRootType(
  type: {
    name: string;
  },
  schema: GraphQLSchema
) {
  return getRootTypeNames(schema).includes(type.name);
}

export const getParentType = convert => (type: Type | GraphQLNamedType, options: Handlebars.HelperOptions) => {
  const config = options.data.root.config || {};
  const schema: GraphQLSchema = options.data.root.rawSchema;
  const mapper = pickMapper(type.name, config.mappers || {}, options);
  const defaultMapper = useDefaultMapper(type, options);
  let name: string;

  if (mapper) {
    name = mapper.type;
  } else if (defaultMapper) {
    name = defaultMapper.type;
  } else {
    name = `${config.interfacePrefix || ''}${convert(type.name)}`;
  }

  return isRootType(type, schema) ? emptyParent : name;
};

export function getParentTypes(convert) {
  return (entity: Interface | Union, options: Handlebars.HelperOptions) => {
    const schema: GraphQLSchema = options.data.root.rawSchema;
    let types: string[] = [];

    if (isInterface(entity)) {
      types = entity.implementingTypes;
    } else {
      types = entity.possibleTypes;
    }

    const parentTypes = types
      .map(name => schema.getType(name))
      .map(type => getParentType(convert)(type, options))
      .filter((parent, i, all) => all.indexOf(parent) === i);

    if (parentTypes.length) {
      return parentTypes.join(' | ');
    }

    return emptyParent;
  };
}
