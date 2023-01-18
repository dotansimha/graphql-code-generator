module.exports = {
  plugin(schema, _documents, _config) {
    return Object.keys(schema.getTypeMap()).join(', ');
  },
  addToSchema: c => `type ${c.test} { f: String }`,
};
