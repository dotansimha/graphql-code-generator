module.exports = {
  plugin(schema, _documents, _config) {
    return Object.keys(schema.getTypeMap()).join(',');
  },
  addToSchema: `type Extension { f: String }`,
};
