import { Config } from '../types';
import * as mainTemplate from './template.handlebars';
import * as typeTemplate from './type.handlebars';

const config: Config = {
  singleFile: true,
  templates: {
    index: mainTemplate,
    type: typeTemplate,
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
