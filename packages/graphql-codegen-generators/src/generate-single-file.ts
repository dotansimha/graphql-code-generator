import { prepareSchemaForDocumentsOnly } from './prepare-documents-only';
import { FileOutput, GeneratorConfig, Settings } from './types';
import { SchemaTemplateContext, Document, debugLog } from 'graphql-codegen-core';

export function generateSingleFile(compiledIndexTemplate: HandlebarsTemplateDelegate, executionSettings: Settings, config: GeneratorConfig, templateContext: SchemaTemplateContext, documents: Document): FileOutput[] {
  debugLog(`[generateSingleFile] Compiling single file to: ${config.outFile}`);

  return [
    {
      filename: config.outFile,
      content: compiledIndexTemplate({
        ...(!executionSettings.generateSchema) ? prepareSchemaForDocumentsOnly(templateContext) : templateContext,
        operations: documents.operations,
        fragments: documents.fragments,
        hasFragments: documents.hasFragments,
        hasOperations: documents.hasOperations,
      }),
    },
  ];
}
