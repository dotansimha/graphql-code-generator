import { registerHelper } from 'handlebars';
import { camelCase, pascalCase, snakeCase, titleCase } from 'change-case';
import { oneLineTrim } from 'common-tags';
import { Field, Type } from 'graphql-codegen-core';
import { getFieldTypeAsString } from './field-type-to-string';
import { sanitizeFilename } from './sanitizie-filename';
import { GeneratorConfig } from './types';

export const initHelpers = (config: GeneratorConfig) => {
  registerHelper('toPrimitive', function (type) {
    return config.primitives[type] || type || '';
  });

  registerHelper('times', function (n, block) {
    let accum = '';

    for (let i = 0; i < n; ++i) {
      accum += block.fn(i);
    }

    return accum;
  });

  registerHelper('toComment', function (str) {
    if (!str || str === '') {
      return '';
    }

    return '/* ' + oneLineTrim`${str || ''}` + ' */';
  });

  registerHelper('eachImport', function (context: any, options: { fn: Function }) {
    let ret = '';
    const imports: { name: string; file: string; }[] = [];

    if (context.fields && context.interfaces) {
      const type = context as Type;

      type.fields.forEach((field: Field) => {
        if (!config.primitives[field.type]) {
          let fieldType = getFieldTypeAsString(field);
          const file = sanitizeFilename(field.type, fieldType) + '.' + config.filesExtension;
          imports.push({ name: field.type, file });
        }
      })
    }

    for (let i = 0, j = imports.length; i < j; i++) {
      ret = ret + options.fn(imports[i]);
    }

    return ret;
  });

  registerHelper('toLowerCase', function (str) {
    return (str || '').toLowerCase();
  });

  registerHelper('toUpperCase', function (str) {
    return (str || '').toUpperCase();
  });

  registerHelper('toPascalCase', function (str) {
    return pascalCase(str || '');
  });

  registerHelper('toSnakeCase', function (str) {
    return snakeCase(str || '');
  });

  registerHelper('toTitleCase', function (str) {
    return titleCase(str || '');
  });

  registerHelper('toCamelCqse', function (str) {
    return camelCase(str || '');
  });

  registerHelper('for', function (from, to, incr, block) {
    let accum = '';

    for (let i = from; i < to; i += incr) {
      accum += block.fn(i);
    }

    return accum;
  });

  registerHelper('limitedEach', function (context, block) {
    let ret = '';
    let count = parseInt(block.hash.count);

    for (let i = 0, j = count; i < j; i++) {
      ret = ret + block.fn(context[i], {
        data: {
          last: i === count - 1,
          first: i === 0,
          index: 1
        }
      });
    }

    return ret;
  });
};