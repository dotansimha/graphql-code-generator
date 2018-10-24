import { prepareSchemaForDocumentsOnly } from './prepare-documents-only';
import {
  Settings,
  FileOutput,
  SchemaTemplateContext,
  Document,
  debugLog,
  TemplateDocumentFileReference
} from 'graphql-codegen-core';
import { GeneratorConfig } from 'graphql-codegen-core';
import * as moment from 'moment';

export function generateSingleFile(
  compiledIndexTemplate: HandlebarsTemplateDelegate,
  executionSettings: Settings,
  config: GeneratorConfig,
  templateContext: SchemaTemplateContext,
  documents: Document,
  documentsFiles: TemplateDocumentFileReference[] = []
): FileOutput[] {
  debugLog(`[generateSingleFile] Compiling single file to: ${config.outFile}`);

  return [
    {
      filename: config.outFile,
      content: compiledIndexTemplate({
        documentsFiles,
        config: config.config,
        primitives: config.primitives,
        currentTime: moment().format(),
        ...(!executionSettings.generateSchema ? prepareSchemaForDocumentsOnly(templateContext) : templateContext),
        operations: documents.operations,
        fragments: documents.fragments,
        hasFragments: documents.hasFragments,
        hasOperations: documents.hasOperations
      })
    }
  ];
}
