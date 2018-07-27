import { SafeString } from 'handlebars';
import { getResultType } from '../utils/get-result-type';
import { pascalCase } from 'change-case';

export function getFieldResolver(name, type, options) {
  const config = options.data.root.config || {};
  if (!type) {
    return '';
  }

  let result;
  const realType = getResultType(type, options);

  if (type.hasArguments && !config.noNamespaces) {
    result = `Resolver<${pascalCase(name)}, ${realType}, ${pascalCase(type.name)}Args>`;
  } else {
    result = `Resolver<${pascalCase(name)}, ${realType}>`;
  }

  return new SafeString(result);
}
