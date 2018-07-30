import { pascalCase } from 'change-case';

export function getFieldResolverName(name) {
  return `${pascalCase(name)}Resolver`;
}
