const { extendSchema, parse } = require('graphql');

module.exports = {
  plugin: async (schema, documents, config) => {
    if (config.delay) {
      await new Promise(resolve => setTimeout(resolve, config.delay));
    }
    return {
      content: `// PRODUCER: ${config.addType || ''} ${config.addDocument || ''}`,
      schemaAst: config.addType
        ? extendSchema(schema, parse(`type ${config.addType} { id: ID }`))
        : undefined,
      documents: config.addDocument
        ? [
            ...documents,
            {
              location: `${config.addDocument}.graphql`,
              document: parse(`query ${config.addDocument} { f }`),
            },
          ]
        : undefined,
    };
  },
};
