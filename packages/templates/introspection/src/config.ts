import { EInputType, GeneratorConfig } from 'graphql-codegen-core';
import * as index from './template.handlebars';
import { toIntrospection } from './helpers/to-introspection';

export const config: GeneratorConfig = {
  inputType: EInputType.SINGLE_FILE,
  flattenTypes: true,
  templates: {
    index
  },
  primitives: {
    String: 'string',
    Int: 'number',
    Float: 'number',
    Boolean: 'boolean',
    ID: 'string'
  },
  customHelpers: {
    toIntrospection
  },
  outFile: 'graphql.schema.json'
};
