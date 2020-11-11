const { buildSchema } = require('graphql');
const { readFileSync } = require('fs');
const { join } = require('path');

module.exports = function(schemaString, config) {
  global.CUSTOM_SCHEMA_LOADER_CALLED = true;

  return buildSchema(readFileSync(join(process.cwd(), schemaString), { encoding: 'utf-8' }));
};
