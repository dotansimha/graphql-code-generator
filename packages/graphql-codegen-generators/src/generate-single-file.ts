import { prepareSchemaForDocumentsOnly } from './prepare-documents-only';
import { FileOutput, GeneratorConfig, Settings } from './types';
import { SchemaTemplateContext, Document } from 'graphql-codegen-core';

export function generateSingleFile(compiledIndexTemplate: HandlebarsTemplateDelegate, executionSettings: Settings, config: GeneratorConfig, templateContext: SchemaTemplateContext, documents: Document): FileOutput[] {
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
