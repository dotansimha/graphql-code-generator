import autoBind from 'auto-bind';
import { ASTNode, FragmentDefinitionNode, OperationDefinitionNode } from 'graphql';
import { FragmentImport, ImportDeclaration } from './imports.js';
import { convertFactory } from './naming.js';
import {
  ConvertFn,
  ConvertOptions,
  DeclarationKind,
  LoadedFragment,
  NamingConvention,
  NormalizedScalarsMap,
  ParsedScalarsMap,
  ScalarsMap,
} from './types.js';
import { DeclarationBlockConfig } from './utils.js';

export interface BaseVisitorConvertOptions {
  useTypesPrefix?: boolean;
  useTypesSuffix?: boolean;
}

export type InlineFragmentTypeOptions = 'inline' | 'combine' | 'mask';

export interface ParsedConfig {
  scalars: ParsedScalarsMap;
  convert: ConvertFn;
  typesPrefix: string;
  typesSuffix: string;
  addTypename: boolean;
  nonOptionalTypename: boolean;
  extractAllFieldsToTypes: boolean;
  externalFragments: LoadedFragment[];
  fragmentImports: ImportDeclaration<FragmentImport>[];
  immutableTypes: boolean;
  useTypeImports: boolean;
  allowEnumStringTypes: boolean;
  inlineFragmentTypes: InlineFragmentTypeOptions;
  emitLegacyCommonJSImports: boolean;
  printFieldsOnNewLines: boolean;
  includeExternalFragments: boolean;
}

export interface RawConfig {
  /**
   * @description Makes scalars strict.
   *
   * If scalars are found in the schema that are not defined in `scalars`
   * an error will be thrown during codegen.
   * @default false
   *
   * @exampleMarkdown
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file': {
   *        // plugins...
   *        config: {
   *          strictScalars: true,
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  strictScalars?: boolean;
  /**
   * @description Allows you to override the type that unknown scalars will have.
   * @default any
   *
   * @exampleMarkdown
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file': {
   *        // plugins...
   *        config: {
   *          defaultScalarType: 'unknown'
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  defaultScalarType?: string;
  /**
   * @description Extends or overrides the built-in scalars and custom GraphQL scalars to a custom type.
   *
   * @exampleMarkdown
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file': {
   *        // plugins...
   *        config: {
   *          scalars: {
   *            ID: {
   *              input: 'string',
   *              output: 'string | number'
   *            }
   *            DateTime: 'Date',
   *            JSON: '{ [key: string]: any }',
   *          }
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  scalars?: ScalarsMap;
  /**
   * @default change-case-all#pascalCase
   * @description Allow you to override the naming convention of the output.
   * You can either override all namings, or specify an object with specific custom naming convention per output.
   * The format of the converter must be a valid `module#method`.
   * Allowed values for specific output are: `typeNames`, `enumValues`.
   * You can also use "keep" to keep all GraphQL names as-is.
   * Additionally, you can set `transformUnderscore` to `true` if you want to override the default behavior,
   * which is to preserve underscores.
   *
   * Available case functions in `change-case-all` are `camelCase`, `capitalCase`, `constantCase`, `dotCase`, `headerCase`, `noCase`, `paramCase`, `pascalCase`, `pathCase`, `sentenceCase`, `snakeCase`, `lowerCase`, `localeLowerCase`, `lowerCaseFirst`, `spongeCase`, `titleCase`, `upperCase`, `localeUpperCase` and `upperCaseFirst`
   * [See more](https://github.com/btxtiger/change-case-all)
   *
   * @exampleMarkdown
   * ## Override All Names
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file': {
   *        // plugins...
   *        config: {
   *          namingConvention: 'change-case-all#lowerCase',
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   *
   * ## Upper-case enum values
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file': {
   *        // plugins...
   *        config: {
   *          namingConvention: {
   *            typeNames: 'change-case-all#pascalCase',
   *            enumValues: 'change-case-all#upperCase',
   *          }
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   *
   * ## Keep names as is
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file': {
   *        // plugins...
   *        config: {
   *         namingConvention: 'keep',
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   *
   * ## Remove Underscores
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file': {
   *        // plugins...
   *        config: {
   *          namingConvention: {
   *            typeNames: 'change-case-all#pascalCase',
   *            transformUnderscore: true
   *          }
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  namingConvention?: NamingConvention;
  /**
   * @default ""
   * @description Prefixes all the generated types.
   *
   * @exampleMarkdown
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file': {
   *        // plugins...
   *        config: {
   *          typesPrefix: 'I',
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  typesPrefix?: string;
  /**
   * @default ""
   * @description Suffixes all the generated types.
   *
   * @exampleMarkdown
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file': {
   *        // plugins...
   *        config: {
   *          typesSuffix: 'I',
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  typesSuffix?: string;
  /**
   * @default false
   * @description Does not add `__typename` to the generated types, unless it was specified in the selection set.
   *
   * @exampleMarkdown
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file': {
   *        // plugins...
   *        config: {
   *          skipTypename: true
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  skipTypename?: boolean;
  /**
   * @default false
   * @description Automatically adds `__typename` field to the generated types, even when they are not specified
   * in the selection set, and makes it non-optional
   *
   * @exampleMarkdown
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file': {
   *        // plugins...
   *        config: {
   *          nonOptionalTypename: true
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  nonOptionalTypename?: boolean;
  /**
   * @name useTypeImports
   * @type boolean
   * @default false
   * @description Will use `import type {}` rather than `import {}` when importing only types. This gives
   * compatibility with TypeScript's "importsNotUsedAsValues": "error" option
   *
   * @exampleMarkdown
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file': {
   *        // plugins...
   *        config: {
   *          useTypeImports: true
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  useTypeImports?: boolean;

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
  /**
   * @ignore
   */
  allowEnumStringTypes?: boolean;
  /**
   * @description Whether fragment types should be inlined into other operations.
   * "inline" is the default behavior and will perform deep inlining fragment types within operation type definitions.
   * "combine" is the previous behavior that uses fragment type references without inlining the types (and might cause issues with deeply nested fragment that uses list types).
   * "mask" transforms the types for use with fragment masking. Useful when masked types are needed when not using the "client" preset e.g. such as combining it with Apollo Client's data masking feature.
   *
   * @type string
   * @default inline
   */
  inlineFragmentTypes?: InlineFragmentTypeOptions;
  /**
   * @default true
   * @description Emit legacy common js imports.
   * Default it will be `true` this way it ensure that generated code works with [non-compliant bundlers](https://github.com/dotansimha/graphql-code-generator/issues/8065).
   */
  emitLegacyCommonJSImports?: boolean;

