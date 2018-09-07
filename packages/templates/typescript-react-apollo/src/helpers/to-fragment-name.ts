import { pascalCase } from 'change-case';

export function toFragmentName(fragmentName: string): string {
  return pascalCase(`${fragmentName}Fragment`);
}
