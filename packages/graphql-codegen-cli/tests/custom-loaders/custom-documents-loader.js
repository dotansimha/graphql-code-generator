const { parse } = require('graphql');
const { readFileSync } = require('fs');
const { join } = require('path');

module.exports = function (docString, config) {
  global.CUSTOM_DOCUMENT_LOADER_CALLED = true;

  return parse(readFileSync(join(process.cwd(), docString), { encoding: 'utf-8' }));
};
