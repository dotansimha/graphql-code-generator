import { SafeString } from 'handlebars';
import { getResultType } from '../utils/get-result-type';
import { Field } from 'graphql-codegen-core';

export function getType(type: Field, options: Handlebars.HelperOptions) {
  if (!type) {
    return '';
  }

  const result = getResultType(type, options);

  if (result.isQuoted) {
    return new SafeString(`"${result.type}"`);
  }

  return new SafeString(result.type);
}
