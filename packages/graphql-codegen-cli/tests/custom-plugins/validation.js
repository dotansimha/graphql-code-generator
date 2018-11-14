module.exports = {
  plugin: (schema, documents, config) => {
    return 'plugin';
  },
  validate: () => {
    throw new Error('Invalid!');
  }
};
