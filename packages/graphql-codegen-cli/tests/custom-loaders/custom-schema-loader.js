const { buildSchema } = require('graphql');
const { readFileSync } = require('fs');

module.exports = function(schemaString, config) {
  global.CUSTOM_SCHEMA_LOADER_CALLED = true;

  return buildSchema(readFileSync(schemaString, { encoding: 'utf-8' }));
};
