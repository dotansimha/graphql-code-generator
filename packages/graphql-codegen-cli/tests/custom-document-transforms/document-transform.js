module.exports = {
  transform: ({ documents }) => {
    const newDocuments = [
      {
        document: {
          ...documents[0].document,
          definitions: [
            {
              ...documents[0].document.definitions[0],
              name: { kind: 'Name', value: 'bar' },
            },
          ],
        },
      },
    ];
    return newDocuments;
  },
};
