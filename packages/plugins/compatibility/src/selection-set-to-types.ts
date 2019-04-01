import { BaseVisitor, getBaseType } from '@graphql-codegen/visitor-plugin-common';
import { GraphQLNamedType, SelectionSetNode, isObjectType, isInterfaceType, isNonNullType, isListType } from 'graphql';

export type SelectionSetToObjectResult = { [typeName: string]: string };

export function selectionSetToTypes(baseVisitor: BaseVisitor, parentType: GraphQLNamedType, stack: string, fieldName: string, selectionSet: SelectionSetNode, result: SelectionSetToObjectResult = {}): SelectionSetToObjectResult {
  const typeName = baseVisitor.convertName(fieldName);

  if (isObjectType(parentType) || isInterfaceType(parentType)) {
    if (selectionSet && selectionSet.selections && selectionSet.selections.length) {
      let typeToUse = typeName;

      while (result[typeToUse]) {
        typeToUse = `_${typeToUse}`;
      }

      result[typeToUse] = stack;

      for (const selection of selectionSet.selections) {
        switch (selection.kind) {
          case 'Field': {
            const field = parentType.getFields()[selection.name.value];
            const baseType = getBaseType(field.type);
            const isArray = (isNonNullType(field.type) && isListType(field.type.ofType)) || isListType(field.type);
            const newStack = `${stack}['${selection.name.value}']${isArray ? '[0]' : ''}`;
            selectionSetToTypes(baseVisitor, baseType, newStack, selection.name.value, selection.selectionSet, result);
          }
        }
      }
    }
  }

  return result;
}
