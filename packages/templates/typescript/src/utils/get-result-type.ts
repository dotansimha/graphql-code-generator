import { pascalCase } from 'change-case';
import { Field } from 'graphql-codegen-core';

export function getFieldType(field: Field, realType: string, options: Handlebars.HelperOptions) {
  const config = options.data.root.config || {};
  const useImmutable = !!config.immutableTypes;

  if (field.isArray) {
    let result = realType;

    const dimension = field.dimensionOfArray + 1;

    if (field.isNullableArray && !config.noNamespaces) {
      result = useImmutable ? [realType, 'null'].join(' | ') : `(${[realType, 'null'].join(' | ')})`;
    }

    if (useImmutable) {
      result = `${new Array(dimension).join('ReadonlyArray<')}${result}${new Array(dimension).join('>')}`;
    } else {
      result = `${result}${new Array(dimension).join('[]')}`;
    }

    if (!field.isRequired) {
      result = [result, 'null'].join(' | ');
    }

    return result;
  } else {
    if (field.isRequired) {
      return realType;
    } else {
      return [realType, 'null'].join(' | ');
    }
  }
}

export function convertedType(type: Field, options: Handlebars.HelperOptions, skipPascalCase = false) {
  const baseType = type.type;
  const underscorePrefix = type.type.match(/^[\_]+/) || '';
  const config = options.data.root.config || {};
  const realType =
    options.data.root.primitives[baseType] ||
    `${type.isScalar ? '' : config.interfacePrefix || ''}${underscorePrefix +
      (skipPascalCase ? baseType : pascalCase(baseType))}`;

  return getFieldType(type, realType, options);
}
