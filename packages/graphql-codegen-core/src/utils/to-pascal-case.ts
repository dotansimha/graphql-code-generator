import { pascalCase } from 'change-case';

export function toPascalCase(str: string) {
  if (str.charAt(0) === '_') {
    return str.replace(
      /^(_*)(.*)/,
      (_match, underscorePrefix, typeName) => `${underscorePrefix}${pascalCase(typeName || '')}`
    );
  }

  return pascalCase(str || '');
}
