import { Field } from 'graphql-codegen-core';

function isArray(this: any, field: Field, options: Handlebars.HelperOptions) {
  if (!field) {
    return '';
  }

  if (field.isArray || (field.directives.column && field.directives.column.overrideIsArray)) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
}

export default isArray;
