import { SafeString } from 'handlebars';
import { getResultType } from '../utils/get-result-type';
import { capitalize } from '../utils/capitalize';

export function getFieldResolver(type, options) {
  if (!type) {
    return '';
  }

  let result;
  const realType = getResultType(type, options);

  if (type.hasArguments) {
    result = `Resolver<${realType}, ${capitalize(type.name)}Args>`;
  } else {
    result = `Resolver<${realType}>`;
  }

  return new SafeString(result);
}
