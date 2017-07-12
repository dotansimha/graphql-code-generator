#!/usr/bin/env node

import { initCLI, executeWithOptions, cliError } from './cli';
import { FileOutput } from 'graphql-codegen-generators';
import * as fs from 'fs';

const options = initCLI(process.argv);

executeWithOptions(options)
  .then((generationResult: FileOutput[]) => {
    generationResult.forEach((result: FileOutput) => {
      fs.writeFileSync(result.filename, result.content);
      console.log(`Generated file written to ${result.filename}`);
    });
  })
  .catch(cliError);
