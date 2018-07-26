import { SafeString } from 'handlebars';
import { getResultType } from '../utils/get-result-type';
import { capitalize } from '../utils/capitalize';

export function getFieldResolver(type, options) {
  const config = options.data.root.config || {};
  if (!type) {
    return '';
  }

  let result;
  const realType = getResultType(type, options);

  if (type.hasArguments && !config.noNamespaces) {
    result = `Resolver<${realType}, ${capitalize(type.name)}Args>`;
  } else {
    result = `Resolver<${realType}>`;
  }

  return new SafeString(result);
}
