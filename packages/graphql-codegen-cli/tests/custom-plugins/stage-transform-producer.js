const { extendSchema, parse, printSchema } = require('graphql');

module.exports = {
  plugin: async (schema, documents, config) => {
    if (config.delay) {
      await new Promise(resolve => setTimeout(resolve, config.delay));
    }
    const transformedSchema = config.addType
      ? parse(printSchema(extendSchema(schema, parse(`type ${config.addType} { id: ID }`))))
      : undefined;
    return {
      content: `// PRODUCER: ${config.addType || ''} ${config.addDocument || ''}`,
      // `returnSchemaAst` returns the transformed schema under `schemaAst`, which later stages ignore
      [config.returnSchemaAst ? 'schemaAst' : 'schema']: transformedSchema,
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
