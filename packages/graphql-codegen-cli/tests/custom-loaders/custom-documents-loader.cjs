const { parse } = require('graphql');
const { readFileSync } = require('fs');
const { join } = require('path');

module.exports = function (docString, _config) {
  global.CUSTOM_DOCUMENT_LOADER_CALLED = true;

  return parse(readFileSync(join(process.cwd(), docString), 'utf8'));
};
