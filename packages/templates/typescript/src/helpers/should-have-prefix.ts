import { isPrimitiveType } from './is-primitive-type';

export function shouldHavePrefix(type, options) {
  const config = options.data.root.config || {};
  const nonPrefixable = ['Enum', 'Scalar', 'Union'];

  return (
    config.noNamespaces === true && !isPrimitiveType(type, options) && nonPrefixable.indexOf(type.fieldType) === -1
  );
}
