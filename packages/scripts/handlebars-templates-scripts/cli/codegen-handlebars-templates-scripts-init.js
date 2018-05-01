#!/usr/bin/env node

const program = require('commander');
const copyfiles = require('copyfiles');
const path = require('path');
const fs = require('fs');
const pack = require('../package.json');

program.option('-o, --overwrite', 'Overwrite existing files');
program.parse(process.argv);

const newProjectDir = process.cwd();
const boilerplatePath = path.join(__dirname, '../boilerplate');

console.log('Creating a new GraphQL Code Generator template project under: ' + newProjectDir);

copyfiles(
  [boilerplatePath + '/**/*', newProjectDir],
  { all: true, soft: !program.overwrite, up: boilerplatePath.match(/\//g).length + 1 },
  function(err, result) {
    const packageFilePath = path.join(newProjectDir, './package.json');
    const content = JSON.parse(fs.readFileSync(packageFilePath));

    if (content.name === 'my-codegen-template') {
      content.name = path.basename(newProjectDir);
    }

    content.devDependencies = content.devDependencies || {};
    content.devDependencies[pack.name] = pack.version;
    content.devDependencies['graphql-codegen-core'] = pack.version;
    fs.writeFileSync(packageFilePath, JSON.stringify(content, null, 2));
  }
);
