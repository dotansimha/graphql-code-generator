const { readFileSync } = require('fs');

module.exports = {
  someFetchFn: async (url, options) => {
    const schemaFile = readFileSync('../test-documents/schema.graphql', 'utf8');
    const schema = buildSchema(schemaFile);
    return {
      json() {
        CUSTOM_FETCH_FN_CALLED = true;
        return graphql(schema, getIntrospectionQuery()).then(result => result.data);
      },
    };
  },
};
