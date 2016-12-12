export interface Field {
  name: string;
  type?: string;
  isArray?: boolean;
  isRequired?: boolean;
}

export interface EnumValue {
  name: string;
  description: string;
}

export interface InlineFragment {
  typeName?: string;
  onModel?: string;
}

export interface Model {
  name?: string;
  description?: string;
  fields?: Field[];
  isObject?: boolean;
  isFragment?: boolean;
  isEnum?: boolean;
  usingFragments?: boolean;
  enumValues?: EnumValue[];
  fragmentsUsed?: string[];
  inlineFragments?: InlineFragment[];
  hasInlineFragments?: boolean;
  imports?: string[];
  implementedInterfaces?: string[];
  hasImplementedInterfaces?: boolean;
}

export interface CodegenDocument {
  isQuery: boolean;
  isMutation: boolean;
  isSubscription: boolean;
  isFragment: boolean;
  name: string;
  document: string;
  rawName: string;
  innerTypes: Model[];
  variables: Field[];
  hasInnerTypes: boolean;
  hasVariables: boolean;
  imports?: string[];
}

export interface Codegen {
  models: Model[];
  documents: CodegenDocument[];
}
