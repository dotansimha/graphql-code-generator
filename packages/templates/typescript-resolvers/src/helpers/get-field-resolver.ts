import { SafeString } from 'handlebars';
import { Field, Type, toPascalCase } from 'graphql-codegen-core';
import { GraphQLSchema } from 'graphql';

export function getFieldResolver(field: Field, type: Type, options: Handlebars.HelperOptions) {
  if (!field) {
    return '';
  }

  let resolver: string;
  const config = options.data.root.config || {};
  const schema: GraphQLSchema = options.data.root.rawSchema;
  const subscriptionType = schema.getSubscriptionType();
  const isSubscription = subscriptionType && subscriptionType.name === type.name;

  if (isSubscription) {
    resolver = 'SubscriptionResolver';
  } else {
    resolver = 'Resolver';
  }

  const generics: string[] = ['R', 'Parent', 'Context'];

  if (field.hasArguments) {
    const prefix = config.noNamespaces ? toPascalCase(type.name) : '';

    generics.push(`${prefix}${toPascalCase(field.name)}Args`);
  }

  return new SafeString(`${resolver}<${generics.join(', ')}>`);
}
