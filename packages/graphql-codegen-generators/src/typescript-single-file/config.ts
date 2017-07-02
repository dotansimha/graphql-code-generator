import { GeneratorConfig } from '../types';
import * as mainTemplate from './template.handlebars';
import * as typeTemplate from './type.handlebars';
import * as schemaTemplate from './schema.handlebars';
import * as documentsTemplate from './documents.handlebars';

const config: GeneratorConfig = {
  singleFile: true,
  templates: {
    index: mainTemplate,
    type: typeTemplate,
    schema: schemaTemplate,
    documents: documentsTemplate,
  },
  flattenTypes: true,
  primitives: {
    String: 'string',
    Int: 'number',
    Float: 'number',
    Boolean: 'boolean',
    ID: 'string'
  },
  out: 'types.d.ts',
};

export default config;
