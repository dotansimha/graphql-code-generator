import { Kind, TypeNode, StringValueNode } from 'graphql';
import { indent } from '@graphql-codegen/visitor-plugin-common';
import { csharpNativeValueTypes } from './common';

export function buildPackageNameFromPath(path: string): string {
  const unixify = require('unixify');
  return unixify(path || '')
    .replace(/src\/main\/.*?\//, '')
    .replace(/\//g, '.');
}

export function wrapTypeWithModifiers(baseType: string, typeNode: TypeNode, listType = 'IEnumerable'): string {
  if (typeNode.kind === Kind.NON_NULL_TYPE) {
    return wrapTypeWithModifiers(baseType, typeNode.type, listType);
  } else if (typeNode.kind === Kind.LIST_TYPE) {
    const innerType = wrapTypeWithModifiers(baseType, typeNode.type, listType);

    return `${listType}<${innerType}>`;
  } else {
    return baseType;
  }
}

export function transformComment(comment: string | StringValueNode, indentLevel = 0): string {
  if (!comment) {
      return '';
  }
  if (isStringValueNode(comment)) {
      comment = comment.value;
  }
  comment = comment.trimStart().split('*/').join('*\\/');
  let lines = comment.split('\n');
  lines = ['/// <summary>', ...lines.map(line => `/// ${line}`), '/// </summary>'];
  return lines.map(line => indent(line, indentLevel)).concat('').join('\n');
}

function isStringValueNode(node: any): node is StringValueNode {
  return node && typeof node === 'object' && node.kind === Kind.STRING;
}

export function isValueType(type: string): boolean {
  // Limitation: only checks the list of known built in value types
  // Eg .NET types and struct types won't be detected correctly
  return csharpNativeValueTypes.includes(type);
}
