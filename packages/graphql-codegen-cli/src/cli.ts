#!/usr/bin/env node

import { generate } from './generate-and-save';
import { init } from './init';
import { cliError } from './utils/cli-error';
import { createConfig } from './config';

const [, , cmd] = process.argv;

switch (cmd) {
  case 'init':
    init()
      .then(() => {
        process.exit(0);
      })
      .catch(cliError);
    break;

  default:
    createConfig().then(config => {
      return generate(config)
        .then(() => {
          process.exit(0);
        })
        .catch(cliError);
    });
}
