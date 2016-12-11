#!/usr/bin/env node

import {initCLI, validateCliOptions, transformOptions, TransformedCliOptions, cliError} from './cli';
import {loadSchema} from './scheme-loader';
import {prepareCodegen} from './codegen';
import {loadDocumentsSources} from './document-loader';
import {generateCode} from './generator';
import * as fs from 'fs';
import * as path from 'path';

const options = initCLI(process.argv);
validateCliOptions(options);

transformOptions(options)
  .then<any>((transformedOptions: TransformedCliOptions) => {
    const schema = loadSchema(transformedOptions.introspection);
    const documents = transformedOptions.documents;
    const codegen = prepareCodegen(schema, loadDocumentsSources(documents));

    return {
      content: generateCode(codegen, transformedOptions.template.templateFile),
      path: path.resolve(transformedOptions.outPath)
    };
  })
  .then((generationResult) => {
    fs.writeFileSync(generationResult.path, generationResult.content);
  })
  .catch(cliError);
