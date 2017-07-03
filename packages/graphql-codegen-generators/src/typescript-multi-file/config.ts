import { GeneratorConfig } from '../types';
import * as type from './type.handlebars';

const config: GeneratorConfig = {
  singleFile: false,
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
  out: 'types/',
};

export default config;
