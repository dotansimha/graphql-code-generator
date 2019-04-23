import { ScalarsMap, NamingConvention, ConvertFn, ConvertOptions } from './types';
import { DeclarationBlockConfig } from './utils';
import * as autoBind from 'auto-bind';
import { DEFAULT_SCALARS } from './scalars';
import { convertFactory } from './naming';
import { ASTNode } from 'graphql';

export interface BaseVisitorConvertOptions {
  useTypesPrefix?: boolean;
}

export interface ParsedConfig {
  scalars: ScalarsMap;
  convert: ConvertFn;
  typesPrefix: string;
  addTypename: boolean;
}

export interface RawConfig {
  /**
   * @name scalars
   * @type ScalarsMap
   * @description Extends or overrides the built-in scalars and custom GraphQL scalars to a custom type.
   *
   * @example
   * ```yml
   * config:
   *   scalars:
   *     DateTime: Date
   *     JSON: { [key: string]: any }
   * ```
   */
  scalars?: ScalarsMap;
  /**
   * @name namingConvention
   * @type NamingConvention
   * @default change-case#pascalCase
   * @description Allow you to ovderride the naming convention of the output.
   * You can either override all namings, or specify an object with specific custom naming convention per output.
   * The format of the converter must be a valid `module#method`.
   * Allowed values for specific output are: `typeNames`, `enumValues`.
   * You can also use "keep" to keep all GraphQL names as-is.
   * Additionally you can set `transformUndersocre` to `true` if you want do override the default behaviour,
   * which is to preserver underscores.
   *
   * @example Override All Names
   * ```yml
   * config:
   *   namingConvention: change-case#lowerCase
   * ```
   * @example Upper-case enum values
   * ```yml
   * config:
   *   namingConvention:
   *     typeNames: change-case#pascalCase
   *     enumValues: change-case#upperCase
   * ```
   * @example Keep
   * ```yml
   * config:
   *   namingConvention: keep
   * ```
   * @example Transform Underscores
   * ```yml
   * config:
   *   typeNames: change-case#pascalCase
   *   transformUnderscore: true
   * ```
   */
  namingConvention?: NamingConvention;
  /**
   * @name typesPrefix
   * @type string
   * @default ""
   * @description Prefixes all the generated types.
   *
   * @example Add "I" Prefix
   * ```yml
   * config:
   *   typesPrefix: I
   * ```
   */
  typesPrefix?: string;

  /**
   * @name skipTypename
   * @type boolean
   * @default false
   * @description Automatically adds `__typename` field to the generated types, even when they are not specified
   * in the selection set.
   *
   * @example
   * ```yml
   * config:
   *   skipTypename: true
   * ```
   */
  skipTypename?: boolean;
}

export class BaseVisitor<TRawConfig extends RawConfig = RawConfig, TPluginConfig extends ParsedConfig = ParsedConfig> {
  protected _parsedConfig: TPluginConfig;
  protected _declarationBlockConfig: DeclarationBlockConfig = {};

  constructor(rawConfig: TRawConfig, additionalConfig: Partial<TPluginConfig>, defaultScalars: ScalarsMap = DEFAULT_SCALARS) {
    this._parsedConfig = {
      scalars: { ...(defaultScalars || DEFAULT_SCALARS), ...(rawConfig.scalars || {}) },
      convert: convertFactory(rawConfig),
      typesPrefix: rawConfig.typesPrefix || '',
      addTypename: !rawConfig.skipTypename,
      ...((additionalConfig || {}) as any),
    };

    autoBind(this);
  }

  get config(): TPluginConfig {
    return this._parsedConfig;
  }

  get scalars(): ScalarsMap {
    return this.config.scalars;
  }

  public convertName(node: ASTNode | string, options?: BaseVisitorConvertOptions & ConvertOptions): string {
    const useTypesPrefix = typeof (options && options.useTypesPrefix) === 'boolean' ? options.useTypesPrefix : true;

    return (useTypesPrefix ? this.config.typesPrefix : '') + this.config.convert(node, options);
  }
}
