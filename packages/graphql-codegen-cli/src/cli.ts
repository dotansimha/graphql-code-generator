#!/usr/bin/env node

import * as commander from 'commander';
import { CLIOptions } from './cli-options';
import { cliError } from './codegen';
import { generate } from './generate';
import { init } from './wizard';

function collect<T>(val: T, memo: T[]) {
  memo.push(val);

  return memo;
}

commander
  .command('init')
  .description('Wizard tool to setup GraphQL Code Generator')
  .action(() => {
    init();
  });

commander
  .command('generate [options]')
  .option(
    '-s, --schema <path>',
    'Path to GraphQL schema: local JSON file, GraphQL endpoint, local file that exports GraphQLSchema/AST/JSON'
  )
  .option(
    '-cs, --clientSchema <path>',
    'Path to GraphQL client schema: local JSON file, local file that exports GraphQLSchema/AST/JSON'
  )
  .option(
    '-h, --header [header]',
    'Header to add to the introspection HTTP request when using --url/--schema with url',
    collect,
    []
  )
  .option(
    '-t, --template <template-name>',
    'Language/platform name templates, or a name of NPM modules that `export default` GqlGenConfig object'
  )
  .option('-p, --project <project-path>', 'Project path(s) to scan for custom template files')
  .option('--config <json-file>', 'Codegen configuration file, defaults to: ./gql-gen.json')
  .option('-m, --skip-schema', 'Generates only client side documents, without server side schema types')
  .option('-c, --skip-documents', 'Generates only server side schema types, without client side documents')
  .option('-o, --out <path>', 'Output file(s) path', String, './')
  .option('-r, --require [require]', 'module to preload (option can be repeated)', collect, [])
  .option('-ow, --no-overwrite', 'Skip file writing if the output file(s) already exists in path')
  .option('-w, --watch', 'Watch for changes and execute generation automatically')
  .option('--silent', 'Does not print anything to the console')
  .option('-ms, --merge-schema <merge-logic>', 'Merge schemas with custom logic')
  .arguments('<options> [documents...]')
  .action(async (options: CLIOptions) => {
    // tslint:disable-next-line
    console.log('default');
    generate(options).catch(cliError);
  });

const subCmd: string | undefined = process.argv[2];
const cmds = (commander.commands as any[]).map(c => {
  return c._name;
});

if (cmds.indexOf(subCmd) === -1) {
  commander.help(info => `\nCommand "${process.argv.slice(2).join(' ') || ''}" not found\n\n${info}`);
}

commander.parse(process.argv);
