import { SafeString } from 'handlebars';
import { getResultType } from '../utils/get-result-type';

export function getType(type, options) {
  if (!type) {
    return '';
  }

  const result = getResultType(type, options);

  return new SafeString(result);
}
