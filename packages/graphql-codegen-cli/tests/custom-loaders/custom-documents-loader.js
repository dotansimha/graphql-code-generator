const { parse } = require('graphql');
const { readFileSync } = require('fs');

module.exports = function(docString, config) {
  global.CUSTOM_DOCUMENT_LOADER_CALLED = true;

  return parse(readFileSync(docString, { encoding: 'utf-8' }));
};
