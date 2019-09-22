#!/usr/bin/env node

import { runCli } from './cli';
import { cliError } from './utils/cli-error';

const [, , cmd] = process.argv;

runCli(cmd)
  .then(() => {
    process.exit(0);
  })
  .catch(error => {
    cliError(error);
  });
