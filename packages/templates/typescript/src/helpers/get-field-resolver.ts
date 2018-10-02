import { SafeString } from 'handlebars';
import { pascalCase } from 'change-case';
import { Field } from 'graphql-codegen-core';

export function getFieldResolver(type: Field, options: Handlebars.HelperOptions) {
  const config = options.data.root.config || {};
  if (!type) {
    return '';
  }

  let result;

  let resolver: string;

  if (type.fieldType === 'Subscription') {
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
