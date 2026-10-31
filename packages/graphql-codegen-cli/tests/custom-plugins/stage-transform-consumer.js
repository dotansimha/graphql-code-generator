module.exports = {
  plugin: (schema, documents) => {
    const typeNames = Object.keys(schema.getTypeMap())
      .filter(name => !name.startsWith('__'))
      .sort();
    const locations = documents.map(document => document.location);
    return `// CONSUMER: types=${typeNames.join(',')} documents=${locations.join(',')}`;
  },
};
