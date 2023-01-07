module.exports = {
  plugin(schema, _documents, _config) {
    return `
      Should have the Extension type: '${schema.getType('Extension')}'
    `;
  },
};
