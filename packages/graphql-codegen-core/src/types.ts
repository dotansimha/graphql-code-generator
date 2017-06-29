export interface Argument {
  name: string;
  description: string;
  type: string;
  isRequired: boolean;
  isArray: boolean;
}

export interface Field {
  name: string;
  description: string;
  arguments: Argument[];
  type: string;
  isArray: boolean;
  isRequired: boolean;
  hasArguments: boolean;
}

export interface Type {
  fields: Field[];
  description: string;
  name: string;
  isInputType: boolean;
  interfaces: string[];
  hasFields: boolean;
  hasInterfaces: boolean;
}

export interface Scalar {
  name: string;
  description: string;
}

export interface Enum {
  name: string;
  description: string;
  values: EnumValue[];
}

export interface EnumValue {
  name: string;
  value: string;
  description: string;
}

export interface Union {
  name: string;
  description: string;
  possibleTypes: string[];
}

export interface Interface {
  name: string;
  description: string;
  fields: Field[];
  hasFields: boolean;
}

export interface SchemaTemplateContext {
  types: Type[];
  inputTypes: Type[];
  enums: Enum[];
  unions: Union[];
  interfaces: Interface[];
  scalars: Scalar[];
  hasTypes: boolean;
  hasInputTypes: boolean;
  hasEnums: boolean;
  hasUnions: boolean;
  hasScalars: boolean;
  hasInterfaces: boolean;
}

export interface SelectionSetFieldNode {
  name: string;
  arguments: any[];
  selectionSet: SelectionSetFieldNode[];
  type: string;
  isRequired: boolean;
  isArray: boolean;
}

export interface Fragment {
  name: string;
  selectionSet: SelectionSetFieldNode[];
  onType: string;
}

export interface Operation {
  name: string;
  selectionSet: any;
  operationType: string;
}

export interface Document {
  fragments: Fragment[];
  operations: Operation[];
  hasFragments: boolean;
  hasOperations: boolean;
}