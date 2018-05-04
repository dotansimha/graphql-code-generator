function ifNotRootType(type, options) {
  if (type.name !== 'Query' && type.name !== 'Mutation' && type.name !== 'Subscription') {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
}

export default ifNotRootType;
