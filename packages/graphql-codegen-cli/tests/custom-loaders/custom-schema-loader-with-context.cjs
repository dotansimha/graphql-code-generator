const { buildSchema } = require('graphql');
const { readFileSync } = require('fs');
const { join } = require('path');

module.exports = function (schemaString, config) {
  config.pluginContext.hello = 'world';
  return buildSchema(readFileSync(join(process.cwd(), schemaString), 'utf8'));
};
