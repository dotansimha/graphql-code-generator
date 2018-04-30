import * as index from './template.handlebars';
import * as schema from './schema.handlebars';
import * as documents from './documents.handlebars';
import { EInputType, GeneratorConfig } from 'graphql-codegen-core';

export const config: GeneratorConfig = {
  inputType: EInputType.SINGLE_FILE, // The type of the templates input (and output): either one file or multiple files
  templates: {
    // declare here your templates and partials
    index,
    schema,
    documents
  },
  flattenTypes: true,
  primitives: {
    // Declare your primitives map (GraphQL built-in types to your language types)
    String: 'string',
    Int: 'number',
    Float: 'number',
    Boolean: 'boolean',
    ID: 'string'
  },
  outFile: 'types.ts' // default output file name
};
