module.exports = {
  plugin: () => {}, // Nothing to do
  transformDocuments: (_schema, documents) => {
    throw new Error('Something Wrong!');
  },
};
