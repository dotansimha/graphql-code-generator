import { Field } from 'graphql-codegen-core';
import { SafeString } from 'handlebars';
import * as Handlebars from 'handlebars';

export function concat(...args: string[]) {
  args.pop(); // HBS options passed as last argument

  return args.join('');
}

export function defineMaybe(options: Handlebars.HelperOptions): string {
  const config = options.data.root.config || {};
  const optionalType = config.optionalType || 'null';

  return `export type Maybe<T> = T | ${optionalType};`;
}

export function useMaybe(type: string): string {
  return `Maybe<${type}>`;
}

export function getScalarType(type: string, options: Handlebars.HelperOptions) {
  const config = options.data.root.config || {};
  if (config.scalars && type in config.scalars) {
    return config.scalars[type as string];
  } else {
    return 'any';
  }
}

export function importEnum(name: string, options: Handlebars.HelperOptions) {
  const config = options.data.root.config || {};
  if (!config.enums || typeof config.enums[name] !== 'string') {
    return undefined;
  }

  const [file, type] = config.enums[name].split('#');

  return { name, file, type };
}

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

  function extendType(type: string) {
    return field.hasDefaultValue ? type : useMaybe(type);
  }

  if (field.isArray) {
    let result = realType;

    const dimension = field.dimensionOfArray + 1;

    if (field.isNullableArray && !config.noNamespaces) {
      result = useImmutable ? useMaybe(realType) : `(${useMaybe(realType)})`;
    }

    if (useImmutable) {
      result = `${new Array(dimension).join('ReadonlyArray<')}${result}${new Array(dimension).join('>')}`;
    } else {
      result = `${result}${new Array(dimension).join('[]')}`;
    }

    if (!field.isRequired) {
      result = extendType(result);
    }

    return result;
  } else {
    if (field.isRequired) {
      return realType;
    } else {
      return extendType(realType);
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
  const config = options.data.root.config || {};
  const realType =
    options.data.root.primitives[baseType] ||
    `${type.isScalar ? '' : config.interfacePrefix || ''}${skipConversion ? baseType : convert(baseType)}`;

  return getFieldType(type, realType, options);
}
