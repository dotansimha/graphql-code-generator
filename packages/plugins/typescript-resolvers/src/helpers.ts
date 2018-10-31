import { SafeString } from 'handlebars';
import { Field, Type } from 'graphql-codegen-core';
import { GraphQLSchema } from 'graphql';
import { convertedType, getFieldType as fieldType } from 'graphql-codegen-typescript-common';
import { pickMapper } from './mappers';

export const getFieldType = convert => (field: Field, options: Handlebars.HelperOptions) => {
  const config = options.data.root.config || {};
  const mapper = pickMapper(field.type, config.mappers || {});

  return mapper ? fieldType(field, mapper.type, options) : convertedType(field, options, convert);
};

export const getFieldResolverName = convert => (name: string) => {
  return `${convert(name)}Resolver`;
};

export const getFieldResolver = convert => (field: Field, type: Type, options: Handlebars.HelperOptions) => {
  const config = options.data.root.config || {};
  if (!field) {
    return '';
  }

  let result;
  let resolver: string;
  const schema: GraphQLSchema = options.data.root.rawSchema;
  const subscriptionType = schema.getSubscriptionType();
  const isSubscription = subscriptionType && subscriptionType.name === type.name;

  if (isSubscription) {
    resolver = 'SubscriptionResolver';
  } else {
    resolver = 'Resolver';
  }

  if (field.hasArguments && !config.noNamespaces) {
    result = `${resolver}<R, Parent, Context, ${convert(field.name)}Args>`;
  } else {
    result = `${resolver}<R, Parent, Context>`;
  }

  return new SafeString(result);
};
