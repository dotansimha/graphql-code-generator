import { SafeString } from 'handlebars';
import { pascalCase } from 'change-case';

export function getFieldResolver(type, options) {
  const config = options.data.root.config || {};
  if (!type) {
    return '';
  }

  let result;

  if (type.hasArguments && !config.noNamespaces) {
    result = `Resolver<R, Parent, Context, ${pascalCase(type.name)}Args>`;
  } else {
    result = `Resolver<R, Parent, Context>`;
  }

  return new SafeString(result);
}
