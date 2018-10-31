#!/usr/bin/env node

import { cliError, initCLI, createConfigFromOldCli } from './old-cli-config';
import { generate } from './generate-and-save';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { Types } from 'graphql-codegen-core';
import { parseConfigFile } from './yml';

const ymlPath = join(process.cwd(), './codegen.yml');
const jsonPath = join(process.cwd(), './codegen.json');
let config: Types.Config;

if (existsSync(ymlPath)) {
  config = parseConfigFile(readFileSync(ymlPath, 'utf-8'));
} else if (existsSync(jsonPath)) {
  config = JSON.parse(readFileSync(jsonPath, 'utf-8'));
} else {
  config = createConfigFromOldCli(initCLI(process.argv));
}

generate(config)
  .then(() => {})
  .catch(cliError);
