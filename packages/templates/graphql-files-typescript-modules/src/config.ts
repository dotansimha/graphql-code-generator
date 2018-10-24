import * as index from './template.handlebars';
import { EInputType, GeneratorConfig } from 'graphql-codegen-core';

export const config: GeneratorConfig = {
  inputType: EInputType.SINGLE_FILE, // The type of the templates input (and output): either one file or multiple files
  templates: {
    // declare here your templates and partials
    index
  },
  flattenTypes: true,
  customHelpers: {
    filenameToModuleName: (filePath: string) => (filePath.charAt(0) === '.' ? `*${filePath.substr(1)}` : filePath)
  },
  primitives: {
    // Declare your primitives map (GraphQL built-in types to your language types)
    String: 'string',
    Int: 'number',
    Float: 'number',
    Boolean: 'boolean',
    ID: 'string'
  },
  outFile: 'graphql-modules-declaration.d.ts' // default output file name
};
