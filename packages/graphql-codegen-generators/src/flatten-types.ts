import { FlattenDocument, FlattenFragment, FlattenModel, FlattenOperation } from './types';
import { Document, Fragment, Operation, SelectionSetFieldNode, SelectionSetItem } from 'graphql-codegen-core';
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
    modelType: modelName,
    fields: field.selectionSet,
  };
}

function flattenSelectionSet(selectionSet: SelectionSetItem[], result: FlattenModel[] = []): FlattenModel[] {
  selectionSet.forEach((item: SelectionSetItem) => {
    if (item['selectionSet']) {
      const selectionSetField = item as SelectionSetFieldNode;

      if (selectionSetField.selectionSet.length > 0) {
        const model = buildModelFromField(selectionSetField, result);
        selectionSetField.type = model.modelType;
        result.push(model);

        flattenSelectionSet(selectionSetField.selectionSet, result);
      }
    }
  });

  return result;
}

export function flattenTypes(document: Document): FlattenDocument {
  return {
    operations: document.operations.map<FlattenOperation>((operation: Operation): FlattenOperation => {
      return {
        ...operation,
        innerModels: flattenSelectionSet(operation.selectionSet),
      } as FlattenOperation;
    }),
    fragments: document.fragments.map<FlattenFragment>((fragment: Fragment): FlattenFragment => {
      return {
        ...fragment,
        innerModels: flattenSelectionSet(fragment.selectionSet),
      } as FlattenFragment;
    }),
    hasOperations: document.hasOperations,
    hasFragments: document.hasFragments,
  };
}
