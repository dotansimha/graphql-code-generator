module.exports = {
  plugin: () => {}, // Nothing to do
  transformDocuments: (_schema, documents, config) => {
    const newDocuments = [
      {
        document: {
          ...documents[0].document,
          definitions: [
            {
              ...documents[0].document.definitions[0],
              name: { kind: 'Name', value: config.queryName },
            },
          ],
        },
      },
    ];
    return newDocuments;
  },
};
