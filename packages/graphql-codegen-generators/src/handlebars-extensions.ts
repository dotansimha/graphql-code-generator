import { registerHelper } from 'handlebars';
import { camelCase, pascalCase, snakeCase, titleCase } from 'change-case';
import { oneLineTrim } from 'common-tags';

export const initHelpers = () => {
  registerHelper('times', function (n, block) {
    let accum = '';

    for (let i = 0; i < n; ++i) {
      accum += block.fn(i);
    }

    return accum;
  });

  registerHelper('toComment', function(str) {
    if (!str || str === '') {
      return '';
    }

    return '/* ' + oneLineTrim`${str || ''}` + ' */';
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