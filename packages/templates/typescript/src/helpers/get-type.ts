export function getType(type, options) {
  if (!type) {
    return '';
  }

  const baseType = type.type;
  const realType = options.data.root.primitivesMap[baseType] || baseType;

  if (type.isArray) {
    let result = realType;

    if (type.isNullableArray) {
      result = `(${[realType, 'null'].join(' | ')})`;
    }

    result = `${result}[]`;

    if (!type.isRequired) {
      result = [result, 'null'].join(' | ');
    }

    return result;
  } else {
    if (type.isRequired) {
      return realType;
    } else {
      return [realType, 'null'].join(' | ');
    }
  }
}
