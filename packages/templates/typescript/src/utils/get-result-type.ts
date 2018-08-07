import { pascalCase } from 'change-case';

export function getResultType(type, options) {
  const baseType = type.type;
  const underscorePrefix = type.type.match(/^[\_]+/) || '';
  const config = options.data.root.config || {};
  const realType =
    options.data.root.primitivesMap[baseType] ||
    `${config.interfacePrefix || ''}${underscorePrefix + pascalCase(baseType)}`;
  const useImmutable = !!config.immutableTypes;

  if (type.isArray) {
    let result = realType;

    const dimension = type.dimensionOfArray + 1;

    if (type.isNullableArray && !config.noNamespaces) {
      result = useImmutable ? [realType, 'null'].join(' | ') : `(${[realType, 'null'].join(' | ')})`;
    }
    if (useImmutable) {
      result = `${new Array(dimension).join('ReadonlyArray<')}${result}${new Array(dimension).join('>')}`;
    } else {
      result = `${result}${new Array(dimension).join('[]')}`;
    }

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