  /**
   * @default false
   * @description Extract all field types to their own types, instead of inlining them.
   * This helps to reduce type duplication, and makes type errors more readable.
   * It can also significantly reduce the size of the generated code, the generation time,
   * and the typechecking time.
   */
  extractAllFieldsToTypes?: boolean;

  /**
   * @default false
   * @description If you prefer to have each field in generated types printed on a new line, set this to true.
   * This can be useful for improving readability of the resulting types,
   * without resorting to running tools like Prettier on the output.
   */
  printFieldsOnNewLines?: boolean;

  /**
   * @default false
   * @description Whether to include external fragments in the generated code. External fragments are not defined
   * in the same location as the operation definition.
   */
  includeExternalFragments?: boolean;
}

export class BaseVisitor<TRawConfig extends RawConfig = RawConfig, TPluginConfig extends ParsedConfig = ParsedConfig> {
  protected _parsedConfig: TPluginConfig;
  protected _declarationBlockConfig: DeclarationBlockConfig = {};
  public readonly scalars: NormalizedScalarsMap;

  constructor(rawConfig: TRawConfig, additionalConfig: Partial<TPluginConfig>) {
    this._parsedConfig = {
      convert: convertFactory(rawConfig),
      typesPrefix: rawConfig.typesPrefix || '',
      typesSuffix: rawConfig.typesSuffix || '',
      externalFragments: rawConfig.externalFragments || [],
      fragmentImports: rawConfig.fragmentImports || [],
      addTypename: !rawConfig.skipTypename,
      nonOptionalTypename: !!rawConfig.nonOptionalTypename,
      useTypeImports: !!rawConfig.useTypeImports,
      allowEnumStringTypes: !!rawConfig.allowEnumStringTypes,
      inlineFragmentTypes: rawConfig.inlineFragmentTypes ?? 'inline',
      emitLegacyCommonJSImports:
        rawConfig.emitLegacyCommonJSImports === undefined ? true : !!rawConfig.emitLegacyCommonJSImports,
      extractAllFieldsToTypes: rawConfig.extractAllFieldsToTypes ?? false,
      printFieldsOnNewLines: rawConfig.printFieldsOnNewLines ?? false,
      includeExternalFragments: rawConfig.includeExternalFragments ?? false,
      ...((additionalConfig || {}) as any),
    };

    this.scalars = {};
    for (const key of Object.keys(this.config.scalars || {})) {
      this.scalars[key] = {
        input: this.config.scalars[key]?.input?.type,
        output: this.config.scalars[key]?.output?.type,
      };
    }

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
    const useTypesPrefix = typeof options?.useTypesPrefix === 'boolean' ? options.useTypesPrefix : true;
    const useTypesSuffix = typeof options?.useTypesSuffix === 'boolean' ? options.useTypesSuffix : true;

    let convertedName = '';

    if (useTypesPrefix) {
      convertedName += this.config.typesPrefix;
    }

    convertedName += this.config.convert(node, options);

    if (useTypesSuffix) {
      convertedName += this.config.typesSuffix;
    }

    return convertedName;
  }

  public getOperationSuffix(
    node: FragmentDefinitionNode | OperationDefinitionNode | string,
    operationType: string
  ): string {
    const { omitOperationSuffix = false, dedupeOperationSuffix = false } = this.config as { [key: string]: any };
    const operationName = typeof node === 'string' ? node : node.name ? node.name.value : '';
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

  protected getPunctuation(_declarationKind: DeclarationKind): string {
    return '';
  }
}
