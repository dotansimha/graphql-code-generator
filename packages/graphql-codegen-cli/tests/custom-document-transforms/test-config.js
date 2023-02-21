module.exports = {
  transform: ({ documents, config }) => {
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
