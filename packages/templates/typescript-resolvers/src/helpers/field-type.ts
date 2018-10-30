import { Field } from 'graphql-codegen-core';
import { convertedType, getFieldType as fieldType } from 'graphql-codegen-typescript-template';
import { pickMapper } from './mappers';

export function getFieldType(field: Field, options: Handlebars.HelperOptions) {
  const config = options.data.root.config || {};
  const mapper = pickMapper(field.type, config.mappers || {});
  const type: string = mapper ? fieldType(field, mapper.type, options) : convertedType(field, options);

  return type;
}
