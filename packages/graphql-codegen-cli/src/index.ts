#!/usr/bin/env node

import { initCLI, executeWithOptions, cliError } from './cli';

const options = initCLI(process.argv);

executeWithOptions(options)
  .then(console.log)
  .catch(cliError);
