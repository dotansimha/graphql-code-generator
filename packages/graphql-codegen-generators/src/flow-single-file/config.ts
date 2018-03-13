import * as index from './template.handlebars';
import * as type from './type.handlebars';
import * as schema from './schema.handlebars';
import * as documents from './documents.handlebars';
import * as selectionSet from './selection-set.handlebars';
import { EInputType, GeneratorConfig } from '../types';

const config: GeneratorConfig = {
  inputType: EInputType.SINGLE_FILE,
  templates: {
    index,
    type,
    schema,
    documents,
    selectionSet,
  },
  flattenTypes: true,
  primitives: {
    String: 'string',
    Int: 'number',
    Float: 'number',
    Boolean: 'boolean',
    ID: 'string'
  },
  outFile: 'schemaTypes.js',
};

export default config;
