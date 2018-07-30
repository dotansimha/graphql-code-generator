import { SafeString } from 'handlebars';
import { pascalCase } from 'change-case';

export function getFieldResolver(name, type, options) {
  const config = options.data.root.config || {};
  if (!type) {
    return '';
  }

  let result;

  if (type.hasArguments && !config.noNamespaces) {
    result = `Resolver<${pascalCase(name)}, R, ${pascalCase(type.name)}Args>`;
  } else {
    result = `Resolver<${pascalCase(name)}, R>`;
  }

  return new SafeString(result);
}
