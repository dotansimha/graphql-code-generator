import { ASTNode, FragmentDefinitionNode } from 'graphql';
import { ParsedMapper } from './mappers';

export type ScalarsMap = string | { [name: string]: string };
export type NormalizedScalarsMap = { [name: string]: string };
export type ParsedScalarsMap = { [name: string]: ParsedMapper };
export type EnumValuesMap<AdditionalProps = {}> =
  | string
  | { [enumName: string]: string | ({ [key: string]: string | number } & AdditionalProps) };
export type ParsedEnumValuesMap = {
  [enumName: string]: {
    mappedValues?: { [valueName: string]: string | number };
    typeIdentifier: string;
    sourceIdentifier?: string;
    sourceFile?: string;
    isDefault?: boolean;
  };
};
export type ConvertNameFn<T = {}> = ConvertFn<T>;
export type GetFragmentSuffixFn = (node: FragmentDefinitionNode | string, suffix?: string) => string;

export interface ConvertOptions {
  prefix?: string;
  suffix?: string;
  transformUnderscore?: boolean;
}

export type ConvertFn<T = {}> = (node: ASTNode | string, options?: ConvertOptions & T) => string;
export type NamingConventionResolvePath = string; // module-name#exportedFunction
export type NamingConvention = string | Function | NamingConventionMap;

export interface NamingConventionMap {
  enumValues?: 'keep' | NamingConventionResolvePath | Function;
  typeNames?: 'keep' | NamingConventionResolvePath | Function;
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
  scalar?: DeclarationKind;
  input?: DeclarationKind;
  type?: DeclarationKind;
  interface?: DeclarationKind;
  arguments?: DeclarationKind;
}
