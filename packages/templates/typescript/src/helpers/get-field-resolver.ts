import { SafeString } from 'handlebars';
import { capitalize } from '../utils/capitalize';

export function getFieldResolver(type, options) {
  const config = options.data.root.config || {};
  if (!type) {
    return '';
  }

  let result;

  if (type.hasArguments && !config.noNamespaces) {
    result = `Resolver<R, ${capitalize(type.name)}Args>`;
  } else {
    result = `Resolver<R>`;
  }

  return new SafeString(result);
}
