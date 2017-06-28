export interface Argument {
  name: string;
  description: string;
  type: Type;
  isRequired: boolean;
}

export interface Field {
  name: string;
  description: string;
  arguments: Argument[];
  type: string;
  isArray: boolean;
  isRequired: boolean;
}

export interface Type {
  fields: Field[];
  description: string;
  name: string;
  isInputType: boolean;
  interfaces: string[];
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
}

export interface SchemaTemplateContext {
  types: Type[];
  inputTypes: Type[];
  enums: Enum[];
  unions: Union[];
  interfaces: Interface[];
  scalars: Scalar[];
}
