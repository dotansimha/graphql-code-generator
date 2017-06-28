import * as Handlebars from 'handlebars';

function isFunction(functionToCheck) {
  let getType = {};
  return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}

export interface PartialDefinition {
  name: string;
  content: string;
}

export interface HelperDefinition {
  name: string;
  func: Function;
}

export const initPartials = (partials: PartialDefinition[]) => {
  partials.forEach((partial: PartialDefinition) => {
    Handlebars.registerPartial(partial.name, partial.content);
  });
};

export const initTemplateHelpers = (helpers: HelperDefinition[]) => {
  helpers.forEach((helper: HelperDefinition) => {
    Handlebars.registerHelper(helper.name, helper.func);
  });
};

export const initHelpers = () => {
  Handlebars.registerHelper('times', function (n, block) {
    let accum = '';

    for (let i = 0; i < n; ++i) {
      accum += block.fn(i);
    }

    return accum;
  });

  Handlebars.registerHelper('for', function (from, to, incr, block) {
    let accum = '';

    for (let i = from; i < to; i += incr) {
      accum += block.fn(i);
    }

    return accum;
  });

  Handlebars.registerHelper('limitedEach', function (context, block) {
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
