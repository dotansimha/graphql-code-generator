import { isPrimitiveType } from './is-primitive-type';

export function shouldHavePrefix(type, options) {
  const config = options.data.root.config || {};
  const nonPrefixable = type.isEnum || type.isUnion || type.isScalar;

  return config.noNamespaces === true && !isPrimitiveType(type, options) && !nonPrefixable;
}
