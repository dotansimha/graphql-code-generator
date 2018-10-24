import {
  Settings,
  CustomProcessingFunction,
  debugLog,
  Document,
  EInputType,
  Fragment,
  GeneratorConfig,
  Operation,
  SchemaTemplateContext,
  FileOutput,
  isCustomProcessingFunction
} from 'graphql-codegen-core';
import { compile, registerPartial } from 'handlebars';
import { initHelpers } from './handlebars-extensions';
import { flattenTypes } from './flatten-types';
import { generateMultipleFiles } from './generate-multiple-files';
import { generateSingleFile } from './generate-single-file';
import { cleanTemplateComments } from './clean-template';
import { buildFilesArray } from './build-files-array';
import { TemplateDocumentFileReference } from 'graphql-codegen-core';

export const DEFAULT_SETTINGS: Settings = {
  generateSchema: true,
  generateDocuments: true
};

export async function compileTemplate(
  config: GeneratorConfig | CustomProcessingFunction,
  templateContext: SchemaTemplateContext,
  documents: Document[] = [],
  settings: Settings = DEFAULT_SETTINGS
): Promise<FileOutput[]> {
  const isExternalProcessingFunction = isCustomProcessingFunction(config);
  debugLog(`[compileTemplate] settings = `, settings);

  if (!config) {
    throw new Error(
      `compileTemplate requires a valid GeneratorConfig object or a custom output processing function (CustomProcessingFunction)!`
    );
  }

  const executionSettings = Object.assign(DEFAULT_SETTINGS, settings);
  let mergedDocuments: Document;
  let documentsFiles: TemplateDocumentFileReference[];

  if (!executionSettings.generateDocuments) {
    debugLog(`[compileTemplate] generateDocuments is false, ignoring documents...`);

    mergedDocuments = {
      fragments: [],
      operations: [],
      hasFragments: false,
      hasOperations: false
    };
    documentsFiles = [];
  } else {
    mergedDocuments = documents.reduce(
      (previousValue: Document, item: Document): Document => {
        const opArr = [...previousValue.operations, ...item.operations] as Operation[];
        const frArr = [...previousValue.fragments, ...item.fragments] as Fragment[];

        return {
          operations: opArr,
          fragments: frArr,
          hasFragments: frArr.length > 0,
          hasOperations: opArr.length > 0
        };
      },
      { hasFragments: false, hasOperations: false, operations: [], fragments: [] } as Document
    );

    debugLog(
      `[compileTemplate] all documents merged into single document, total of ${
        mergedDocuments.operations.length
      } operations and ${mergedDocuments.fragments.length} fragments`
    );

    documentsFiles = buildFilesArray(mergedDocuments);

    if (!isExternalProcessingFunction && (config as GeneratorConfig).flattenTypes) {
      debugLog(`[compileTemplate] flattenTypes is true, flattening all selection sets from all documents...`);

      mergedDocuments = flattenTypes(mergedDocuments);
    }
  }

  if (isExternalProcessingFunction) {
    debugLog(`[compileTemplate] starting to compile template with external processing function...`);

    let externalFn = config as CustomProcessingFunction;

    try {
      const result = await externalFn(templateContext, mergedDocuments, executionSettings);

      if (!Array.isArray(result)) {
        throw new Error('The result of external processing function must be an array of FileOutput!');
      }

      return result;
    } catch (e) {
      debugLog('[compileTemplate] external processing function has thrown an exception!', e);

      throw e;
    }
  } else {
    config = config as GeneratorConfig;

    if (!config.config) {
      config.config = {};
    }

    debugLog(`[compileTemplate] starting to compile template with input type = ${config.inputType}`);

    initHelpers(config, templateContext);
    const templates = config.templates;

    Object.keys(templates).forEach((templateName: string) => {
      debugLog(`[compileTemplate] register partial template ${templateName}`);

      const partialName = templateName.includes('.') ? templateName.split('.').reverse()[1] : templateName;
      registerPartial(partialName, templates[templateName].trim());
    });

    if (config.inputType === EInputType.SINGLE_FILE) {
      if (!templates['index']) {
        throw new Error(`Template 'index' is required when using inputType = SINGLE_FILE!`);
      }

      if (!config.outFile) {
        throw new Error('Config outFile is required when using inputType = SINGLE_FILE!');
      }

      debugLog(`[compileTemplate] Executing generateSingleFile...`);

      return generateSingleFile(
        compile(cleanTemplateComments(templates['index'])),
        executionSettings,
        config,
        templateContext,
        mergedDocuments,
        documentsFiles
      );
    } else if (config.inputType === EInputType.MULTIPLE_FILES || config.inputType === EInputType.PROJECT) {
      if (config.inputType === EInputType.MULTIPLE_FILES) {
        if (!config.filesExtension) {
          throw new Error('Config filesExtension is required when using inputType = MULTIPLE_FILES!');
        }
      }

      debugLog(`[compileTemplate] Executing generateMultipleFiles...`);

      const compiledTemplates = Object.keys(templates)
        .map(templateName => {
          debugLog(`[compileTemplate] Compiling template: ${templateName}...`);
          const compiledTemplate = compile(cleanTemplateComments(templates[templateName], templateName));

          return {
            key: templateName,
            value: compiledTemplate
          };
        })
        .reduce((prev, item) => {
          prev[item.key] = item.value;

          return prev;
        }, {}) as { [name: string]: Function[] };

      debugLog(`[compileTemplate] Templates names: `, Object.keys(compiledTemplates));

      return generateMultipleFiles(
        compiledTemplates,
        executionSettings,
        config,
        templateContext,
        mergedDocuments,
        documentsFiles
      );
    } else {
      throw new Error(`Invalid inputType specified: ${config.inputType}!`);
    }
  }
}
