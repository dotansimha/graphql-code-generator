const { makeExecutableSchema } = require('graphql-tools');
const { readFileSync } = require('fs');

module.exports = function(schemaString, config) {
  global.CUSTOM_SCHEMA_LOADER_CALLED = true;

  return makeExecutableSchema({ typeDefs: readFileSync(schemaString, { encoding: 'utf-8' }) });
};
