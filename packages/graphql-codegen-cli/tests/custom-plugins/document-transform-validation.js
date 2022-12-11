module.exports = {
  plugin: () => {}, // Nothing to do
  transformDocuments: (_schema, documents) => {
    return documents;
  },
  validateBeforeTransformDocuments: () => {
    throw new Error('Invalid!');
  },
};
