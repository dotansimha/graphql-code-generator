import { Operation, Document, Fragment, SelectionSetItem } from 'graphql-codegen-core';

export interface Config {
  singleFile: boolean;
  flattenTypes: boolean;
  templates: { [templateName: string]: string };
  primitives: {
    String: string;
    Int: string;
    Float: string;
    Boolean: string;
    ID: string;
  };
  out: string;
}

export interface FileOutput {
  filename: string;
  content: string;
}

export interface FlattenOperation extends Operation {
  innerModels: FlattenModel[];
}

export interface FlattenFragment extends Fragment {
  innerModels: FlattenModel[];
}

export interface FlattenDocument extends Document {
  operations: FlattenOperation[];
  fragments: FlattenFragment[];
  hasFragments: boolean;
  hasOperations: boolean;
}

export interface FlattenModel {
  modelType: string;
  fields: SelectionSetItem[];
}
