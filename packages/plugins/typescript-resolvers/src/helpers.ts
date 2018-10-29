import { SafeString } from 'handlebars';
import { Field, Type } from 'graphql-codegen-core';
import { GraphQLSchema } from 'graphql';

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
