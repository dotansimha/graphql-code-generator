import { SafeString } from 'handlebars';
import { pascalCase } from 'change-case';
import { Field } from 'graphql-codegen-core';
import { GraphQLSchema } from 'graphql';

export function getFieldResolver(type: Field, parent: any, options: Handlebars.HelperOptions) {
  const config = options.data.root.config || {};
  if (!type) {
    return '';
  }

  let result;
  let resolver: string;
  const schema: GraphQLSchema = options.data.root.rawSchema;
  const subscriptionType = schema.getSubscriptionType();
  const isSubscription = subscriptionType && subscriptionType.name === parent.name;

  if (isSubscription) {
    resolver = 'SubscriptionResolver';
  } else {
    resolver = 'Resolver';
  }

  if (type.hasArguments && !config.noNamespaces) {
    result = `${resolver}<R, Parent, Context, ${pascalCase(type.name)}Args>`;
  } else {
    result = `${resolver}<R, Parent, Context>`;
  }

  return new SafeString(result);
}
