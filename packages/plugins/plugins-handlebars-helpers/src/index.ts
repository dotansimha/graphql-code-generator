import { SafeString } from 'handlebars';
import { oneLineTrim } from 'common-tags';

function blockComment(str: string) {
  if (!str || str === '') {
    return '';
  }

  return new SafeString(
    [
      '\n',
      '// ====================================================',
      '// ' + oneLineTrim`${str || ''}`,
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

    return new SafeString('/** ' + oneLineTrim`${str || ''}` + ' */');
  }
};
