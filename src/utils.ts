import {GraphQLInterfaceType} from 'graphql/type/definition';
import {GraphQLObjectType} from 'graphql/type/definition';
import {GraphQLField} from 'graphql/type/definition';
import {GraphQLType} from 'graphql/type/definition';
import {Model} from './interfaces';
import {GraphQLSchema} from 'graphql/type/schema';
import {OperationDefinitionNode} from 'graphql/language/ast';
import pascalCase = require('pascal-case');

export const isPrimitive = (primitivesMap: any, type: string) => {
  return Object.keys(primitivesMap).map(key => primitivesMap[key]).find(item => item === type);
};

export const shouldSkip = (typeName: string): boolean => {
  return !typeName ||
    typeName.indexOf('__') > -1 ||
    typeName === 'Query' ||
    typeName === 'Mutation' ||
    typeName === 'Subscription';
};

export const isRequired = (type: GraphQLType): boolean => {
  return (String(type)).indexOf('!') > -1;
};

export const isArray = (type: GraphQLType): boolean => {
  return (String(type)).indexOf('[') > -1;
};

export const getTypeName = (primitivesMap: any, type: GraphQLType) => {
  const name = (String(type)).replace(/[\[\]!]/g, '');

  if (primitivesMap[name]) {
    return primitivesMap[name];
  }
  else {
    return name;
  }
};

export function getFieldDef(parentType, fieldAST): GraphQLField<any, any> {
  const name = fieldAST.name.value;

  if (parentType instanceof GraphQLObjectType ||
    parentType instanceof GraphQLInterfaceType) {
    return parentType.getFields()[name];
  }
}

export const handleNameDuplications = (name: string, existing: Model[]): string => {
  if (existing.find(model => model.name === name)) {
    return handleNameDuplications('_' + name, existing);
  }

  return name;
};

export const getRoot = (schema: GraphQLSchema, operation: OperationDefinitionNode): GraphQLObjectType => {
  switch (operation.operation) {
    case 'query':
      return schema.getQueryType();
    case 'mutation':
      return schema.getMutationType();
    case 'subscription':
      return schema.getSubscriptionType();
    default:
      return;
  }
};

export const buildName = (typesMap: any, name: string, type: string): string => {
  return pascalCase(name) + typesMap[type];
};
