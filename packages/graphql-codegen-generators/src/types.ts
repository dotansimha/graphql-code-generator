import {
  Operation, Document, Fragment, SelectionSetFragmentSpread,
  SelectionSetFieldNode, SelectionSetInlineFragment
} from 'graphql-codegen-core';
export const EInputType = {
  SINGLE_FILE: 'SINGLE_FILE',
  MULTIPLE_FILES: 'MULTIPLE_FILES',
  PROJECT: 'PROJECT',
};

export interface GeneratorConfig {
  inputType: string; // EInputType
  flattenTypes: boolean;
  templates: { [templateName: string]: string | string[] } | string;
  primitives: {
    String: string;
    Int: string;
    Float: string;
    Boolean: string;
    ID: string;
  };
  outFile?: string;
  filesExtension?: string;
}

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
  operation: HandlebarsTemplateDelegate[];
  fragment: HandlebarsTemplateDelegate[];
  type: HandlebarsTemplateDelegate[];
  scalar: HandlebarsTemplateDelegate[];
  'interface': HandlebarsTemplateDelegate[];
  inputType: HandlebarsTemplateDelegate[];
  union: HandlebarsTemplateDelegate[];
  'enum': HandlebarsTemplateDelegate[];

}
