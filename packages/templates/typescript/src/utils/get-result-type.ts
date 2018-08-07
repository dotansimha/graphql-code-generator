import { pascalCase } from 'change-case';

export function getResultType(type, options) {
  const baseType = type.type;
  const config = options.data.root.config || {};
  const realType =
    options.data.root.primitivesMap[baseType] || `${config.interfacePrefix || ''}${pascalCase(baseType)}`;
  const useImmutable = !!config.immutableTypes;

  if (type.isArray) {
    let result = realType;

    try {
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
    } catch (e) {
      // tslint:disable-next-line
      console.log('type', { ...type });
      // tslint:disable-next-line
      console.log('type.dimensionOfArray', type.dimensionOfArray);
      throw e;
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
