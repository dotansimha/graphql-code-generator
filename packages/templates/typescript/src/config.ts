import * as index from './template.handlebars';
import * as type from './type.handlebars';
import * as schema from './schema.handlebars';
import * as documents from './documents.handlebars';
import * as selectionSet from './selection-set.handlebars';
import * as fragments from './fragments.handlebars';
import { EInputType, GeneratorConfig } from 'graphql-codegen-core';
import { getType } from './helpers/get-type';

export const config: GeneratorConfig = {
  inputType: EInputType.SINGLE_FILE,
  templates: {
    index,
    type,
    schema,
    documents,
    selectionSet,
    fragments
  },
  flattenTypes: true,
  primitives: {
    String: 'string',
    Int: 'number',
    Float: 'number',
    Boolean: 'boolean',
    ID: 'string'
  },
  customHelpers: {
    convertedType: getType
  },
  outFile: 'types.ts'
};
