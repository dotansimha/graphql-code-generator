import { Field } from 'graphql-codegen-core';
import { SafeString } from 'handlebars';

export function getEnumValue(type: string, name: string, options: Handlebars.HelperOptions) {
  const config = options.data.root.config || {};
  if (config.enums && type in config.enums && name in config.enums[type]) {
    return config.enums[type][name];
  } else {
    return `"${name}"`;
  }
}

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

export function getOptionals(type: Field, options: Handlebars.HelperOptions) {
  const config = options.data.root.config || {};

  if (
    config.avoidOptionals === '1' ||
    config.avoidOptionals === 'true' ||
    config.avoidOptionals === true ||
    config.avoidOptionals === 1
  ) {
    return '';
  }

  if (!type.isRequired) {
    return '?';
  }

  return '';
}

export const getType = (convert: Function) => (type: Field, options: Handlebars.HelperOptions) => {
  if (!type) {
    return '';
  }

  const result = convertedType(type, options, convert);

  return new SafeString(result);
};

export function convertedType(type: Field, options: Handlebars.HelperOptions, convert, skipConversion = false) {
  const baseType = type.type;
  const underscorePrefix = type.type.match(/^[\_]+/) || '';
  const config = options.data.root.config || {};
  const realType =
    options.data.root.primitives[baseType] ||
    `${type.isScalar ? '' : config.interfacePrefix || ''}${underscorePrefix +
      (skipConversion ? baseType : convert(baseType))}`;

  return getFieldType(type, realType, options);
}
