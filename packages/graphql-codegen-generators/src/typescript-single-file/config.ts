import { Config } from '../types';
import * as mainTemplate from './template.handlebars';

const config: Config = {
  singleFile: true,
  templates: {
    index: mainTemplate,
  },
  flattenTypes: true,
  primitives: {
    String: 'string',
    Int: 'number',
    Float: 'number',
    Boolean: 'boolean',
    ID: 'string'
  },
};

export default config;
