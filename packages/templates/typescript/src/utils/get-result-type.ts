import { pascalCase } from 'change-case';

export function getResultType(type, options) {
  const baseType = type.type;
  const realType = options.data.root.primitivesMap[baseType] || pascalCase(baseType);
  const config = options.data.root.config || {};
  const useImmutable = !!config.immutableTypes;

  if (type.isArray) {
    let result = realType;

    if (type.isNullableArray && !config.noNamespaces) {
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

    return result;
  } else {
    if (type.isRequired) {
      return realType;
    } else {
      return [realType, 'null'].join(' | ');
    }
  }
}
