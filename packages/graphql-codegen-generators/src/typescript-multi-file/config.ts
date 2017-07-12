import { EInputType, GeneratorConfig } from '../types';
import * as type from './type.handlebars';
import * as enumTemplate from './enum.handlebars';

const config: GeneratorConfig = {
  inputType: EInputType.MULTIPLE_FILES,
  templates: {
    type,
    inputType: type,
    'enum': enumTemplate,
    'interface': type,
  },
  flattenTypes: true,
  primitives: {
    String: 'string',
    Int: 'number',
    Float: 'number',
    Boolean: 'boolean',
    ID: 'string'
  },
  filesExtension: 'd.ts',
};

export default config;
