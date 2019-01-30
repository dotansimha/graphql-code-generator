import { DocumentNode, GraphQLSchema } from 'graphql';

export interface AstNode {
  directives: DirectiveUseMap;
  usesDirectives: boolean;
}

export type FieldType =
  | 'Interface'
  | 'InputType'
  | 'Type'
  | 'Query'
  | 'Mutation'
  | 'Subscription'
  | 'Enum'
  | 'Scalar'
  | 'Union';

export interface Argument extends AstNode {
  raw: string;
  name: string;
  description: string;
  type: string;
  isRequired: boolean;
  isArray: boolean;
  dimensionOfArray: number;
  isNullableArray: boolean;
  isType: boolean;
  isScalar: boolean;
  isInterface: boolean;
  isUnion: boolean;
  isInputType: boolean;
  isEnum: boolean;
  hasDefaultValue: boolean;
}

export interface Field extends AstNode {
  name: string;
  description: string;
  arguments: Argument[];
  type: string;
  fieldType: FieldType;
  raw: string;
  isArray: boolean;
  dimensionOfArray: number;
  isRequired: boolean;
  isNullableArray: boolean;
  hasArguments: boolean;
  hasDefaultValue: boolean;
  isType: boolean;
  isScalar: boolean;
  isInterface: boolean;
  isUnion: boolean;
  isInputType: boolean;
  isEnum: boolean;
}

export interface Type extends AstNode {
  fields: Field[];
  description: string;
  name: string;
  isInputType: boolean;
  interfaces: string[];
  hasFields: boolean;
  hasInterfaces: boolean;
}

export interface Scalar extends AstNode {
  name: string;
  description: string;
}

export interface Enum extends AstNode {
  name: string;
  description: string;
  values: EnumValue[];
}

export interface EnumValue extends AstNode {
  name: string;
  value: string;
  description: string;
}

export interface Union extends AstNode {
  name: string;
  description: string;
  possibleTypes: string[];
}

export interface Interface extends AstNode {
  name: string;
  description: string;
  fields: Field[];
  hasFields: boolean;
  implementingTypes: string[];
  hasImplementingTypes: boolean;
}

export interface SchemaTemplateContext extends AstNode {
  types: Type[];
  inputTypes: Type[];
  enums: Enum[];
  unions: Union[];
  interfaces: Interface[];
  scalars: Scalar[];
  definedDirectives: Directive[];
  hasTypes: boolean;
  hasInputTypes: boolean;
  hasEnums: boolean;
  hasUnions: boolean;
  hasScalars: boolean;
  hasInterfaces: boolean;
  hasDefinedDirectives: boolean;
  rawSchema: GraphQLSchema;
}

export interface SelectionSetItem extends AstNode {
  isFragmentSpread: boolean;
  isInlineFragment: boolean;
  isField: boolean;
  isLeaf: boolean;
}

export interface SelectionSetInlineFragment extends SelectionSetItem {
  selectionSet: SelectionSetItem[];
  onType: string;
  name: string;
  fields: SelectionSetFieldNode[];
  fragmentsSpread: SelectionSetFragmentSpread[];
  inlineFragments: SelectionSetInlineFragment[];
  hasFragmentsSpread: boolean;
  hasInlineFragments: boolean;
  hasFields: boolean;
  hasTypename: boolean;
}

export interface SelectionSetFragmentSpread extends SelectionSetItem {
  fragmentName: string;
}

export interface SelectionSetFieldNode extends SelectionSetItem {
  selectionSet: SelectionSetItem[];
  name: string;
  isAliased: boolean;
  schemaFieldName: string;
  type: string;
  isRequired: boolean;
  isArray: boolean;
  dimensionOfArray: number;
  isNullableArray: boolean;
  raw: string;
  fields: SelectionSetFieldNode[];
  fragmentsSpread: SelectionSetFragmentSpread[];
  inlineFragments: SelectionSetInlineFragment[];
  hasFragmentsSpread: boolean;
  hasInlineFragments: boolean;
  hasFields: boolean;
  hasTypename: boolean;

  isType: boolean;
  isScalar: boolean;
  isInterface: boolean;
  isUnion: boolean;
  isInputType: boolean;
  isEnum: boolean;
}

export function isFieldNode(node: SelectionSetItem): node is SelectionSetFieldNode {
  return node['name'] !== undefined && node['selectionSet'] !== undefined && node['type'] !== undefined;
}

export function isFragmentSpreadNode(node: SelectionSetItem): node is SelectionSetFragmentSpread {
  return node['fragmentName'] !== undefined;
}

export function isInlineFragmentNode(node: SelectionSetItem): node is SelectionSetInlineFragment {
  return node['selectionSet'] !== undefined && node['onType'] !== undefined;
}

export interface Fragment extends AstNode {
  name: string;
  selectionSet: SelectionSetItem[];
  onType: string;
  document: string;
  fields: SelectionSetFieldNode[];
  fragmentsSpread: SelectionSetFragmentSpread[];
  inlineFragments: SelectionSetInlineFragment[];
  hasFragmentsSpread: boolean;
  hasInlineFragments: boolean;
  hasFields: boolean;
  originalFile?: string;
}

export interface Operation extends AstNode {
  name: string;
  selectionSet: SelectionSetItem[];
  operationType: string;
  variables: Variable[];
  hasVariables: boolean;
  isQuery: boolean;
  isMutation: boolean;
  isSubscription: boolean;
  document: string;
  fields: SelectionSetFieldNode[];
  fragmentsSpread: SelectionSetFragmentSpread[];
  inlineFragments: SelectionSetInlineFragment[];
  hasFragmentsSpread: boolean;
  hasInlineFragments: boolean;
  hasFields: boolean;
  originalFile?: string;
}

export interface Variable {
  name: string;
  type: string;
  isRequired: boolean;
  isArray: boolean;
  isNullableArray: boolean;
  dimensionOfArray: number;
  raw: string;
  isType: boolean;
  isScalar: boolean;
  isInterface: boolean;
  isUnion: boolean;
  isInputType: boolean;
  isEnum: boolean;
}

export interface Document {
  fragments: Fragment[];
  operations: Operation[];
  hasFragments: boolean;
  hasOperations: boolean;
}

export type DirectiveUseMap = { [key: string]: any };

export interface Directive {
  name: string;
  description: string;
  locations: string[];
  arguments: Argument[];
  hasArguments: boolean;

  onFragmentSpread: boolean;
  onInlineFragment: boolean;
  onQuery: boolean;
  onMutation: boolean;
  onSubscription: boolean;
  onFragment: boolean;
  onField: boolean;

  onSchema: boolean;
  onScalar: boolean;
  onFieldDefinition: boolean;
  onEnum: boolean;
  onEnumValue: boolean;
  onObject: boolean;
  onInputObject: boolean;
  onInputField: boolean;
  onArgument: boolean;
  onInterface: boolean;
  onUnion: boolean;
}

export interface FileOutput {
  filename: string;
  content: string;
}

export interface Settings {
  generateSchema?: boolean;
  generateDocuments?: boolean;
  verbose?: boolean;
}

export type CustomProcessingFunction = (
  templateContext: SchemaTemplateContext,
  mergedDocuments: Document,
  settings: any
) => FileOutput[] | Promise<FileOutput[]>;

export interface DocumentFile {
  filePath: string;
  content: DocumentNode;
}
