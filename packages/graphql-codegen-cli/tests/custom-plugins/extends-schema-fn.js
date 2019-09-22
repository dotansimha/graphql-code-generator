module.exports = {
  plugin: (schema, documents, config) => {
    return Object.keys(schema.getTypeMap()).join(', ');
  },
  addToSchema: c => `type ${c.test} { f: String }`,
};
