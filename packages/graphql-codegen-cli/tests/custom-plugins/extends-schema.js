module.exports = {
  plugin: (schema, documents, config) => {
    return Object.keys(schema.getTypeMap()).join(',');
  },
  addToSchema: `type Extension { f: String }`
};
