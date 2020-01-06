import { Kind, TypeNode } from 'graphql';
import unixify from 'unixify';

export function buildPackageNameFromPath(path: string): string {
  return unixify(path || '')
    .replace(/src\/main\/.*?\//, '')
    .replace(/\//g, '.');
}

export function wrapTypeWithModifiers(baseType: string, typeNode: TypeNode, listType = 'Iterable'): string {
  if (typeNode.kind === Kind.NON_NULL_TYPE) {
    return wrapTypeWithModifiers(baseType, typeNode.type, listType);
  } else if (typeNode.kind === Kind.LIST_TYPE) {
    const innerType = wrapTypeWithModifiers(baseType, typeNode.type, listType);

    return `${listType}<${innerType}>`;
  } else {
    return baseType;
  }
}
