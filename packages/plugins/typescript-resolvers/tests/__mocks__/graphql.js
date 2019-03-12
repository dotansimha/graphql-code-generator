jest.genMockFromModule('graphql');
require = require('esm')(module, { force: true });
module.exports = require('graphql/index.js');
