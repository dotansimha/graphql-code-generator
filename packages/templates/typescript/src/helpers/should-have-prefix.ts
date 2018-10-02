import { isPrimitiveType } from './is-primitive-type';
import { Field } from 'graphql-codegen-core';

export function shouldHavePrefix(type: Field, options: Handlebars.HelperOptions) {
  const config = options.data.root.config || {};
  const nonPrefixable = type.isEnum || type.isUnion || type.isScalar;

  return config.noNamespaces === true && !isPrimitiveType(type, options) && !nonPrefixable;
}
