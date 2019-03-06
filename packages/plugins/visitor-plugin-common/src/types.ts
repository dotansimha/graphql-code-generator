import { ASTNode } from 'graphql';

export type ScalarsMap = { [name: string]: string };
export type EnumValuesMap = { [key: string]: string };
export type ConvertNameFn<T = {}> = ConvertFn<T>;

export interface ConvertOptions {
  prefix?: string;
  suffix?: string;
}
export type ConvertFn<T = {}> = (node: ASTNode | string, options?: ConvertOptions & T) => string;
export type NamingConventionResolvePath = string; // module-name#exportedFunction
export type NamingConvention = string | NamingConventionMap;
export interface NamingConventionMap {
  enumValues?: 'keep' | NamingConventionResolvePath | Function;
  typeNames?: 'keep' | NamingConventionResolvePath | Function;
}
