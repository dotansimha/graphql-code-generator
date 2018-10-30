import { SafeString } from 'handlebars';
import { convertedType } from '../utils/get-result-type';
import { Field } from 'graphql-codegen-core';

export function getType(type: Field, options: Handlebars.HelperOptions) {
  if (!type) {
    return '';
  }

  const result = convertedType(type, options);

  return new SafeString(result);
}
