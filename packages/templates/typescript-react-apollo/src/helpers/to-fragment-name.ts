import { pascalCase } from 'change-case';

export function toFragmentName(fragmentName: string, options: Handlebars.HelperOptions): string {
  const config = options.data.root.config || {};
  if (config.noNamespaces) {
    return pascalCase(`${fragmentName}FragmentDoc`);
  } else {
    return pascalCase(fragmentName) + '.FragmentDoc';
  }
}
