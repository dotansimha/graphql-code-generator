import { FlattenDocument, FlattenFragment, FlattenModel, FlattenOperation } from './types';
import {
  Document,
  Fragment,
  isFieldNode,
  isInlineFragmentNode,
  Operation,
  SelectionSetFieldNode,
  SelectionSetInlineFragment,
  SelectionSetItem
} from 'graphql-codegen-core';
import { pascalCase } from 'change-case';

export const handleNameDuplications = (name: string, existing: FlattenModel[]): string => {
  if (existing.find(model => model.modelType === name)) {
    return handleNameDuplications('_' + name, existing);
  }

  return name;
};

function buildModelFromField(field: SelectionSetFieldNode, result: FlattenModel[]): FlattenModel {
  const modelName = handleNameDuplications(pascalCase(field.name), result);

  return {
    schemaBaseType: field.type,
    modelType: modelName,
    fields: field.fields,
    fragmentsSpread: field.fragmentsSpread,
    inlineFragments: field.inlineFragments,
    hasFields: field.hasFields,
    hasFragmentsSpread: field.hasFragmentsSpread,
    hasInlineFragments: field.hasInlineFragments
  };
}

function buildModelFromInlineFragment(fragment: SelectionSetInlineFragment, result: FlattenModel[]): FlattenModel {
  const modelName = handleNameDuplications(pascalCase(fragment.onType) + 'InlineFragment', result);

  return {
    schemaBaseType: fragment.onType,
    modelType: modelName,
    fields: fragment.fields,
    fragmentsSpread: fragment.fragmentsSpread,
    inlineFragments: fragment.inlineFragments,
    hasFields: fragment.hasFields,
    hasFragmentsSpread: fragment.hasFragmentsSpread,
    hasInlineFragments: fragment.hasInlineFragments
  };
}

export function flattenSelectionSet(selectionSet: SelectionSetItem[], result: FlattenModel[] = []): FlattenModel[] {
  selectionSet.forEach((item: SelectionSetItem) => {
    if (isFieldNode(item)) {
      if (item.selectionSet.length > 0) {
        const model = buildModelFromField(item, result);
        item.type = model.modelType;
        result.push(model);

        flattenSelectionSet(item.selectionSet, result);
      }
    } else if (isInlineFragmentNode(item)) {
      const model = buildModelFromInlineFragment(item, result);
      item.onType = model.modelType;
      result.push(model);

      flattenSelectionSet(item.selectionSet, result);
    }
  });

  return result;
}

export function flattenTypes(document: Document): FlattenDocument {
  return {
    operations: document.operations.map<FlattenOperation>(
      (operation: Operation): FlattenOperation => {
        return {
          isFlatten: true,
          ...operation,
          innerModels: flattenSelectionSet(operation.selectionSet)
        } as FlattenOperation;
      }
    ),
    fragments: document.fragments.map<FlattenFragment>(
      (fragment: Fragment): FlattenFragment => {
        return {
          isFlatten: true,
          ...fragment,
          innerModels: flattenSelectionSet(fragment.selectionSet)
        } as FlattenFragment;
      }
    ),
    hasOperations: document.hasOperations,
    hasFragments: document.hasFragments
  };
}
