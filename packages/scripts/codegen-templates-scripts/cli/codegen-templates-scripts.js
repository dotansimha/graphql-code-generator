#!/usr/bin/env node

const program = require('commander');
const pack = require('../package.json');

program.version(pack.version);

program
  .command('init', 'Initialize a new template boilerplate in the current directory')
  .command('build', 'Executes build using Webpack and Handlebars')
  .command('test', 'Executes unit tests using Jest');

program.parse(process.argv);
