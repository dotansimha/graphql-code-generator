import { ASTNode, FragmentDefinitionNode } from 'graphql';

export type ScalarsMap = { [name: string]: string };
export type EnumValuesMap<AdditionalProps = {}> = string | { [enumName: string]: string | ({ [key: string]: string } & AdditionalProps) };
export type ParsedEnumValuesMap = { [enumName: string]: { mappedValues?: { [valueName: string]: string }; typeIdentifier: string; sourceIdentifier?: string; sourceFile?: string } };
export type ConvertNameFn<T = {}> = ConvertFn<T>;

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

export type LoadedFragment<AdditionalFields = {}> = { name: string; onType: string; node: FragmentDefinitionNode; isExternal: boolean; importFrom?: string | null } & AdditionalFields;

export type DeclarationKind = 'type' | 'interface' | 'class' | 'abstract class';

export interface DeclarationKindConfig {
  scalar?: DeclarationKind;
  input?: DeclarationKind;
  type?: DeclarationKind;
  interface?: DeclarationKind;
  arguments?: DeclarationKind;
}
