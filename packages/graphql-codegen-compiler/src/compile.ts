import { FileOutput, Settings } from './types';
import { debugLog, Document, Fragment, Operation, SchemaTemplateContext } from 'graphql-codegen-core';
import { GeneratorConfig, EInputType } from 'graphql-codegen-generators';
import { compile, registerPartial } from 'handlebars';
import { initHelpers } from './handlebars-extensions';
import { flattenTypes } from './flatten-types';
import { generateMultipleFiles } from './generate-multiple-files';
import { generateSingleFile } from './generate-single-file';
import { cleanTemplateComments } from './clean-template';

export const DEFAULT_SETTINGS: Settings = {
  generateSchema: true,
  generateDocuments: true
};

export function compileTemplate(
  config: GeneratorConfig,
  templateContext: SchemaTemplateContext,
  documents: Document[] = [],
  settings: Settings = DEFAULT_SETTINGS
): FileOutput[] {
  if (!config) {
    throw new Error(`compileTemplate requires a valid GeneratorConfig object!`);
  }

  debugLog(`[compileTemplate] starting to compile template with input type = ${config.inputType}`);
  debugLog(`[compileTemplate] settings = `, settings);

  initHelpers(config, templateContext);
  const executionSettings = Object.assign(DEFAULT_SETTINGS, settings);
  const templates = config.templates;

  Object.keys(templates).forEach((templateName: string) => {
    debugLog(`[compileTemplate] register partial template ${templateName}`);

    registerPartial(templateName, templates[templateName].trim());
  });

  let mergedDocuments: Document;

  if (!executionSettings.generateDocuments) {
    debugLog(`[compileTemplate] generateDocuments is false, ignoring documents...`);

    mergedDocuments = {
      fragments: [],
      operations: [],
      hasFragments: false,
      hasOperations: false
    };
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

    if (config.flattenTypes) {
      debugLog(`[compileTemplate] flattenTypes is true, flattening all selection sets from all documents...`);

      mergedDocuments = flattenTypes(mergedDocuments);
    }
  }

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
      mergedDocuments
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

    return generateMultipleFiles(compiledTemplates, executionSettings, config, templateContext, mergedDocuments);
  } else {
    throw new Error(`Invalid inputType specified: ${config.inputType}!`);
  }
}
