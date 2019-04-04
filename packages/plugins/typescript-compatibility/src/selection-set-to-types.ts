import { BaseVisitor, getBaseType } from '@graphql-codegen/visitor-plugin-common';
import { SelectionSetNode, isObjectType, isInterfaceType, isNonNullType, isListType, Kind, GraphQLSchema } from 'graphql';

export type SelectionSetToObjectResult = { [typeName: string]: string };

const handleTypeNameDuplicates = (result: SelectionSetToObjectResult, name: string): string => {
  let typeToUse = name;

  while (result[typeToUse]) {
    typeToUse = `_${typeToUse}`;
  }

  return typeToUse;
};

export function selectionSetToTypes(baseVisitor: BaseVisitor, schema: GraphQLSchema, parentTypeName: string, stack: string, fieldName: string, selectionSet: SelectionSetNode, result: SelectionSetToObjectResult = {}): SelectionSetToObjectResult {
  const parentType = schema.getType(parentTypeName);
  const typeName = baseVisitor.convertName(fieldName);

  if (isObjectType(parentType) || isInterfaceType(parentType)) {
    if (selectionSet && selectionSet.selections && selectionSet.selections.length) {
      const typeToUse = handleTypeNameDuplicates(result, typeName);
      result[typeToUse] = stack;

      for (const selection of selectionSet.selections) {
        switch (selection.kind) {
          case Kind.FIELD: {
            const field = parentType.getFields()[selection.name.value];
            const baseType = getBaseType(field.type);
            const isArray = (isNonNullType(field.type) && isListType(field.type.ofType)) || isListType(field.type);
            const newStack = `${stack}['${selection.name.value}']${isArray ? '[0]' : ''}`;
            selectionSetToTypes(baseVisitor, schema, baseType.name, newStack, selection.name.value, selection.selectionSet, result);

            break;
          }

          case Kind.FRAGMENT_SPREAD: {
            const fragmentName = baseVisitor.convertName(selection.name.value, { suffix: 'Fragment' });
            result[typeToUse] = fragmentName;

            break;
          }

          case Kind.INLINE_FRAGMENT: {
            const typeCondition = selection.typeCondition.name.value;
            const fragmentName = baseVisitor.convertName(typeCondition, { suffix: 'InlineFragment' });
            const fragmentTypeToUse = handleTypeNameDuplicates(result, fragmentName);
            let inlineFragmentValue = `{ __typename: '${typeCondition}' } & Pick<${stack}, ${selection.selectionSet.selections
              .map(subSelection => (subSelection.kind === Kind.FIELD ? `'${subSelection.name.value}'` : null))
              .filter(a => a)
              .join(' | ')}>`;

            selectionSetToTypes(baseVisitor, schema, typeCondition, `(${inlineFragmentValue})`, fragmentTypeToUse, selection.selectionSet, result);

            break;
          }
        }
      }
    }
  }

  return result;
}
