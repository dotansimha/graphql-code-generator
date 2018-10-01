import { Field } from 'graphql-codegen-core';

const map = {
  String: 'String',
  Boolean: 'Boolean',
  Int: 'Number',
  Float: 'Number'
};

function isPrimitive(this: any, field: Field | keyof typeof map, options: Handlebars.HelperOptions) {
  if (!field) {
    return options.inverse(this);
  } else {
    if (map[field as keyof typeof map]) {
      return options.fn(this);
    } else {
      return options.inverse(this);
    }
  }
}

export default isPrimitive;
