import { Field } from 'graphql-codegen-core';

export const isPrimitive = map =>
  function(this: any, field: Field | keyof typeof map, options: Handlebars.HelperOptions) {
    if (!field) {
      return options.inverse(this);
    } else {
      if (map[field as keyof typeof map]) {
        return options.fn(this);
      } else {
        return options.inverse(this);
      }
    }
  };
