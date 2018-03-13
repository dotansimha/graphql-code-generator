#!/usr/bin/env node

import * as fs from 'fs';
import { initCLI, executeWithOptions, cliError } from './cli';
import { FileOutput } from 'graphql-codegen-compiler';
import { debugLog } from 'graphql-codegen-core';
import { fileExists } from './utils/file-exists';
import { prettify } from './utils/prettier';

const options = initCLI(process.argv);

debugLog(`Started CLI with options: `, options);

executeWithOptions(options)
  .then((generationResult: FileOutput[]) => {
    debugLog(`Generation result contains total of ${generationResult.length} files...`);

    if (process.env.VERBOSE !== undefined) {
      console.log(`Generation result is: `, generationResult);
    }

    generationResult.forEach(async (result: FileOutput) => {
      if (!options.overwrite && fileExists(result.filename)) {
        console.log(`Generated file skipped (already exists, and no-overwrite flag is ON): ${result.filename}`);

        return;
      }

      const content = result.content.trim();

      if (content.length === 0) {
        console.log(`Generated file skipped (empty): ${result.filename}`);

        return;
      }

      fs.writeFileSync(result.filename, await prettify(result.filename, result.content));
      console.log(`Generated file written to ${result.filename}`);
    });
  })
  .catch(cliError);
