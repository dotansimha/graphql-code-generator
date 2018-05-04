function isArray(field, options) {
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
