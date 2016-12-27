#!/usr/bin/env node

import {initCLI, validateCliOptions, transformOptions, cliError} from './cli';
import {FileResult, Transform, TransformedOptions} from './transform-engine';
import {loadSchema} from './scheme-loader';
import {prepareCodegen} from './codegen';
import {loadDocumentsSources} from './document-loader';
import {compileTemplate, loadFromPath} from './template-loader';
import * as fs from 'fs';
import * as path from 'path';
import * as mkdirp from 'mkdirp';
import {Model, CodegenDocument} from './interfaces';
import {
  initHelpers, initPartials, PartialDefinition, HelperDefinition,
  initTemplateHelpers
} from './handlebars-helpers';

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
