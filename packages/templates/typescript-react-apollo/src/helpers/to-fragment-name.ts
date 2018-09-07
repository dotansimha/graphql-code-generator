import { pascalCase } from 'change-case';

export function toFragmentName(fragmentName: string, options: any): string {
  const config = options.data.root.config || {};
  if (config.noNamespaces) {
    return pascalCase(`${fragmentName}Document`);
  } else {
    return pascalCase(`${fragmentName}`) + '.Document';
  }
}
