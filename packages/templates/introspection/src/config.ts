import { EInputType, GeneratorConfig } from 'graphql-codegen-core';
import * as index from './template.handlebars';
import { toJSON } from './helpers/to-json';

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
    toJSON
  },
  outFile: 'graphql.schema.json'
};
