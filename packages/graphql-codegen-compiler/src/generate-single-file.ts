import { prepareSchemaForDocumentsOnly } from './prepare-documents-only';
import { FileOutput, Settings } from './types';
import { SchemaTemplateContext, Document, debugLog } from 'graphql-codegen-core';
import { GeneratorConfig } from 'graphql-codegen-generators';
import * as moment from 'moment';

export function generateSingleFile(compiledIndexTemplate: HandlebarsTemplateDelegate, executionSettings: Settings, config: GeneratorConfig, templateContext: SchemaTemplateContext, documents: Document): FileOutput[] {
  debugLog(`[generateSingleFile] Compiling single file to: ${config.outFile}`);

  return [
    {
      filename: config.outFile,
      content: compiledIndexTemplate({
        config: config.config,
        currentTime: moment().format(),
        ...(!executionSettings.generateSchema) ? prepareSchemaForDocumentsOnly(templateContext) : templateContext,
        operations: documents.operations,
        fragments: documents.fragments,
        hasFragments: documents.hasFragments,
        hasOperations: documents.hasOperations,
      }),
    },
  ];
}
