module.exports = {
  plugin: (schema, documents, config) => {
    return `
      Should have the Extension type: '${schema.getType('Extension')}'
    `;
  }
};
