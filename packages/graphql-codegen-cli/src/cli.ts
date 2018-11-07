#!/usr/bin/env node

import { generate } from './generate-and-save';
import { cliError } from './utils/cli-error';
import { createConfig, getCustomConfig } from './config';

generate(createConfig(getCustomConfig()))
  .then(() => {})
  .catch(cliError);
