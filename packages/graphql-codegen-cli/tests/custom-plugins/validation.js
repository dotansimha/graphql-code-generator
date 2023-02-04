module.exports = {
  plugin(_schema, _documents, _config) {
    return 'plugin';
  },
  validate() {
    throw new Error('Invalid!');
  },
};
