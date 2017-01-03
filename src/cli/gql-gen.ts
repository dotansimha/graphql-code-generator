#!/usr/bin/env node

import {initCLI, validateCliOptions, transformOptions, cliError} from './cli';
import {FileResult, Transform} from '../engine/transform-engine';
import * as fs from 'fs';

const options = initCLI(process.argv);
validateCliOptions(options);

transformOptions(options)
  .then<FileResult[]>(Transform)
  .then((generationResult: FileResult[]) => {
    generationResult.forEach((file: FileResult) => {
      if (file.isDev) {
        console.log(`================== ${file.path} ==================`);
        console.log(file.content);
      }
      else {
        fs.writeFileSync(file.path, file.content);
        console.log(`Generated file written to ${file.path}`);
      }
    });
  })
  .catch(cliError);
