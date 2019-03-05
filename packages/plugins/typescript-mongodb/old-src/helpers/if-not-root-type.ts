import { Type } from 'graphql-codegen-core';
import { GraphQLSchema, GraphQLObjectType } from 'graphql';

function getRootTypeNames(schema: GraphQLSchema): string[] {
  const query = ((schema.getQueryType() || {}) as GraphQLObjectType).name;
  const mutation = ((schema.getMutationType() || {}) as GraphQLObjectType).name;
  const subscription = ((schema.getSubscriptionType() || {}) as GraphQLObjectType).name;

  return [query, mutation, subscription];
}

function ifNotRootType(this: any, type: Type, options: Handlebars.HelperOptions) {
  const schema: GraphQLSchema = options.data.root.rawSchema;

  if (!getRootTypeNames(schema).includes(type.name)) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
}

export default ifNotRootType;
