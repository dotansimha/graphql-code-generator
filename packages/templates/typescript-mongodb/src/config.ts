import { EInputType, GeneratorConfig } from 'graphql-codegen-core';
import filterModelFields from './helpers/filter-model-fields';
import isArray from './helpers/is-array';
import ifPrimitive from './helpers/is-primitive';
import ifNotRootType from './helpers/if-not-root-type';
import * as enumTemplate from './templates/enum.handlebars';
import * as index from './templates/index.handlebars';
import * as inputType from './templates/inputType.handlebars';
import * as interfaceTemplate from './templates/interface.handlebars';
import * as scalar from './templates/scalar.handlebars';
import * as type from './templates/type.handlebars';
import * as union from './templates/union.handlebars';
import * as schema from './templates/schema.handlebars';
import { entityFields } from './helpers/entity-fields';

export const config: GeneratorConfig = {
  inputType: EInputType.SINGLE_FILE,
  flattenTypes: true,
  primitives: {
    String: 'string',
    Int: 'number',
    Float: 'number',
    Boolean: 'boolean',
    ID: 'string'
  },
  customHelpers: {
    filterModelFields,
    isArray,
    ifPrimitive,
    ifNotRootType,
    entityFields
  },
  templates: {
    schema,
    index,
    type,
    inputType,
    enum: enumTemplate,
    interface: interfaceTemplate,
    scalar,
    union
  },
  outFile: 'models.ts'
};
