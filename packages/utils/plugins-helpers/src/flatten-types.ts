import { pascalCase } from 'change-case';
import {
  Operation,
  Document,
  Fragment,
  SelectionSetFragmentSpread,
  SelectionSetFieldNode,
  SelectionSetInlineFragment,
  SelectionSetItem,
  isFieldNode,
  isInlineFragmentNode
} from 'graphql-codegen-core';

export interface FlattenOperation extends Operation {
  innerModels: FlattenModel[];
  isFlatten: boolean;
}

export interface FlattenFragment extends Fragment {
  innerModels: FlattenModel[];
  isFlatten: boolean;
}

export interface FlattenDocument extends Document {
  operations: FlattenOperation[];
  fragments: FlattenFragment[];
  hasFragments: boolean;
  hasOperations: boolean;
}

export interface FlattenModel {
  schemaBaseType: string;
  modelType: string;
  fields: SelectionSetFieldNode[];
  fragmentsSpread: SelectionSetFragmentSpread[];
  inlineFragments: SelectionSetInlineFragment[];
  hasFragmentsSpread: boolean;
  hasFields: boolean;
  hasInlineFragments: boolean;
  hasTypename: boolean;
}

const operationTypes = ['query', 'mutation', 'subscription'].map(name => pascalCase(name));

export const handleNameDuplications = (name: string, existing: FlattenModel[]): string => {
  if (operationTypes.includes(name) || existing.find(model => model.modelType === name)) {
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
    hasInlineFragments: field.hasInlineFragments,
    hasTypename: field.hasTypename
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
    hasInlineFragments: fragment.hasInlineFragments,
    hasTypename: fragment.hasTypename
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
      item.name = model.modelType;
      item.onType = model.schemaBaseType;
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
