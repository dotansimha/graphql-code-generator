#!/usr/bin/env node

import {initCLI, validateCliOptions, transformOptions, TransformedCliOptions, cliError} from './cli';
import {loadSchema} from './scheme-loader';
import {prepareCodegen} from './codegen';
import {loadDocumentsSources} from './document-loader';
import {generateCode} from './generator';
import * as fs from 'fs';
import * as path from 'path';
import * as mkdirp from 'mkdirp';
import {Model, CodegenDocument} from './interfaces';

const options = initCLI(process.argv);
validateCliOptions(options);

export interface FileResult {
  path: string;
  content: string;
}

transformOptions(options)
  .then<FileResult[]>((transformedOptions: TransformedCliOptions) => {
    const schema = loadSchema(transformedOptions.introspection);
    const documents = transformedOptions.documents;
    const codegen = prepareCodegen(schema, loadDocumentsSources(documents));
    const templateConfig = transformedOptions.template.config;
    const strategy = templateConfig.strategy || 'SINGLE_FILE';
    const baseOutPath = path.basename(transformedOptions.outPath);

    if (strategy === 'SINGLE_FILE') {
      if (baseOutPath.indexOf('.') === -1) {
        throw `Generator '${transformedOptions.template.language}' uses single-file strategy! Please specify a filename using --out flag!`;
      }

      const templatePath = path.resolve(transformedOptions.template.config.basePath, transformedOptions.template.config.template);

      return [{
        content: generateCode(codegen, templatePath),
        path: path.resolve(transformedOptions.outPath)
      }];
    }
    else if (strategy === 'MULTIPLE_FILES') {
      if (baseOutPath.indexOf('.') > -1) {
        throw `Generator '${transformedOptions.template.language}' uses multiple-files strategy! Please specify a directory using --out flag!`;
      }

      let resultsArr: FileResult[] = [];
      const filesExtension = transformedOptions.template.config.filesExtension;
      const templates = transformedOptions.template.config.templates;
      const outPath = path.resolve(transformedOptions.outPath);
      mkdirp.sync(outPath);

      Object.keys(templates).forEach((templateName: string) => {
        const templatePath = path.resolve(transformedOptions.template.config.basePath, templates[templateName]);

        if (templateName === 'model') {
          codegen.models.forEach((model: Model) => {
            resultsArr.push({
              content: generateCode(model, templatePath),
              path: path.resolve(transformedOptions.outPath, model.name + '.model.' + filesExtension)
            });
          });
        }

        if (templateName === 'document') {
          codegen.documents.forEach((document: CodegenDocument) => {
            resultsArr.push({
              content: generateCode(document, templatePath),
              path: path.resolve(transformedOptions.outPath, document.name + '.document.' + filesExtension)
            });
          });
        }
      });

      resultsArr = resultsArr.filter(item => item.content.length > 0);

      if (templates['index']) {
        const directoryPath = path.resolve(transformedOptions.outPath);
        const indexOutPath = path.resolve(directoryPath, 'index.' + filesExtension);
        const templatePath = path.resolve(transformedOptions.template.config.basePath, templates['index']);

        resultsArr.push({
          content: generateCode({files: resultsArr.map(item => {
            return {
              fileName: path.basename(item.path, '.' + filesExtension),
              fullPath: item.path,
              extension: filesExtension,
              directory: directoryPath
            };
          })}, templatePath),
          path: indexOutPath
        });
      }

      return resultsArr;
    }
    else {
      throw `Unknown strategy (${strategy}) specified in language template ${transformedOptions.template.language}`;
    }
  })
  .then((generationResult: FileResult[]) => {
    generationResult.forEach((file: FileResult) => {
      fs.writeFileSync(file.path, file.content);
      console.log(`Generated file written to ${file.path}`);
    });
  })
  .catch(cliError);
