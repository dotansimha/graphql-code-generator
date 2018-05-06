#!/usr/bin/env node

import { initCLI, cliError } from './codegen';
import { generate } from './generate';

const options = initCLI(process.argv);

generate(options).catch(cliError);
