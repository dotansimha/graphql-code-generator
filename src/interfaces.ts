export interface Field {
  name: string;
  type: string;
  isArray: boolean;
  isRequired: boolean;
  isNullable: boolean;
}

export interface EnumValue {
  name: string;
  description: string;
}

export interface Model {
  name: string;
  description?: string;
  parent?: string;
  fields: Field[];
  isFragment: boolean;
  isInterface: boolean;
  isInnerType: boolean;
  isEnum: boolean;
  enumValues?: EnumValue[];
}

export interface Document {
  isQuery: boolean;
  isMutation: boolean;
  isSubscription: boolean;
  name: string;
}

export interface Codegen {
  models: Model[];
  documents: Document[];
}
