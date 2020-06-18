import { Kind, TypeNode, StringValueNode } from 'graphql';
import { indent } from '@graphql-codegen/visitor-plugin-common';
import { csharpNativeValueTypes } from './common';

export function buildPackageNameFromPath(path: string): string {
  const unixify = require('unixify');
  return unixify(path || '')
    .replace(/src\/main\/.*?\//, '')
    .replace(/\//g, '.');
}

export function getListInnerTypeNode(typeNode: TypeNode): TypeNode {
  if (typeNode.kind === Kind.LIST_TYPE) {
    return typeNode.type;
  } else if (typeNode.kind === Kind.NON_NULL_TYPE && typeNode.type.kind === Kind.LIST_TYPE) {
    return typeNode.type.type;
  }
  return typeNode;
}

export function transformComment(comment: string | StringValueNode, indentLevel = 0): string {
  if (!comment) {
    return '';
  }
  if (isStringValueNode(comment)) {
    comment = comment.value;
  }
  comment = comment
    .trimStart()
    .split('*/')
    .join('*\\/');
  let lines = comment.split('\n');
  lines = ['/// <summary>', ...lines.map(line => `/// ${line}`), '/// </summary>'];
  return lines
    .map(line => indent(line, indentLevel))
    .concat('')
    .join('\n');
}

function isStringValueNode(node: any): node is StringValueNode {
  return node && typeof node === 'object' && node.kind === Kind.STRING;
}

export function isValueType(type: string): boolean {
  // Limitation: only checks the list of known built in value types
  // Eg .NET types and struct types won't be detected correctly
  return csharpNativeValueTypes.includes(type);
}
