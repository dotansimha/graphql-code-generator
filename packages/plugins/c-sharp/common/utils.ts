// This file is bundled and inlined.
// We should probably make this a shared package though.
// eslint-disable-next-line import/no-extraneous-dependencies
import { Kind, TypeNode, StringValueNode } from 'graphql';
// eslint-disable-next-line import/no-extraneous-dependencies
import { indent } from '@graphql-codegen/visitor-plugin-common';
import { csharpValueTypes } from './scalars.js';
import { ListTypeField, CSharpFieldType } from './c-sharp-field-types.js';

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
  return csharpValueTypes.includes(type);
}

export function getListTypeField(typeNode: TypeNode): ListTypeField | undefined {
  if (typeNode.kind === Kind.LIST_TYPE) {
    return {
      required: false,
      type: getListTypeField(typeNode.type),
    };
  }
  if (typeNode.kind === Kind.NON_NULL_TYPE && typeNode.type.kind === Kind.LIST_TYPE) {
    return Object.assign(getListTypeField(typeNode.type), {
      required: true,
    });
  }
  if (typeNode.kind === Kind.NON_NULL_TYPE) {
    return getListTypeField(typeNode.type);
  }
  return undefined;
}

export function getListTypeDepth(listType: ListTypeField): number {
  if (listType) {
    return getListTypeDepth(listType.type) + 1;
  }
  return 0;
}

export function getListInnerTypeNode(typeNode: TypeNode): TypeNode {
  if (typeNode.kind === Kind.LIST_TYPE) {
    return getListInnerTypeNode(typeNode.type);
  }
  if (typeNode.kind === Kind.NON_NULL_TYPE && typeNode.type.kind === Kind.LIST_TYPE) {
    return getListInnerTypeNode(typeNode.type);
  }
  return typeNode;
}

export function wrapFieldType(
  fieldType: CSharpFieldType,
  listTypeField?: ListTypeField,
  listType = 'IEnumerable'
): string {
  if (listTypeField) {
    const innerType = wrapFieldType(fieldType, listTypeField.type, listType);
    return `${listType}<${innerType}>`;
  }
  return fieldType.innerTypeName;
}
