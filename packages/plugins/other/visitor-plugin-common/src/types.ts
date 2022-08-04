import { ASTNode, FragmentDefinitionNode } from 'graphql';
import { ParsedMapper } from './mappers.js';

/**
 * A map between the GraphQL directive name and the identifier that should be used
 */
export type DirectiveArgumentAndInputFieldMappings = { [name: string]: string };

/**
 * Parsed directives map - a mapping between GraphQL directive name and the parsed mapper object,
 * including all required information for generating code for that mapping.
 */
export type ParsedDirectiveArgumentAndInputFieldMappings = { [name: string]: ParsedMapper };

/**
 * Scalars map or a string, a map between the GraphQL scalar name and the identifier that should be used
 */
export type ScalarsMap = string | { [name: string]: string };
/**
 * A normalized map between GraphQL scalar name and the identifier name
 */
export type NormalizedScalarsMap = { [name: string]: string };
/**
 * Parsed scalars map - a mapping between GraphQL scalar name and the parsed mapper object,
 * including all required information for generting code for that mapping.
 */
export type ParsedScalarsMap = { [name: string]: ParsedMapper };
/**
 * A raw configuration for enumValues map - can be represented with a single string value for a file path,
 * a map between enum name and a file path, or a map between enum name and an object with explicit enum values.
 */
export type EnumValuesMap<AdditionalProps = {}> =
  | string
  | { [enumName: string]: string | ({ [key: string]: string | number } & AdditionalProps) };
export type ParsedEnumValuesMap = {
  [enumName: string]: {
    // If values are explictly set, this will include the mapped values
    mappedValues?: { [valueName: string]: string | number };
    // The GraphQL enum name
    typeIdentifier: string;
    // The actual identifier that you should use in the code (original or aliased)
    sourceIdentifier?: string;
    // In case of external enum, this will contain the source file path
    sourceFile?: string;
    // If the identifier is external (imported) - this will contain the imported expression (including alias), otherwise null
    importIdentifier?: string;
    // Is defualt import is used to import the enum
    isDefault?: boolean;
  };
};
export type ConvertNameFn<T = {}> = ConvertFn<T>;
export type GetFragmentSuffixFn = (node: FragmentDefinitionNode | string) => string;

export interface ConvertOptions {
  prefix?: string;
  suffix?: string;
  transformUnderscore?: boolean;
}

export type ConvertFn<T = {}> = (node: ASTNode | string, options?: ConvertOptions & T) => string;
export type NamingConventionFn = (str: string) => string;
export type NamingConventionResolvePath = string;
export type NamingConvention = string | NamingConventionFn | NamingConventionMap;

/**
 * @additionalProperties false
 */
export interface NamingConventionMap {
  enumValues?: 'keep' | NamingConventionResolvePath | NamingConventionFn;
  typeNames?: 'keep' | NamingConventionResolvePath | NamingConventionFn;
  transformUnderscore?: boolean;
}

export type LoadedFragment<AdditionalFields = {}> = {
  name: string;
  onType: string;
  node: FragmentDefinitionNode;
  isExternal: boolean;
  importFrom?: string | null;
} & AdditionalFields;

export type DeclarationKind = 'type' | 'interface' | 'class' | 'abstract class';

export interface DeclarationKindConfig {
  directive?: DeclarationKind;
  scalar?: DeclarationKind;
  input?: DeclarationKind;
  type?: DeclarationKind;
  interface?: DeclarationKind;
  arguments?: DeclarationKind;
}

export interface AvoidOptionalsConfig {
  field?: boolean;
  object?: boolean;
  inputValue?: boolean;
  defaultValue?: boolean;
  resolvers?: boolean;
}

export interface ParsedImport {
  moduleName: string | null;
  propName: string;
}
