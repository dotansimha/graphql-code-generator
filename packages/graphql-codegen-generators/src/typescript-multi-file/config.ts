import { EInputType, GeneratorConfig } from '../types';
import * as type from './type.handlebars';

const config: GeneratorConfig = {
  inputType: EInputType.MULTIPLE_FILES,
  templates: {
    type,
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
