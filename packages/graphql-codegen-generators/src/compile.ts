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

export function compileTemplate(config: GeneratorConfig, templateContext: SchemaTemplateContext, documents: Document[] = [], settings: Settings = DEFAULT_SETTINGS): FileOutput[] {
  const executionSettings = Object.assign(DEFAULT_SETTINGS, settings);
  initHelpers();

  registerHelper('toPrimitive', function (type) {
    return config.primitives[type] || type || '';
  });

  Object.keys(config.templates).forEach((templateName: string) => {
    registerPartial(templateName, config.templates[templateName]);
  });

  const templates = config.templates;
  const compiledMainTemplate = compile(templates['index']);

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

  return [
    {
      filename: config.out,
      content: compiledMainTemplate({
        ...(!executionSettings.generateSchema) ? prepareSchemaForDocumentsOnly(templateContext) : templateContext,
        operations: mergedDocuments.operations,
        fragments: mergedDocuments.fragments,
      }),
    },
  ];
}
