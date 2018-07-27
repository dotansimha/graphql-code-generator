import { SafeString } from 'handlebars';
import { getResultType } from '../utils/get-result-type';
import { capitalize } from '../utils/capitalize';

export function getFieldResolver(name, type, options) {
  const config = options.data.root.config || {};
  if (!type) {
    return '';
  }

  let result;
  const realType = getResultType(type, options);

  if (type.hasArguments && !config.noNamespaces) {
    result = `Resolver<${name}, ${realType}, ${capitalize(type.name)}Args>`;
  } else {
    result = `Resolver<${name}, ${realType}>`;
  }

  return new SafeString(result);
}
