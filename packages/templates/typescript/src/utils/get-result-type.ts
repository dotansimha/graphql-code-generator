import { pascalCase } from 'change-case';

export function getResultType(type, options) {
  const baseType = type.type;
  const config = options.data.root.config || {};
  const realType =
    options.data.root.primitivesMap[baseType] || `${config.interfacePrefix || ''}${pascalCase(baseType)}`;
  const useImmutable = !!config.immutableTypes;

  if (type.isArray) {
    let result = realType;

    if (type.isNullableArray && !config.noNamespaces) {
      result = useImmutable ? [realType, 'null'].join(' | ') : `(${[realType, 'null'].join(' | ')})`;
    }
    if (useImmutable) {
      result = `${new Array(type.dimensionOfArray + 1).join('ReadonlyArray<')}${result}${new Array(
        type.dimensionOfArray + 1
      ).join('>')}`;
    } else {
      result = `${result}${new Array(type.dimensionOfArray + 1).join('[]')}`;
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
