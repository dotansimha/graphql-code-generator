const { parse } = require('graphql');
const { readFileSync } = require('fs');
const { join } = require('path');

module.exports = function (config, schema) {
  global.CUSTOM_DOCUMENT_LOADER_CALLED = true;

  const file = readFileSync(join(process.cwd(), config.loadeFilesFrom), { encoding: 'utf-8' });
  const parsed = parse(file);
  return { document: parsed, location: config.loadeFilesFrom, rawSDL: file };
};
