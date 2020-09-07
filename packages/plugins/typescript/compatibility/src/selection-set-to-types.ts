import { BaseVisitor } from '@graphql-codegen/visitor-plugin-common';
import { getBaseType } from '@graphql-codegen/plugin-helpers';
import {
  SelectionSetNode,
  isObjectType,
  isInterfaceType,
  isNonNullType,
  isListType,
  Kind,
  GraphQLSchema,
  isUnionType,
  GraphQLOutputType,
} from 'graphql';
import { CompatibilityPluginRawConfig } from './config';
import { CompatibilityPluginConfig } from './visitor';

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

function transformNestedAst(type: GraphQLOutputType, base: string, applyNonNullable: boolean): string {
  if (isListType(type)) {
    return applyNonNullable
      ? `NonNullable<${transformNestedAst(type.ofType, base, applyNonNullable)}[number]>`
      : `${transformNestedAst(type.ofType, base, applyNonNullable)}[number]`;
  } else if (isNonNullType(type)) {
    return transformNestedAst(type.ofType, base, applyNonNullable);
  } else {
    return applyNonNullable ? `(NonNullable<${base}>)` : base;
  }
}

export function selectionSetToTypes(
  typesPrefix: string,
  baseVisitor: BaseVisitor<CompatibilityPluginRawConfig, CompatibilityPluginConfig>,
  schema: GraphQLSchema,
  parentTypeName: string,
  stack: string,
  fieldName: string,
  selectionSet: SelectionSetNode,
  preResolveTypes: boolean,
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
            const selectionName =
              selection.alias && selection.alias.value ? selection.alias.value : selection.name.value;

            if (!selectionName.startsWith('__')) {
              const field = parentType.getFields()[selection.name.value];
              const baseType = getBaseType(field.type);
              const typeRef = `${stack}['${selectionName}']`;
              const newStack = transformNestedAst(
                field.type,
                typeRef,
                baseVisitor.config.strict || baseVisitor.config.preResolveTypes
              );

              selectionSetToTypes(
                typesPrefix,
                baseVisitor,
                schema,
                baseType.name,
                newStack,
                selectionName,
                selection.selectionSet,
                preResolveTypes,
                result
              );
            }
          }

          break;
        }

        case Kind.INLINE_FRAGMENT: {
          const typeCondition = selection.typeCondition.name.value;
          const fragmentName = baseVisitor.convertName(typeCondition, { suffix: 'InlineFragment' });
          let inlineFragmentValue;

          if (isUnionType(parentType) || isInterfaceType(parentType)) {
            inlineFragmentValue = `DiscriminateUnion<${stack}, { __typename${
              baseVisitor.config.nonOptionalTypename ? '' : '?'
            }: '${typeCondition}' }>`;
          } else {
            let encounteredNestedInlineFragment = false;
            const subSelections = selection.selectionSet.selections
              .map(subSelection => {
                switch (subSelection.kind) {
                  case Kind.FIELD:
                    return `'${subSelection.name.value}'`;
                  case Kind.FRAGMENT_SPREAD:
                    return `keyof ${baseVisitor.convertName(subSelection.name.value, { suffix: 'Fragment' })}`;
                  case Kind.INLINE_FRAGMENT:
                    encounteredNestedInlineFragment = true;
                    return null;
                }
              })
              .filter(a => a);

            if (encounteredNestedInlineFragment) {
              throw new Error('Nested inline fragments are not supported the `typescript-compatibility` plugin');
            } else if (subSelections.length) {
              inlineFragmentValue = `{ __typename: '${typeCondition}' } & Pick<${stack}, ${subSelections.join(' | ')}>`;
            }
          }

          if (inlineFragmentValue) {
            selectionSetToTypes(
              typesPrefix,
              baseVisitor,
              schema,
              typeCondition,
              `(${inlineFragmentValue})`,
              fragmentName,
              selection.selectionSet,
              preResolveTypes,
              result
            );
          }

          break;
        }
      }
    }
  }

  return result;
}
