#!/usr/bin/env node
import { runCli } from './cli.js';
import { cliError } from './utils/cli-error.js';

const [, , cmd] = process.argv;

runCli(cmd)
  .then(returnCode => {
    process.exit(returnCode);
  })
  .catch(error => {
    cliError(error);
  });
