import { BaseVisitor, getBaseType } from '@graphql-codegen/visitor-plugin-common';
import { SelectionSetNode, isObjectType, isInterfaceType, isNonNullType, isListType, Kind, GraphQLSchema } from 'graphql';
import { CompatabilityPluginRawConfig } from './index';
import { CompatabilityPluginConfig } from './visitor';

export type SelectionSetToObjectResult = {
  [typeName: string]: {
    export: string;
    name: string;
  };
};

const handleTypeNameDuplicates = (result: SelectionSetToObjectResult, name: string, prefix = ''): string => {
  let typeToUse = name;

  while (result[prefix + typeToUse]) {
    typeToUse = `_${typeToUse}`;
  }

  return prefix + typeToUse;
};

export function selectionSetToTypes(
  typesPrefix: string,
  baseVisitor: BaseVisitor<CompatabilityPluginRawConfig, CompatabilityPluginConfig>,
  schema: GraphQLSchema,
  parentTypeName: string,
  stack: string,
  fieldName: string,
  selectionSet: SelectionSetNode,
  result: SelectionSetToObjectResult = {}
): SelectionSetToObjectResult {
  const parentType = schema.getType(parentTypeName);
  const typeName = baseVisitor.convertName(fieldName);

  if (selectionSet && selectionSet.selections && selectionSet.selections.length) {
    const typeToUse = handleTypeNameDuplicates(result, typeName, typesPrefix);
    result[typeToUse] = { export: 'type', name: stack };

    for (const selection of selectionSet.selections) {
      switch (selection.kind) {
        case Kind.FIELD: {
          if (isObjectType(parentType) || isInterfaceType(parentType)) {
            const selectionName = selection.alias && selection.alias.value ? selection.alias.value : selection.name.value;
            const field = parentType.getFields()[selection.name.value];
            const baseType = getBaseType(field.type);
            const wrapWithNonNull = baseVisitor.config.strict && !isNonNullType(field.type);
            const isArray = (isNonNullType(field.type) && isListType(field.type.ofType)) || isListType(field.type);
            const typeRef = `${stack}['${selectionName}']`;
            const nonNullableInnerType = `${wrapWithNonNull ? `(NonNullable<${typeRef}>)` : typeRef}`;
            const arrayInnerType = isArray ? `${nonNullableInnerType}[0]` : nonNullableInnerType;
            const wrapArrayWithNonNull = baseVisitor.config.strict;
            const newStack = isArray && wrapArrayWithNonNull ? `(NonNullable<${arrayInnerType}>)` : arrayInnerType;
            selectionSetToTypes(typesPrefix, baseVisitor, schema, baseType.name, newStack, selectionName, selection.selectionSet, result);
          }

          break;
        }

        case Kind.FRAGMENT_SPREAD: {
          const fragmentName = baseVisitor.convertName(selection.name.value, { suffix: 'Fragment' });
          result[typeToUse] = { export: 'type', name: fragmentName };

          break;
        }

        case Kind.INLINE_FRAGMENT: {
          const typeCondition = selection.typeCondition.name.value;
          const fragmentName = baseVisitor.convertName(typeCondition, { suffix: 'InlineFragment' });
          let inlineFragmentValue = `{ __typename: '${typeCondition}' } & Pick<${stack}, ${selection.selectionSet.selections
            .map(subSelection => (subSelection.kind === Kind.FIELD ? `'${subSelection.name.value}'` : null))
            .filter(a => a)
            .join(' | ')}>`;

          selectionSetToTypes(typesPrefix, baseVisitor, schema, typeCondition, `(${inlineFragmentValue})`, fragmentName, selection.selectionSet, result);

          break;
        }
      }
    }
  }

  return result;
}
