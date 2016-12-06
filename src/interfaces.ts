export interface Field {
  name: string;
  type: string;
  isArray: boolean;
  isEnum: boolean;
}

export interface Model {
  className: string;
  description?: string;
  parent?: string;
  fields: Field[];
  isFragment: boolean;
  isInnerType: boolean;
}

export interface Document {
  isQuery: boolean;
  isMutation: boolean;
  isSubscription: boolean;
}

export interface Codegen {
  models: Model[];
  documents: Document[];
}
