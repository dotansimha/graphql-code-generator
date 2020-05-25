import {
  ScalarsMap,
  ParsedScalarsMap,
  NamingConvention,
  ConvertFn,
  ConvertOptions,
  LoadedFragment,
  NormalizedScalarsMap,
  DeclarationKind,
} from './types';
import { DeclarationBlockConfig } from './utils';
import autoBind from 'auto-bind';
import { convertFactory } from './naming';
import { ASTNode, FragmentDefinitionNode, OperationDefinitionNode } from 'graphql';
import { ImportDeclaration, FragmentImport } from './imports';

export interface BaseVisitorConvertOptions {
  useTypesPrefix?: boolean;
}

export interface ParsedConfig {
  scalars: ParsedScalarsMap;
  convert: ConvertFn;
  typesPrefix: string;
  addTypename: boolean;
  nonOptionalTypename: boolean;
  externalFragments: LoadedFragment[];
  fragmentImports: ImportDeclaration<FragmentImport>[];
  immutableTypes: boolean;
}

export interface RawConfig {
  /**
   * @description Extends or overrides the built-in scalars and custom GraphQL scalars to a custom type.
   *
   * @examples
   * ```yml
   * config:
   *   scalars:
   *     DateTime: Date
   *     JSON: "{ [key: string]: any }"
   * ```
   */
  scalars?: ScalarsMap;
  /**
   * @default pascal-case#pascalCase
   * @description Allow you to override the naming convention of the output.
   * You can either override all namings, or specify an object with specific custom naming convention per output.
   * The format of the converter must be a valid `module#method`.
   * Allowed values for specific output are: `typeNames`, `enumValues`.
   * You can also use "keep" to keep all GraphQL names as-is.
   * Additionally you can set `transformUnderscore` to `true` if you want to override the default behavior,
   * which is to preserves underscores.
   *
   * @examples
   * ## Override All Names
   * ```yml
   * config:
   *   namingConvention: lower-case#lowerCase
   * ```
   *
   * ## Upper-case enum values
   * ```yml
   * config:
   *   namingConvention:
   *     typeNames: pascal-case#pascalCase
   *     enumValues: upper-case#upperCase
   * ```
   *
   * ## Keep names as is
   * ```yml
   * config:
   *   namingConvention: keep
   * ```
   *
   * ## Remove Underscores
   * ```yml
   * config:
   *   namingConvention:
   *     typeNames: pascal-case#pascalCase
   *     transformUnderscore: true
   * ```
   */
  namingConvention?: NamingConvention;
  /**
   * @default ""
   * @description Prefixes all the generated types.
   *
   * @examples
   * ```yml
   * config:
   *   typesPrefix: I
   * ```
   */
  typesPrefix?: string;
  /**
   * @default false
   * @description Does not add __typename to the generated types, unless it was specified in the selection set.
   *
   * @examples
   * ```yml
   * config:
   *   skipTypename: true
   * ```
   */
  skipTypename?: boolean;
  /**
   * @default false
   * @description Automatically adds `__typename` field to the generated types, even when they are not specified
   * in the selection set, and makes it non-optional
   *
   * @examples
   * ```yml
   * config:
   *   nonOptionalTypename: true
   * ```
   */
  nonOptionalTypename?: boolean;

  /* The following configuration are for preset configuration and should not be set manually (for most use cases...) */
  /**
   * @ignore
   */
  externalFragments?: LoadedFragment[];
  /**
   * @ignore
   */
  fragmentImports?: ImportDeclaration<FragmentImport>[];
  /**
   * @ignore
   */
  globalNamespace?: boolean;
}

export class BaseVisitor<TRawConfig extends RawConfig = RawConfig, TPluginConfig extends ParsedConfig = ParsedConfig> {
  protected _parsedConfig: TPluginConfig;
  protected _declarationBlockConfig: DeclarationBlockConfig = {};
  public readonly scalars: NormalizedScalarsMap;

  constructor(rawConfig: TRawConfig, additionalConfig: Partial<TPluginConfig>) {
    this._parsedConfig = {
      convert: convertFactory(rawConfig),
      typesPrefix: rawConfig.typesPrefix || '',
      externalFragments: rawConfig.externalFragments || [],
      fragmentImports: rawConfig.fragmentImports || [],
      addTypename: !rawConfig.skipTypename,
      nonOptionalTypename: !!rawConfig.nonOptionalTypename,
      ...((additionalConfig || {}) as any),
    };

    this.scalars = {};
    Object.keys(this.config.scalars || {}).forEach(key => {
      this.scalars[key] = this.config.scalars[key].type;
    });

    autoBind(this);
  }

  protected getVisitorKindContextFromAncestors(ancestors: ASTNode[]): string[] {
    if (!ancestors) {
      return [];
    }

    return ancestors.map(t => t.kind).filter(Boolean);
  }

  get config(): TPluginConfig {
    return this._parsedConfig;
  }

  public convertName(node: ASTNode | string, options?: BaseVisitorConvertOptions & ConvertOptions): string {
    const useTypesPrefix = typeof (options && options.useTypesPrefix) === 'boolean' ? options.useTypesPrefix : true;

    return (useTypesPrefix ? this.config.typesPrefix : '') + this.config.convert(node, options);
  }

  public getOperationSuffix(
    node: FragmentDefinitionNode | OperationDefinitionNode | string,
    operationType: string
  ): string {
    const { omitOperationSuffix = false, dedupeOperationSuffix = false } = this.config as { [key: string]: any };
    const operationName = typeof node === 'string' ? node : node.name.value;
    return omitOperationSuffix
      ? ''
      : dedupeOperationSuffix && operationName.toLowerCase().endsWith(operationType.toLowerCase())
      ? ''
      : operationType;
  }

  public getFragmentSuffix(node: FragmentDefinitionNode | string): string {
    return this.getOperationSuffix(node, 'Fragment');
  }

  public getFragmentName(node: FragmentDefinitionNode | string): string {
    return this.convertName(node, {
      suffix: this.getFragmentSuffix(node),
      useTypesPrefix: false,
    });
  }

  public getFragmentVariableName(node: FragmentDefinitionNode | string): string {
    const {
      omitOperationSuffix = false,
      dedupeOperationSuffix = false,
      fragmentVariableSuffix = 'FragmentDoc',
      fragmentVariablePrefix = '',
    } = this.config as { [key: string]: any };

    const fragmentName = typeof node === 'string' ? node : node.name.value;
    const suffix = omitOperationSuffix
      ? ''
      : dedupeOperationSuffix &&
        fragmentName.toLowerCase().endsWith('fragment') &&
        fragmentVariableSuffix.toLowerCase().startsWith('fragment')
      ? fragmentVariableSuffix.substring('fragment'.length)
      : fragmentVariableSuffix;

    return this.convertName(node, {
      prefix: fragmentVariablePrefix,
      suffix,
      useTypesPrefix: false,
    });
  }

  protected getPunctuation(declarationKind: DeclarationKind): string {
    return '';
  }
}
