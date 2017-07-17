import { SchemaTemplateContext } from 'graphql-codegen-core';

export function prepareSchemaForDocumentsOnly(templateContext: SchemaTemplateContext): SchemaTemplateContext {
  let copy = Object.assign({}, templateContext);

  copy.interfaces = [];
  copy.unions = [];
  copy.types = [];
  copy.hasInterfaces = false;
  copy.hasUnions = false;
  copy.hasTypes = false;

  return copy;
}
