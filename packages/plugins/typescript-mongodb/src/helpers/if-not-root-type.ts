import { Type } from 'graphql-codegen-core';

function ifNotRootType(this: any, type: Type, options: Handlebars.HelperOptions) {
  // KAMIL: we should get the schema from options and use schema.getQueryType().name and so on
  // sometimes people use root schema object to define root types.
  if (type.name !== 'Query' && type.name !== 'Mutation' && type.name !== 'Subscription') {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
}

export default ifNotRootType;
