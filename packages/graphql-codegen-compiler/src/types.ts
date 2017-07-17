import {
  Operation, Document, Fragment, SelectionSetFragmentSpread,
  SelectionSetFieldNode, SelectionSetInlineFragment
} from 'graphql-codegen-core';

export interface FileOutput {
  filename: string;
  content: string;
}

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
}

export interface Settings {
  generateSchema?: boolean;
  generateDocuments?: boolean;
  verbose?: boolean;
}

export interface MultiFileTemplates {
  [templateHandler: string]: Function[];
}
