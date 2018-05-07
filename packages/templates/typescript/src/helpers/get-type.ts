import { SafeString } from 'handlebars';

export function getType(type, options) {
  if (!type) {
    return '';
  }

  const baseType = type.type;
  const realType = options.data.root.primitivesMap[baseType] || baseType;
  const useImmutable = !!(options.data.root.config || {}).immutableTypes;

  if (type.isArray) {
    let result = realType;

    if (type.isNullableArray) {
      result = useImmutable ? [realType, 'null'].join(' | ') : `(${[realType, 'null'].join(' | ')})`;
    }

    if (useImmutable) {
      result = `ReadonlyArray<${result}>`;
    } else {
      result = `${result}[]`;
    }

    if (!type.isRequired) {
      result = [result, 'null'].join(' | ');
    }

    return new SafeString(result);
  } else {
    if (type.isRequired) {
      return realType;
    } else {
      return [realType, 'null'].join(' | ');
    }
  }
}
