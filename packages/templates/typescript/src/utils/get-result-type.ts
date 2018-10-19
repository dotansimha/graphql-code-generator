import { pascalCase } from 'change-case';
import { Field } from 'graphql-codegen-core';

export interface ResultType {
  type: string;
  isQuoted?: boolean;
}

export function getResultType(type: Field, options: Handlebars.HelperOptions, skipPascalCase = false): ResultType {
  const baseType = type.type;
  const underscorePrefix = type.type.match(/^[\_]+/) || '';
  const config = options.data.root.config || {};
  const realType: string =
    options.data.root.primitives[baseType] ||
    `${type.isScalar ? '' : config.interfacePrefix || ''}${underscorePrefix +
      (skipPascalCase ? baseType : pascalCase(baseType))}`;
  const useImmutable = !!config.immutableTypes;

  if (type.name === '__typename') {
    return {
      type: type.type,
      isQuoted: true
    };
  }

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

    return { type: result };
  } else {
    if (type.isRequired) {
      return { type: realType };
    } else {
      return { type: [realType, 'null'].join(' | ') };
    }
  }
}
