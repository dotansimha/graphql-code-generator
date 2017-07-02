import { Config, FileOutput } from './types';
import { Document, Fragment, Operation, SchemaTemplateContext } from 'graphql-codegen-core';
import { compile, registerPartial, registerHelper } from 'handlebars';
import { initHelpers } from './handlebars-extensions';
import { flattenTypes } from './flatten-types';

export function compileTemplate(config: Config, templateContext: SchemaTemplateContext, documents: Document[] = []): FileOutput[] {
  initHelpers();

  registerHelper('toPrimitive', function (type) {
    return config.primitives[type] || type || '';
  });

  Object.keys(config.templates).map(templateName => ({
    name: templateName,
    content: config.templates[templateName]
  })).forEach(({ name, content }) => {
    registerPartial(name, content);
  });

  const templates = config.templates;
  const compiledMainTemplate = compile(templates['index']);
  let mergedDocuments: Document = documents.reduce((previousValue: Document, item: Document): Document => {
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

  return [
    {
      filename: config.out,
      content: compiledMainTemplate({
        ...templateContext,
        operations: mergedDocuments.operations,
        fragments: mergedDocuments.fragments,
      }),
    },
  ];
}
