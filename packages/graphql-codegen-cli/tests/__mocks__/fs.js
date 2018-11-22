const path = require('path');
const fs = jest.genMockFromModule('fs');

// This is a custom function that our tests can use during setup to specify
// what the files on the "mock" filesystem should look like when any of the
// `fs` APIs are used.
let mockFiles = {};

function __setMockFiles(file, content) {
  mockFiles[file] = content;
}

function __resetMockFiles() {
  mockFiles = {};
}

function existsSync(path) {
  const exists = mockFiles[path] !== undefined;

  return exists;
}

function readFileSync(path) {
  return mockFiles[path] || undefined;
}

fs.__setMockFiles = __setMockFiles;
fs.__resetMockFiles = __resetMockFiles;
fs.existsSync = existsSync;
fs.readFileSync = readFileSync;

module.exports = fs;
