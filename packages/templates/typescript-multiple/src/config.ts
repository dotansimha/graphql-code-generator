import * as type from './type.handlebars';
import * as enumTemplate from './enum.handlebars';
import * as scalar from './scalar.handlebars';
import * as union from './union.handlebars';
import * as operation from './operation.handlebars';
import * as fragment from './fragment.handlebars';
import * as selectionSet from './selection-set.handlebars';
import * as fragments from './fragments.handlebars';
import { EInputType, GeneratorConfig } from 'graphql-codegen-core';

export const config: GeneratorConfig = {
  inputType: EInputType.MULTIPLE_FILES,
  templates: {
    type,
    inputType: type,
    enum: enumTemplate,
    interface: type,
    scalar,
    union,
    operation,
    fragment,
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
  filesExtension: 'ts'
};
