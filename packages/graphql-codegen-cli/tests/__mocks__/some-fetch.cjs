const {
  promises: { readFile },
} = require('fs');
const { join } = require('path');
const { buildSchema, graphql, introspectionQuery } = require('graphql');

module.exports = {
  someFetchFn: async () => {
    const schemaFile = await readFile(join(__dirname, '../test-documents/schema.graphql'), 'utf8');
    const schema = buildSchema(schemaFile);
    global.CUSTOM_FETCH_FN_CALLED = true;
    return {
      headers: {
        'content-type': 'application/json',
      },
      async text() {
        return JSON.stringify(await graphql(schema, introspectionQuery));
      },
      async json() {
        return JSON.parse(await this.text());
      },
    };
  },
};
