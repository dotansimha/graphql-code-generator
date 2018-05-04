const map = {
  String: 'String',
  Boolean: 'Boolean',
  Int: 'Number',
  Float: 'Number'
};

function isPrimitive(field, options) {
  if (!field) {
    return options.inverse(this);
  } else {
    if (map[field]) {
      return options.fn(this);
    } else {
      return options.inverse(this);
    }
  }
}

export default isPrimitive;
