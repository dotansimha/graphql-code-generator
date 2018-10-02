import { Type } from 'graphql-codegen-core';

function ifNotRootType(this: any, type: Type, options: Handlebars.HelperOptions) {
  if (type.name !== 'Query' && type.name !== 'Mutation' && type.name !== 'Subscription') {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
}

export default ifNotRootType;
