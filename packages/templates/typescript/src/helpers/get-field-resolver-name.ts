import { pascalCase } from 'change-case';

export function getFieldResolverName(name: string) {
  return `${pascalCase(name)}Resolver`;
}
