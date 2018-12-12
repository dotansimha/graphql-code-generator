import { SafeString } from 'handlebars';
import { oneLine } from 'common-tags';

function blockComment(str: string) {
  if (!str || str === '') {
    return '';
  }

  return new SafeString(
    [
      '\n',
      '// ====================================================',
      '// ' + oneLine`${str || ''}`,
      '// ====================================================',
      '\n'
    ].join('\n')
  );
}

export const helpers = {
  for(from: any, to: any, incr: any, block: any) {
    let accum = '';

    for (let i = from; i < to; i += incr) {
      accum += block.fn(i);
    }

    return accum;
  },
  ifCond(this: any, v1: any, operator: string, v2: any, options: any) {
    switch (operator) {
      case '==':
        return v1 === v2 ? options.fn(this) : options.inverse(this);
      case '===':
        return v1 === v2 ? options.fn(this) : options.inverse(this);
      case '!=':
        return v1 !== v2 ? options.fn(this) : options.inverse(this);
      case '!==':
        return v1 !== v2 ? options.fn(this) : options.inverse(this);
      case '<':
        return v1 < v2 ? options.fn(this) : options.inverse(this);
      case '<=':
        return v1 <= v2 ? options.fn(this) : options.inverse(this);
      case '>':
        return v1 > v2 ? options.fn(this) : options.inverse(this);
      case '>=':
        return v1 >= v2 ? options.fn(this) : options.inverse(this);
      case '&&':
        return v1 && v2 ? options.fn(this) : options.inverse(this);
      case '||':
        return v1 || v2 ? options.fn(this) : options.inverse(this);
      default:
        return options.inverse(this);
    }
  },
  toScalar: (scalars: any) => (type: string) => {
    return scalars[type] || type || '';
  },
  blockCommentIf(str: string, list: any[] = []) {
    if (list && list.length > 0) {
      return blockComment(str);
    }

    return '';
  },
  blockComment,
  toComment(str: string) {
    if (!str || str === '') {
      return '';
    }

    return new SafeString('/** ' + oneLine`${str || ''}` + ' */');
  },
  toLowerCase(str: string) {
    return (str || '').toLowerCase();
  },
  toUpperCase(str: string) {
    return (str || '').toUpperCase();
  },
  stringify(obj: any) {
    return new SafeString(JSON.stringify(obj));
  },
  times(n: number, block: any) {
    let accum = '';

    for (let i = 0; i < n; ++i) {
      accum += block.fn(i);
    }

    return accum;
  },
  ifDirective(context: any, directiveName: string, options: { inverse: Function; fn: Function; data: { root: any } }) {
    if (context && context['directives'] && directiveName && typeof directiveName === 'string') {
      const directives = context['directives'];
      const directiveValue = directives[directiveName];

      if (directiveValue) {
        return options && options.fn ? options.fn({ ...(directiveValue || {}), ...context }) : '';
      } else {
        return options && options.inverse ? options.inverse(context) : '';
      }
    }

    return options && options.inverse ? options.inverse(context) : '';
  },
  unlessDirective(
    context: any,
    directiveName: string,
    options: { inverse: Function; fn: Function; data: { root: any } }
  ) {
    if (context && context['directives'] && directiveName && typeof directiveName === 'string') {
      const directives = context['directives'];
      const directiveValue = directives[directiveName];

      if (!directiveValue) {
        return options && options.fn ? options.fn({ ...(directiveValue || {}), ...context }) : '';
      } else {
        return options && options.inverse ? options.inverse(context) : '';
      }
    }

    return options && options.inverse ? options.inverse(context) : '';
  }
};
