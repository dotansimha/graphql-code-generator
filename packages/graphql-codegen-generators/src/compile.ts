import { GeneratorConfig, FileOutput, Settings } from './types';
import { Document, Fragment, Operation, SchemaTemplateContext } from 'graphql-codegen-core';
import { compile, registerPartial, registerHelper } from 'handlebars';
import { initHelpers } from './handlebars-extensions';
import { flattenTypes } from './flatten-types';

export const DEFAULT_SETTINGS: Settings = {
  generateSchema: true,
  generateDocuments: true,
  verbose: !!process.env['VERBOSE'],
};

function prepareSchemaForDocumentsOnly(templateContext: SchemaTemplateContext): SchemaTemplateContext {
  let copy = Object.assign({}, templateContext);

  copy.interfaces = [];
  copy.hasInterfaces = false;
  copy.types = [];
  copy.hasTypes = false;
  copy.hasUnions = false;
  copy.unions = [];

  return copy;
}

function generateSingleFile(compiledIndexTemplate: HandlebarsTemplateDelegate, executionSettings: Settings, config: GeneratorConfig, templateContext: SchemaTemplateContext, documents: Document): FileOutput[] {
  return [
    {
      filename: config.out,
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

export function compileTemplate(config: GeneratorConfig, templateContext: SchemaTemplateContext, documents: Document[] = [], settings: Settings = DEFAULT_SETTINGS): FileOutput[] {
  initHelpers(config.primitives);
  const executionSettings = Object.assign(DEFAULT_SETTINGS, settings);
  const templates = config.templates;

  Object.keys(templates).forEach((templateName: string) => {
    registerPartial(templateName, templates[templateName]);
  });

  let mergedDocuments: Document;

  if (!executionSettings.generateDocuments) {
    mergedDocuments = {
      fragments: [],
      operations: [],
      hasFragments: false,
      hasOperations: false,
    };
  } else {
    mergedDocuments = documents.reduce((previousValue: Document, item: Document): Document => {
      const opArr = [...previousValue.operations, ...item.operations] as Operation[];
      const frArr = [...previousValue.fragments, ...item.fragments] as Fragment[];

      return {
        operations: opArr,
        fragments: frArr,
        hasFragments: frArr.length > 0,
        hasOperations: opArr.length > 0,
      }
    }, { hasFragments: false, hasOperations: false, operations: [], fragments: [] } as Document);

    if (config.flattenTypes) {
      mergedDocuments = flattenTypes(mergedDocuments);
    }
  }

  if (config.singleFile) {
    if (!templates['index']) {
      throw new Error(`Template 'index' is required when using singleFile = true!`);
    }

    return generateSingleFile(
      compile(templates['index']),
      executionSettings,
      config,
      templateContext,
      mergedDocuments,
    );
  } else if (!config.singleFile) {
    if (!templates['type']) {
      throw new Error(`Templates 'type' are required when using singleFile = false!`);
    }

  } else {
    return [];
  }
}
