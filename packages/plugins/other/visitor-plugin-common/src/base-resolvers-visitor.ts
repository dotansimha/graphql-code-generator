import { ApolloFederation, type FederationMeta, getBaseType } from '@graphql-codegen/plugin-helpers';
import { getRootTypeNames } from '@graphql-tools/utils';
import autoBind from 'auto-bind';
import {
  ASTNode,
  DirectiveDefinitionNode,
  EnumTypeDefinitionNode,
  FieldDefinitionNode,
  GraphQLInterfaceType,
  GraphQLNamedType,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLUnionType,
  InputValueDefinitionNode,
  InterfaceTypeDefinitionNode,
  isEnumType,
  isInterfaceType,
  isNonNullType,
  isObjectType,
  isUnionType,
  ListTypeNode,
  NamedTypeNode,
  NonNullTypeNode,
  ObjectTypeDefinitionNode,
  ScalarTypeDefinitionNode,
  UnionTypeDefinitionNode,
} from 'graphql';
import { BaseVisitor, BaseVisitorConvertOptions, ParsedConfig, RawConfig } from './base-visitor.js';
import { parseEnumValues } from './enum-values.js';
import { buildMapperImport, ExternalParsedMapper, ParsedMapper, parseMapper, transformMappers } from './mappers.js';
import { DEFAULT_SCALARS } from './scalars.js';
import {
  AvoidOptionalsConfig,
  ConvertOptions,
  DeclarationKind,
  EnumValuesMap,
  NormalizedAvoidOptionalsConfig,
  NormalizedScalarsMap,
  ParsedEnumValuesMap,
  ResolversNonOptionalTypenameConfig,
} from './types.js';
import {
  buildScalarsFromConfig,
  DeclarationBlock,
  DeclarationBlockConfig,
  getBaseTypeNode,
  getConfigValue,
  indent,
  OMIT_TYPE,
  REQUIRE_FIELDS_TYPE,
  stripMapperTypeInterpolation,
  wrapTypeWithModifiers,
} from './utils.js';
import { OperationVariablesToObject } from './variables-to-object.js';
import { normalizeAvoidOptionals } from './avoid-optionals.js';

export interface ParsedResolversConfig extends ParsedConfig {
  contextType: ParsedMapper;
  fieldContextTypes: Array<string>;
  directiveContextTypes: Array<string>;
  rootValueType: ParsedMapper;
  mappers: {
    [typeName: string]: ParsedMapper;
  };
  defaultMapper: ParsedMapper | null;
  avoidOptionals: NormalizedAvoidOptionalsConfig;
  addUnderscoreToArgsType: boolean;
  addInterfaceFieldResolverTypes: boolean;
  enumValues: ParsedEnumValuesMap;
  resolverTypeWrapperSignature: string;
  federation: boolean;
  enumPrefix: boolean;
  enumSuffix: boolean;
  optionalResolveType: boolean;
  immutableTypes: boolean;
  namespacedImportName: string;
  resolverTypeSuffix: string;
  allResolversTypeName: string;
  internalResolversPrefix: string;
  directiveResolverMappings: Record<string, string>;
  resolversNonOptionalTypename: ResolversNonOptionalTypenameConfig;
  avoidCheckingAbstractTypesRecursively: boolean;
}

export interface FieldDefinitionResult {
  node: FieldDefinitionNode;
  printContent: FieldDefinitionPrintFn;
}

type FieldDefinitionPrintFn = (
  parentNode: ObjectTypeDefinitionNode | InterfaceTypeDefinitionNode,
  avoidResolverOptionals: boolean
) => { value: string | null; meta: { federation?: { isResolveReference: boolean } } };
export interface RootResolver {
  content: string;
  generatedResolverTypes: {
    resolversMap: { name: string };
    userDefined: Record<
      string,
      {
        name: string;
        hasIsTypeOf: boolean;
        federation?: { hasResolveReference: boolean };
      }
    >;
  };
}

export interface RawResolversConfig extends RawConfig {
  /**
   * @description Adds `_` to generated `Args` types in order to avoid duplicate identifiers.
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
   *          addUnderscoreToArgsType: true
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   *
   */
  addUnderscoreToArgsType?: boolean;
  /**
   * @description Use this configuration to set a custom type for your `context`, and it will
   * affect all the resolvers, without the need to override it using generics each time.
   * If you wish to use an external type and import it from another file, you can use `add` plugin
   * and add the required `import` statement, or you can use a `module#type` syntax.
   *
   * @exampleMarkdown
   * ## Custom Context Type
   *
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file': {
   *        // plugins...
   *        config: {
   *          contextType: 'MyContext'
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   *
   * ## Custom Context Type by Path
   *
   * Note that the path should be relative to the generated file.
   *
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file': {
   *        // plugins...
   *        config: {
   *          contextType: './my-types#MyContext'
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  contextType?: string;
  /**
   * @description Use this to set a custom type for a specific field `context`.
   * It will only affect the targeted resolvers.
   * You can either use `Field.Path#ContextTypeName` or `Field.Path#ExternalFileName#ContextTypeName`
   *
   * @exampleMarkdown
   * ## Custom Field Context Types
   *
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file': {
   *        // plugins...
   *        config: {
   *          fieldContextTypes: ['MyType.foo#CustomContextType', 'MyType.bar#./my-file#ContextTypeOne']
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   *
   */
  fieldContextTypes?: Array<string>;
  /**
   * @description Use this configuration to set a custom type for the `rootValue`, and it will
   * affect resolvers of all root types (Query, Mutation and Subscription), without the need to override it using generics each time.
   * If you wish to use an external type and import it from another file, you can use `add` plugin
   * and add the required `import` statement, or you can use both `module#type` or `module#namespace#type` syntax.
   *
   * @exampleMarkdown
   * ## Custom RootValue Type
   *
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file': {
   *        // plugins...
   *        config: {
   *          rootValueType: 'MyRootValue'
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   *
   * ## Custom RootValue Type
   *
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file': {
   *        // plugins...
   *        config: {
   *          rootValueType: './my-types#MyRootValue'
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  rootValueType?: string;
  /**
   * @description Use this to set a custom type for a specific field `context` decorated by a directive.
   * It will only affect the targeted resolvers.
   * You can either use `Field.Path#ContextTypeName` or `Field.Path#ExternalFileName#ContextTypeName`
   *
   * ContextTypeName should by a generic Type that take the context or field context type as only type parameter.
   *
   * @exampleMarkdown
   * ## Directive Context Extender
   *
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file': {
   *        // plugins...
   *        config: {
   *          directiveContextTypes: ['myCustomDirectiveName#./my-file#CustomContextExtender']
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   *
   */
  directiveContextTypes?: Array<string>;
  /**
   * @description Adds a suffix to the imported names to prevent name clashes.
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
   *          mapperTypeSuffix: 'Model'
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  mapperTypeSuffix?: string;
  /**
   * @description Replaces a GraphQL type usage with a custom type, allowing you to return custom object from
   * your resolvers.
   * You can use both `module#type` and `module#namespace#type` syntax.
   *
   * @exampleMarkdown
   * ## Custom Context Type
   *
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file': {
   *        // plugins...
   *        config: {
   *          mappers: {
   *            User: './my-models#UserDbObject',
   *            Book: './my-models#Collections',
   *          }
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  mappers?: { [typeName: string]: string };
  /**
   * @description Allow you to set the default mapper when it's not being override by `mappers` or generics.
   * You can specify a type name, or specify a string in `module#type` or `module#namespace#type` format.
   * The default value of mappers is the TypeScript type generated by `typescript` package.
   *
   * @exampleMarkdown
   * ## Replace with any
   *
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file': {
   *        // plugins...
   *        config: {
   *          defaultMapper: 'any',
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   *
   * ## Custom Base Object
   *
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file': {
   *        // plugins...
   *        config: {
   *          defaultMapper: './my-file#BaseObject',
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   *
   * ## Wrap default types with Partial
   *
   * You can also specify a custom wrapper for the original type, without overriding the original generated types, use `{T}` to specify the identifier. (for flow, use `$Shape<{T}>`)
   *
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file': {
   *        // plugins...
   *        config: {
   *          defaultMapper: 'Partial<{T}>',
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   *
   * ## Allow deep partial with `utility-types`
   *
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file': {
   *        plugins: ['typescript', 'typescript-resolver', { add: { content: "import { DeepPartial } from 'utility-types';" } }],
   *        config: {
   *          defaultMapper: 'DeepPartial<{T}>',
   *          avoidCheckingAbstractTypesRecursively: true // required if you have complex nested abstract types
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  defaultMapper?: string;
  /**
   * @description This will cause the generator to avoid using optionals (`?`),
   * so all field resolvers must be implemented in order to avoid compilation errors.
   * @default false
   *
   * @exampleMarkdown
   * ## Override all definition types
   *
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file': {
   *        plugins: ['typescript', 'typescript-resolver'],
   *        config: {
   *          avoidOptionals: true
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   *
   * ## Override only specific definition types
   *
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file': {
   *        plugins: ['typescript', 'typescript-resolver'],
   *        config: {
   *          avoidOptionals: {
   *            field: true,
   *            inputValue: true,
   *            object: true,
   *            defaultValue: true,
   *            query: true,
   *            mutation: true,
   *            subscription: true,
   *          }
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  avoidOptionals?: boolean | AvoidOptionalsConfig;
  /**
   * @description Warns about unused mappers.
   * @default true
   *
   * @exampleMarkdown
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file': {
   *        plugins: ['typescript', 'typescript-resolver'],
   *        config: {
   *          showUnusedMappers: true,
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  showUnusedMappers?: boolean;
  /**
   * @description Overrides the default value of enum values declared in your GraphQL schema, supported
   * in this plugin because of the need for integration with `typescript` package.
   * See documentation under `typescript` plugin for more information and examples.
   */
  enumValues?: EnumValuesMap;
  /**
   * @default Promise<T> | T
   * @description Allow you to override `resolverTypeWrapper` definition.
   */
  resolverTypeWrapperSignature?: string;
  /**
   * @default false
   * @description Supports Apollo Federation
   */
  federation?: boolean;
  /**
   * @default true
   * @description Allow you to disable prefixing for generated enums, works in combination with `typesPrefix`.
   *
   * @exampleMarkdown
   * ## Disable enum prefixes
   *
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file': {
   *        plugins: ['typescript', 'typescript-resolver'],
   *        config: {
   *          typesPrefix: 'I',
   *          enumPrefix: false
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  enumPrefix?: boolean;

  /**
   * @default true
   * @description Allow you to disable suffixing for generated enums, works in combination with `typesSuffix`.
   *
   * @exampleMarkdown
   * ## Disable enum suffixes
   *
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file': {
   *        plugins: ['typescript', 'typescript-resolver'],
   *        config: {
   *          typesSuffix: 'I',
   *          enumSuffix: false
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  enumSuffix?: boolean;
  /**
   * @description Configures behavior for custom directives from various GraphQL libraries.
   * @exampleMarkdown
   * ## `@semanticNonNull`
   * First, install `graphql-sock` peer dependency:
   *
   * ```sh npm2yarn
   * npm install -D graphql-sock
   * ```
   *
   * Now, you can enable support for `@semanticNonNull` directive:
   *
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file.ts': {
   *        plugins: ['typescript-resolvers'],
   *        config: {
   *          customDirectives: {
   *            semanticNonNull: true
   *          }
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  customDirectives?: {
    semanticNonNull?: boolean;
  };
  /**
   * @default false
   * @description Sets the `__resolveType` field as optional field.
   */
  optionalResolveType?: boolean;
  /**
   * @default false
   * @description Generates immutable types by adding `readonly` to properties and uses `ReadonlyArray`.
   */
  immutableTypes?: boolean;
  /**
   * @default ''
   * @description Prefixes all GraphQL related generated types with that value, as namespaces import.
   * You can use this feature to allow separation of plugins to different files.
   */
  namespacedImportName?: string;
  /**
   * @default Resolvers
   * @description Suffix we add to each generated type resolver.
   */
  resolverTypeSuffix?: string;
  /**
   * @default Resolvers
   * @description The type name to use when exporting all resolvers signature as unified type.
   */
  allResolversTypeName?: string;
  /**
   * @type string
   * @default '__'
   * @description Defines the prefix value used for `__resolveType` and `__isTypeOf` resolvers.
   * If you are using `mercurius-js`, please set this field to empty string for better compatibility.
   */
  internalResolversPrefix?: string;
  /**
   * @description Makes `__typename` of resolver mappings non-optional without affecting the base types.
   * @default false
   *
   * @exampleMarkdown
   * ## Enable for all
   *
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file': {
   *        plugins: ['typescript', 'typescript-resolver'],
   *        config: {
   *          resolversNonOptionalTypename: true // or { unionMember: true, interfaceImplementingType: true }
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   *
   * ## Enable except for some types
   *
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file': {
   *        plugins: ['typescript', 'typescript-resolver'],
   *        config: {
   *          resolversNonOptionalTypename: {
   *            unionMember: true,
   *            interfaceImplementingType: true,
   *            excludeTypes: ['MyType'],
   *          }
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  resolversNonOptionalTypename?: boolean | ResolversNonOptionalTypenameConfig;
  /**
   * @type boolean
   * @default false
   * @description If true, recursively goes through all object type's fields, checks if they have abstract types and generates expected types correctly.
   * This may not work for cases where provided default mapper types are also nested e.g. `defaultMapper: DeepPartial<{T}>` or `defaultMapper: Partial<{T}>`.
   */
  avoidCheckingAbstractTypesRecursively?: boolean;
  /**
   * @description If true, add field resolver types to Interfaces.
   * By default, GraphQL Interfaces do not trigger any field resolvers,
   * meaning every implementing type must implement the same resolver for the shared fields.
   *
   * Some tools provide a way to change the default behaviour by making GraphQL Objects inherit
   * missing resolvers from their Interface types. In these cases, it is fine to turn this option to true.
   *
   * For example, if you are using `@graphql-tools/schema#makeExecutableSchema` with `inheritResolversFromInterfaces: true`,
   * you can make `addInterfaceFieldResolverTypes: true` as well
   * https://the-guild.dev/graphql/tools/docs/generate-schema#makeexecutableschema
   *
   * @exampleMarkdown
   * ```ts filename="codegen.ts"
   * import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   * const config: CodegenConfig = {
   *   // ...
   *   generates: {
   *     'path/to/file': {
   *       plugins: ['typescript', 'typescript-resolver'],
   *       config: {
   *         addInterfaceFieldResolverTypes: true,
   *       },
   *     },
   *   },
   * };
   * export default config;
   * ```
   *
   * @type boolean
   * @default false
   */
  addInterfaceFieldResolverTypes?: boolean;
  /**
   * @ignore
   */
  directiveResolverMappings?: Record<string, string>;
}

export type ResolverTypes = { [gqlType: string]: string };
export type ResolverParentTypes = { [gqlType: string]: string };
export type GroupedMappers = Record<string, { identifier: string; asDefault?: boolean }[]>;
type FieldContextTypeMap = Record<string, ParsedMapper>;

export class BaseResolversVisitor<
  TRawConfig extends RawResolversConfig = RawResolversConfig,
  TPluginConfig extends ParsedResolversConfig = ParsedResolversConfig
> extends BaseVisitor<TRawConfig, TPluginConfig> {
  protected declare _parsedConfig: TPluginConfig;
  protected _declarationBlockConfig: DeclarationBlockConfig = {};
  protected _collectedResolvers: {
    [key: string]: {
      typename: string;
      baseGeneratedTypename?: string;
    };
  } = {};
  protected _parsedSchemaMeta: {
    types: {
      interface: Record<
        string,
        {
          type: GraphQLInterfaceType;
          implementingTypes: Record<string, GraphQLObjectType>;
        }
      >;
      union: Record<
        string,
        {
          type: GraphQLUnionType;
          unionMembers: Record<string, GraphQLObjectType>;
        }
      >;
    };
    typesWithIsTypeOf: Record<string, true>;
  } = {
    types: {
      interface: {},
      union: {},
    },
    typesWithIsTypeOf: {},
  };
  protected _collectedDirectiveResolvers: { [key: string]: string } = {};
  protected _variablesTransformer: OperationVariablesToObject;
  protected _usedMappers: { [key: string]: boolean } = {};
  protected _resolversTypes: ResolverTypes = {};
  protected _resolversParentTypes: ResolverParentTypes = {};
  protected _hasReferencedResolversUnionTypes = false;
  protected _hasReferencedResolversInterfaceTypes = false;
  protected _resolversUnionTypes: Record<string, string> = {};
  protected _resolversInterfaceTypes: Record<string, string> = {};
  protected _rootTypeNames = new Set<string>();
  protected _globalDeclarations = new Set<string>();
  protected _federation: ApolloFederation;
  protected _hasScalars = false;
  protected _fieldContextTypeMap: FieldContextTypeMap;
  protected _directiveContextTypesMap: FieldContextTypeMap;
  protected _checkedTypesWithNestedAbstractTypes: Record<string, { checkStatus: 'yes' | 'no' | 'checking' }> = {};
  private _directiveResolverMappings: Record<string, string>;
  private _shouldMapType: { [typeName: string]: boolean } = {};

  constructor(
    rawConfig: TRawConfig,
    additionalConfig: TPluginConfig,
    private _schema: GraphQLSchema,
    defaultScalars: NormalizedScalarsMap = DEFAULT_SCALARS,
    federationMeta: FederationMeta = {}
  ) {
    super(rawConfig, {
      immutableTypes: getConfigValue(rawConfig.immutableTypes, false),
      optionalResolveType: getConfigValue(rawConfig.optionalResolveType, false),
      enumPrefix: getConfigValue(rawConfig.enumPrefix, true),
      enumSuffix: getConfigValue(rawConfig.enumSuffix, true),
      federation: getConfigValue(rawConfig.federation, false),
      resolverTypeWrapperSignature: getConfigValue(rawConfig.resolverTypeWrapperSignature, 'Promise<T> | T'),
      enumValues: parseEnumValues({
        schema: _schema,
        mapOrStr: rawConfig.enumValues,
      }),
      addUnderscoreToArgsType: getConfigValue(rawConfig.addUnderscoreToArgsType, false),
      addInterfaceFieldResolverTypes: getConfigValue(rawConfig.addInterfaceFieldResolverTypes, false),
      contextType: parseMapper(rawConfig.contextType || 'any', 'ContextType'),
      fieldContextTypes: getConfigValue(rawConfig.fieldContextTypes, []),
      directiveContextTypes: getConfigValue(rawConfig.directiveContextTypes, []),
      resolverTypeSuffix: getConfigValue(rawConfig.resolverTypeSuffix, 'Resolvers'),
      allResolversTypeName: getConfigValue(rawConfig.allResolversTypeName, 'Resolvers'),
      rootValueType: parseMapper(rawConfig.rootValueType || 'Record<PropertyKey, never>', 'RootValueType'),
      namespacedImportName: getConfigValue(rawConfig.namespacedImportName, ''),
      avoidOptionals: normalizeAvoidOptionals(rawConfig.avoidOptionals),
      defaultMapper: rawConfig.defaultMapper
        ? parseMapper(rawConfig.defaultMapper || 'any', 'DefaultMapperType')
        : null,
      mappers: transformMappers(rawConfig.mappers || {}, rawConfig.mapperTypeSuffix),
      scalars: buildScalarsFromConfig(_schema, rawConfig, defaultScalars),
      internalResolversPrefix: getConfigValue(rawConfig.internalResolversPrefix, '__'),
      generateInternalResolversIfNeeded: {},
      resolversNonOptionalTypename: normalizeResolversNonOptionalTypename(
        getConfigValue(rawConfig.resolversNonOptionalTypename, false)
      ),
      avoidCheckingAbstractTypesRecursively: getConfigValue(rawConfig.avoidCheckingAbstractTypesRecursively, false),
      ...additionalConfig,
    } as TPluginConfig);

    autoBind(this);
    this._federation = new ApolloFederation({
      enabled: this.config.federation,
      schema: this.schema,
      meta: federationMeta,
    });
    this._rootTypeNames = getRootTypeNames(_schema);
    this._variablesTransformer = new OperationVariablesToObject(
      this.scalars,
      this.convertName,
      this.config.namespacedImportName
    );

    // 1. Parse schema meta at the start once,
    // so we can use it in subsequent generate functions
    this.parseSchemaMeta();

    // 2. Generate types for resolvers
    this._resolversTypes = this.createResolversFields({
      applyWrapper: type => this.applyResolverTypeWrapper(type),
      clearWrapper: type => this.clearResolverTypeWrapper(type),
      getTypeToUse: name => this.getTypeToUse(name),
      currentType: 'ResolversTypes',
      onNotMappedObjectType: ({ initialType }) => initialType,
    });
    this._resolversParentTypes = this.createResolversFields({
      applyWrapper: type => type,
      clearWrapper: type => type,
      getTypeToUse: name => this.getParentTypeToUse(name),
      currentType: 'ResolversParentTypes',
      shouldInclude: namedType => !isEnumType(namedType),
      onNotMappedObjectType: ({ typeName, initialType }) => {
        let result = initialType;
        if (this._federation.getMeta()[typeName]?.referenceSelectionSetsString) {
          result += ` | ${this.convertName('FederationReferenceTypes')}['${typeName}']`;
        }
        return result;
      },
    });
    this._resolversUnionTypes = this.createResolversUnionTypes();
    this._resolversInterfaceTypes = this.createResolversInterfaceTypes();
    this._fieldContextTypeMap = this.createFieldContextTypeMap();
    this._directiveContextTypesMap = this.createDirectivedContextType();
    this._directiveResolverMappings = rawConfig.directiveResolverMappings ?? {};
  }

  public getResolverTypeWrapperSignature(): string {
    return `export type ResolverTypeWrapper<T> = ${this.config.resolverTypeWrapperSignature};`;
  }

  protected shouldMapType(type: GraphQLNamedType, duringCheck: string[] = []): boolean {
    if (type.name.startsWith('__') || this.config.scalars[type.name]) {
      return false;
    }

    if (this.config.mappers[type.name]) {
      return true;
    }

    if (isObjectType(type) || isInterfaceType(type)) {
      const fields = type.getFields();

      return Object.keys(fields)
        .filter(fieldName => {
          const field = fields[fieldName];
          const fieldType = getBaseType(field.type);

          return !duringCheck.includes(fieldType.name);
        })
        .some(fieldName => {
          const field = fields[fieldName];
          const fieldType = getBaseType(field.type);

          if (this._shouldMapType[fieldType.name] !== undefined) {
            return this._shouldMapType[fieldType.name];
          }

          if (this.config.mappers[type.name]) {
            return true;
          }

          duringCheck.push(type.name);
          const innerResult = this.shouldMapType(fieldType, duringCheck);

          return innerResult;
        });
    }

    return false;
  }

  public convertName(
    node: ASTNode | string,
    options?: BaseVisitorConvertOptions & ConvertOptions,
    applyNamespacedImport = false
  ): string {
    const sourceType = super.convertName(node, options);

    return `${
      applyNamespacedImport && this.config.namespacedImportName ? this.config.namespacedImportName + '.' : ''
    }${sourceType}`;
  }

  // Kamil: this one is heeeeavvyyyy
  protected createResolversFields({
    applyWrapper,
    clearWrapper,
    getTypeToUse,
    currentType,
    shouldInclude,
    onNotMappedObjectType,
  }: {
    applyWrapper: (str: string) => string;
    clearWrapper: (str: string) => string;
    getTypeToUse: (str: string) => string;
    currentType: 'ResolversTypes' | 'ResolversParentTypes';
    shouldInclude?: (type: GraphQLNamedType) => boolean;
    onNotMappedObjectType: (params: { initialType: string; typeName: string }) => string;
  }): ResolverTypes {
    const allSchemaTypes = this._schema.getTypeMap();
    const typeNames = this._federation.filterTypeNames(Object.keys(allSchemaTypes));

    // avoid checking all types recursively if we have no `mappers` defined
    if (Object.keys(this.config.mappers).length > 0) {
      for (const typeName of typeNames) {
        if (this._shouldMapType[typeName] === undefined) {
          const schemaType = allSchemaTypes[typeName];
          this._shouldMapType[typeName] = this.shouldMapType(schemaType);
        }
      }
    }

    return typeNames.reduce<ResolverTypes>((prev, typeName) => {
      const schemaType = allSchemaTypes[typeName];

      if (typeName.startsWith('__') || (shouldInclude && !shouldInclude(schemaType))) {
        return prev;
      }

      const isRootType = this._rootTypeNames.has(typeName);
      const isMapped = this.config.mappers[typeName];
      const isScalar = this.config.scalars[typeName];
      const hasDefaultMapper = !!this.config.defaultMapper?.type;

      // Check for mappers first, even for root types, to allow overriding rootValueType
      if (isMapped && this.config.mappers[typeName].type && !hasPlaceholder(this.config.mappers[typeName].type)) {
        this.markMapperAsUsed(typeName);
        prev[typeName] = applyWrapper(this.config.mappers[typeName].type);

        return prev;
      }

      if (isRootType) {
        prev[typeName] = applyWrapper(this.config.rootValueType.type);

        return prev;
      }
      if (isEnumType(schemaType) && this.config.enumValues[typeName]) {
        const isExternalFile = !!this.config.enumValues[typeName].sourceFile;
        prev[typeName] = isExternalFile
          ? this.convertName(this.config.enumValues[typeName].typeIdentifier, {
              useTypesPrefix: false,
              useTypesSuffix: false,
            })
          : this.config.enumValues[typeName].sourceIdentifier;
      } else if (hasDefaultMapper && !hasPlaceholder(this.config.defaultMapper.type)) {
        prev[typeName] = applyWrapper(this.config.defaultMapper.type);
      } else if (isScalar) {
        prev[typeName] = applyWrapper(this._getScalar(typeName));
      } else if (isInterfaceType(schemaType)) {
        this._hasReferencedResolversInterfaceTypes = true;
        const type = this.convertName('ResolversInterfaceTypes');
        const generic = this.convertName(currentType);
        prev[typeName] = applyWrapper(`${type}<${generic}>['${typeName}']`);
        return prev;
      } else if (isUnionType(schemaType)) {
        this._hasReferencedResolversUnionTypes = true;
        const type = this.convertName('ResolversUnionTypes');
        const generic = this.convertName(currentType);
        prev[typeName] = applyWrapper(`${type}<${generic}>['${typeName}']`);
      } else if (isEnumType(schemaType)) {
        prev[typeName] = this.convertName(
          typeName,
          {
            useTypesPrefix: this.config.enumPrefix,
            useTypesSuffix: this.config.enumSuffix,
          },
          true
        );
      } else {
        prev[typeName] = this.convertName(typeName, {}, true);

        if (prev[typeName] !== 'any' && isObjectType(schemaType)) {
          const relevantFields = this.getRelevantFieldsToOmit({
            schemaType,
            getTypeToUse,
            shouldInclude,
          });

          // If relevantFields, puts ResolverTypeWrapper on top of an entire type
          let internalType =
            relevantFields.length > 0 ? this.replaceFieldsInType(prev[typeName], relevantFields) : prev[typeName];

          if (isMapped) {
            // replace the placeholder with the actual type
            if (hasPlaceholder(internalType)) {
              internalType = replacePlaceholder(internalType, typeName);
            }
            if (this.config.mappers[typeName].type && hasPlaceholder(this.config.mappers[typeName].type)) {
              internalType = replacePlaceholder(this.config.mappers[typeName].type, internalType);
            }
          } else {
            internalType = onNotMappedObjectType({
              typeName,
              initialType: internalType,
            });
          }

          prev[typeName] = applyWrapper(internalType);
        }
      }

      if (!isMapped && hasDefaultMapper && hasPlaceholder(this.config.defaultMapper.type)) {
        const originalTypeName = isScalar ? this._getScalar(typeName) : prev[typeName];

        if (isUnionType(schemaType)) {
          // Don't clear ResolverTypeWrapper from Unions
          prev[typeName] = replacePlaceholder(this.config.defaultMapper.type, originalTypeName);
        } else {
          const name = clearWrapper(originalTypeName);
          const replaced = replacePlaceholder(this.config.defaultMapper.type, name);
          prev[typeName] = applyWrapper(replaced);
        }
      }

      return prev;
    }, {});
  }

  protected replaceFieldsInType(
    typeName: string,
    relevantFields: ReturnType<typeof this.getRelevantFieldsToOmit>
  ): string {
    this._globalDeclarations.add(OMIT_TYPE);
    return `Omit<${typeName}, ${relevantFields.map(f => `'${f.fieldName}'`).join(' | ')}> & { ${relevantFields
      .map(f => `${f.fieldName}${f.addOptionalSign ? '?' : ''}: ${f.replaceWithType}`)
      .join(', ')} }`;
  }

  protected applyMaybe(str: string): string {
    const namespacedImportPrefix = this.config.namespacedImportName ? this.config.namespacedImportName + '.' : '';
    return `${namespacedImportPrefix}Maybe<${str}>`;
  }

  protected applyResolverTypeWrapper(str: string): string {
    return `ResolverTypeWrapper<${this.clearResolverTypeWrapper(str)}>`;
  }

  protected clearMaybe(str: string): string {
    const namespacedImportPrefix = this.config.namespacedImportName ? this.config.namespacedImportName + '.' : '';
    if (str.startsWith(`${namespacedImportPrefix}Maybe<`)) {
      const maybeRe = new RegExp(`${namespacedImportPrefix.replace('.', '\\.')}Maybe<(.*?)>$`);
      return str.replace(maybeRe, '$1');
    }

    return str;
  }

  protected clearResolverTypeWrapper(str: string): string {
    if (str.startsWith('ResolverTypeWrapper<')) {
      return str.replace(/ResolverTypeWrapper<(.*?)>$/, '$1');
    }

    return str;
  }

  protected wrapWithArray(t: string): string {
    if (this.config.immutableTypes) {
      return `ReadonlyArray<${t}>`;
    }

    return `Array<${t}>`;
  }

  protected createResolversUnionTypes(): Record<string, string> {
    if (!this._hasReferencedResolversUnionTypes) {
      return {};
    }

    const unionTypes = Object.entries(this._parsedSchemaMeta.types.union).reduce<Record<string, string>>(
      (res, [typeName, { type: schemaType, unionMembers }]) => {
        if (isUnionType(schemaType)) {
          const { unionMember, excludeTypes } = this.config.resolversNonOptionalTypename;
          res[typeName] = this.getAbstractMembersType({
            typeName,
            memberTypes: Object.values(unionMembers),
            isTypenameNonOptional: unionMember && !excludeTypes?.includes(typeName),
          });
        }
        return res;
      },
      {}
    );

    return unionTypes;
  }

  protected createResolversInterfaceTypes(): Record<string, string> {
    if (!this._hasReferencedResolversInterfaceTypes) {
      return {};
    }

    const interfaceTypes = Object.entries(this._parsedSchemaMeta.types.interface).reduce<Record<string, string>>(
      (res, [typeName, { type: schemaType, implementingTypes }]) => {
        if (isInterfaceType(schemaType)) {
          const { interfaceImplementingType, excludeTypes } = this.config.resolversNonOptionalTypename;

          res[typeName] = this.getAbstractMembersType({
            typeName,
            memberTypes: Object.values(implementingTypes),
            isTypenameNonOptional: interfaceImplementingType && !excludeTypes?.includes(typeName),
          });
        }

        return res;
      },
      {}
    );

    return interfaceTypes;
  }

  /**
   * Function to generate the types of Abstract Type Members i.e. Union Members or Interface Implementing Types
   */
  getAbstractMembersType({
    typeName,
    memberTypes,
    isTypenameNonOptional,
  }: {
    typeName: string;
    memberTypes: readonly GraphQLObjectType[] | GraphQLObjectType[];
    isTypenameNonOptional: boolean;
  }): string {
    const members = memberTypes
      .map(type => {
        const isTypeMapped = this.config.mappers[type.name];
        // 1. If mapped without placehoder, just use it without doing extra checks
        if (isTypeMapped && !hasPlaceholder(isTypeMapped.type)) {
          return { typename: type.name, typeValue: isTypeMapped.type };
        }

        // 2. Work out value for type
        // 2a. By default, use the typescript type
        let typeValue = this.convertName(type.name, {}, true);

        // 2b. Find fields to Omit if needed.
        //  - If no field to Omit, "type with maybe Omit" is typescript type i.e. no Omit
        //  - If there are fields to Omit, keep track of these "type with maybe Omit" to replace in original unionMemberValue
        const fieldsToOmit = this.getRelevantFieldsToOmit({
          schemaType: type,
          getTypeToUse: baseType => `_RefType['${baseType}']`,
        });
        if (fieldsToOmit.length > 0) {
          typeValue = this.replaceFieldsInType(typeValue, fieldsToOmit);
        }

        // 2c. If type is mapped with placeholder, use the "type with maybe Omit" as {T}
        if (isTypeMapped && hasPlaceholder(isTypeMapped.type)) {
          return { typename: type.name, typeValue: replacePlaceholder(isTypeMapped.type, typeValue) };
        }

        // 2d. If has default mapper with placeholder, use the "type with maybe Omit" as {T}
        const hasDefaultMapper = !!this.config.defaultMapper?.type;
        const isScalar = this.config.scalars[typeName];
        if (hasDefaultMapper && hasPlaceholder(this.config.defaultMapper.type)) {
          const finalTypename = isScalar ? this._getScalar(typeName) : typeValue;
          return {
            typename: type.name,
            typeValue: replacePlaceholder(this.config.defaultMapper.type, finalTypename),
          };
        }

        return { typename: type.name, typeValue };
      })
      .map(({ typename, typeValue }) => {
        const nonOptionalTypenameModifier = isTypenameNonOptional ? ` & { __typename: '${typename}' }` : '';

        return `( ${typeValue}${nonOptionalTypenameModifier} )`; // Must wrap every type in explicit "( )" to separate them
      });
    const result =
      members.length === 0
        ? 'never'
        : members.length > 1
        ? `\n    | ${members.map(m => m.replace(/\n/g, '\n  ')).join('\n    | ')}\n  `
        : members.join(' | ');
    return result;
  }

  protected createFieldContextTypeMap(): FieldContextTypeMap {
    return this.config.fieldContextTypes.reduce<FieldContextTypeMap>((prev, fieldContextType) => {
      const isScoped = fieldContextType.includes('\\#');
      if (fieldContextType.includes('\\#')) {
        fieldContextType = fieldContextType.replace('\\#', '');
      }
      const items = fieldContextType.split('#');
      if (items.length === 3) {
        const [path, source, contextTypeName] = items;
        const sourceStr = isScoped ? `\\#${source}` : source;
        return { ...prev, [path]: parseMapper(`${sourceStr}#${contextTypeName}`) };
      }
      const [path, contextType] = items;
      return { ...prev, [path]: parseMapper(contextType) };
    }, {});
  }
  protected createDirectivedContextType(): FieldContextTypeMap {
    return this.config.directiveContextTypes.reduce<FieldContextTypeMap>((prev, fieldContextType) => {
      const isScoped = fieldContextType.includes('\\#');
      if (fieldContextType.includes('\\#')) {
        fieldContextType = fieldContextType.replace('\\#', '');
      }
      const items = fieldContextType.split('#');
      if (items.length === 3) {
        const [path, source, contextTypeName] = items;
        const sourceStr = isScoped ? `\\#${source}` : source;
        return { ...prev, [path]: parseMapper(`${sourceStr}#${contextTypeName}`) };
      }
      const [path, contextType] = items;
      return { ...prev, [path]: parseMapper(contextType) };
    }, {});
  }

  public buildResolversTypes(): string {
    const declarationKind = 'type';
    return new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind(declarationKind)
      .withName(this.convertName('ResolversTypes'))
      .withComment('Mapping between all available schema types and the resolvers types')
      .withBlock(
        Object.keys(this._resolversTypes)
          .map(typeName =>
            indent(`${typeName}: ${this._resolversTypes[typeName]}${this.getPunctuation(declarationKind)}`)
          )
          .join('\n')
      ).string;
  }

  public buildResolversParentTypes(): string {
    const declarationKind = 'type';
    return new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind(declarationKind)
      .withName(this.convertName('ResolversParentTypes'))
      .withComment('Mapping between all available schema types and the resolvers parents')
      .withBlock(
        Object.keys(this._resolversParentTypes)
          .map(typeName =>
            indent(`${typeName}: ${this._resolversParentTypes[typeName]}${this.getPunctuation(declarationKind)}`)
          )
          .join('\n')
      ).string;
  }

  public buildResolversUnionTypes(): string {
    if (Object.keys(this._resolversUnionTypes).length === 0) {
      return '';
    }

    const declarationKind = 'type';
    return new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind(declarationKind)
      .withName(this.convertName('ResolversUnionTypes'), `<_RefType extends Record<string, unknown>>`)
      .withComment('Mapping of union types')
      .withBlock(
        Object.entries(this._resolversUnionTypes)
          .map(([typeName, value]) => indent(`${typeName}: ${value}${this.getPunctuation(declarationKind)}`))
          .join('\n')
      ).string;
  }

  public buildResolversInterfaceTypes(): string {
    if (Object.keys(this._resolversInterfaceTypes).length === 0) {
      return '';
    }

    const declarationKind = 'type';
    return new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind(declarationKind)
      .withName(this.convertName('ResolversInterfaceTypes'), `<_RefType extends Record<string, unknown>>`)
      .withComment('Mapping of interface types')
      .withBlock(
        Object.entries(this._resolversInterfaceTypes)
          .map(([typeName, value]) => indent(`${typeName}: ${value}${this.getPunctuation(declarationKind)}`))
          .join('\n')
      ).string;
  }

  public buildFederationTypes(): string {
    const federationMeta = this._federation.getMeta();

    if (Object.keys(federationMeta).length === 0) {
      return '';
    }

    const declarationKind = 'type';
    return new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind(declarationKind)
      .withName(this.convertName('FederationTypes'))
      .withComment('Mapping of federation types')
      .withBlock(
        Object.keys(federationMeta)
          .map(typeName => {
            return indent(`${typeName}: ${this.convertName(typeName)}${this.getPunctuation(declarationKind)}`);
          })
          .join('\n')
      ).string;
  }

  public buildFederationReferenceTypes(): string {
    const federationMeta = this._federation.getMeta();

    if (Object.keys(federationMeta).length === 0) {
      return '';
    }

    const declarationKind = 'type';
    return new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind(declarationKind)
      .withName(this.convertName('FederationReferenceTypes'))
      .withComment('Mapping of federation reference types')
      .withBlock(
        Object.entries(federationMeta)
          .map(([typeName, { referenceSelectionSetsString }]) => {
            if (!referenceSelectionSetsString) {
              return undefined;
            }

            return indent(`${typeName}: ${referenceSelectionSetsString}${this.getPunctuation(declarationKind)}`);
          })
          .filter(v => v)
          .join('\n')
      ).string;
  }

  public get schema(): GraphQLSchema {
    return this._schema;
  }

  public get defaultMapperType(): string {
    return this.config.defaultMapper.type;
  }

  public get unusedMappers() {
    return Object.keys(this.config.mappers).filter(name => !this._usedMappers[name]);
  }

  public get globalDeclarations(): string[] {
    return Array.from(this._globalDeclarations);
  }

  protected isMapperImported(groupedMappers: GroupedMappers, identifier: string, source: string): boolean {
    const exists = groupedMappers[source] ? !!groupedMappers[source].find(m => m.identifier === identifier) : false;
    const existsFromEnums = !!Object.keys(this.config.enumValues)
      .map(key => this.config.enumValues[key])
      .find(o => o.sourceFile === source && o.typeIdentifier === identifier);

    return exists || existsFromEnums;
  }

  public get mappersImports(): string[] {
    const groupedMappers: GroupedMappers = {};

    const addMapper = (source: string, identifier: string, asDefault: boolean) => {
      if (!this.isMapperImported(groupedMappers, identifier, source)) {
        groupedMappers[source] ||= [];

        groupedMappers[source].push({ identifier, asDefault });
      }
    };

    for (const { mapper } of Object.keys(this.config.mappers)
      .map(gqlTypeName => ({ gqlType: gqlTypeName, mapper: this.config.mappers[gqlTypeName] }))
      .filter(({ mapper }) => mapper.isExternal)) {
      const externalMapper = mapper as ExternalParsedMapper;
      const identifier = stripMapperTypeInterpolation(externalMapper.import);
      addMapper(externalMapper.source, identifier, externalMapper.default);
    }

    if (this.config.contextType.isExternal) {
      addMapper(this.config.contextType.source, this.config.contextType.import, this.config.contextType.default);
    }

    if (this.config.rootValueType.isExternal) {
      addMapper(this.config.rootValueType.source, this.config.rootValueType.import, this.config.rootValueType.default);
    }

    if (this.config.defaultMapper?.isExternal) {
      const identifier = stripMapperTypeInterpolation(this.config.defaultMapper.import);
      addMapper(this.config.defaultMapper.source, identifier, this.config.defaultMapper.default);
    }

    for (const parsedMapper of Object.values(this._fieldContextTypeMap)) {
      if (parsedMapper.isExternal) {
        addMapper(parsedMapper.source, parsedMapper.import, parsedMapper.default);
      }
    }

    for (const parsedMapper of Object.values(this._directiveContextTypesMap)) {
      if (parsedMapper.isExternal) {
        addMapper(parsedMapper.source, parsedMapper.import, parsedMapper.default);
      }
    }

    return Object.keys(groupedMappers)
      .map(source => buildMapperImport(source, groupedMappers[source], this.config.useTypeImports))
      .filter(Boolean);
  }

  setDeclarationBlockConfig(config: DeclarationBlockConfig): void {
    this._declarationBlockConfig = config;
  }

  setVariablesTransformer(variablesTransfomer: OperationVariablesToObject): void {
    this._variablesTransformer = variablesTransfomer;
  }

  public hasScalars(): boolean {
    return this._hasScalars;
  }

  public hasFederation(): boolean {
    return Object.keys(this._federation.getMeta()).length > 0;
  }

  public getRootResolver(): RootResolver {
    const name = this.convertName(this.config.allResolversTypeName);
    const declarationKind = 'type';
    const contextType = `<ContextType = ${this.config.contextType.type}>`;

    const userDefinedTypes: RootResolver['generatedResolverTypes']['userDefined'] = {};
    const content = [
      new DeclarationBlock(this._declarationBlockConfig)
        .export()
        .asKind(declarationKind)
        .withName(name, contextType)
        .withBlock(
          Object.keys(this._collectedResolvers)
            .map(schemaTypeName => {
              const resolverType = this._collectedResolvers[schemaTypeName];

              if (resolverType.baseGeneratedTypename) {
                userDefinedTypes[schemaTypeName] = {
                  name: resolverType.baseGeneratedTypename,
                  hasIsTypeOf: this._parsedSchemaMeta.typesWithIsTypeOf[schemaTypeName] || false,
                };

                const federationMeta = this._federation.getMeta()[schemaTypeName];
                if (federationMeta) {
                  userDefinedTypes[schemaTypeName].federation = {
                    hasResolveReference: federationMeta.hasResolveReference,
                  };
                }
              }

              return indent(this.formatRootResolver(schemaTypeName, resolverType.typename, declarationKind));
            })
            .join('\n')
        ).string,
    ].join('\n');

    return {
      content,
      generatedResolverTypes: {
        resolversMap: { name },
        userDefined: userDefinedTypes,
      },
    };
  }

  protected formatRootResolver(schemaTypeName: string, resolverType: string, declarationKind: DeclarationKind): string {
    return `${schemaTypeName}${this.config.avoidOptionals.resolvers ? '' : '?'}: ${resolverType}${this.getPunctuation(
      declarationKind
    )}`;
  }

  public getAllDirectiveResolvers(): string {
    if (Object.keys(this._collectedDirectiveResolvers).length) {
      const declarationKind = 'type';
      const name = this.convertName('DirectiveResolvers');
      const contextType = `<ContextType = ${this.config.contextType.type}>`;

      return [
        new DeclarationBlock(this._declarationBlockConfig)
          .export()
          .asKind(declarationKind)
          .withName(name, contextType)
          .withBlock(
            Object.keys(this._collectedDirectiveResolvers)
              .map(schemaTypeName => {
                const resolverType = this._collectedDirectiveResolvers[schemaTypeName];

                return indent(this.formatRootResolver(schemaTypeName, resolverType, declarationKind));
              })
              .join('\n')
          ).string,
      ].join('\n');
    }

    return '';
  }

  ListType(node: ListTypeNode): string {
    const asString = node.type as any as string;

    return this.wrapWithArray(asString);
  }

  protected _getScalar(name: string): string {
    return `${
      this.config.namespacedImportName ? this.config.namespacedImportName + '.' : ''
    }Scalars['${name}']['output']`;
  }

  NamedType(node: NamedTypeNode): string {
    const nameStr = node.name.value;

    if (this.config.scalars[nameStr]) {
      return this._getScalar(nameStr);
    }

    return this.convertName(node, null, true);
  }

  NonNullType(node: NonNullTypeNode): string {
    const asString = node.type as any as string;

    return asString;
  }

  protected markMapperAsUsed(name: string): void {
    this._usedMappers[name] = true;
  }

  protected getTypeToUse(name: string): string {
    const resolversType = this.convertName('ResolversTypes');

    return `${resolversType}['${name}']`;
  }

  protected getParentTypeToUse(name: string): string {
    const resolversType = this.convertName('ResolversParentTypes');

    return `${resolversType}['${name}']`;
  }

  protected getParentTypeForSignature(_node: FieldDefinitionNode): string {
    return 'ParentType';
  }

  protected transformParentGenericType(parentType: string): string {
    return `ParentType extends ${parentType} = ${parentType}`;
  }

  FieldDefinition(node: FieldDefinitionNode, key: string | number, parent: any): FieldDefinitionResult {
    const hasArguments = node.arguments && node.arguments.length > 0;
    const declarationKind = 'type';

    const original: FieldDefinitionNode = parent[key];

    return {
      node: original,
      printContent: (parentNode, avoidResolverOptionals) => {
        const parentName = parentNode.name.value;
        const parentType = this.schema.getType(parentName);
        const meta: ReturnType<FieldDefinitionPrintFn>['meta'] = {};
        const typeName = node.name.value;

        const fieldsToGenerate = this._federation.findFieldNodesToGenerate({ node: parentNode });
        const shouldGenerateField =
          fieldsToGenerate.some(field => field.name.value === typeName) ||
          this._federation.isResolveReferenceField(node);

        if (!shouldGenerateField) {
          return { value: null, meta };
        }

        const contextType = this.getContextType(parentName, node);

        let argsType = hasArguments
          ? this.convertName(
              parentName +
                (this.config.addUnderscoreToArgsType ? '_' : '') +
                this.convertName(typeName, {
                  useTypesPrefix: false,
                  useTypesSuffix: false,
                }) +
                'Args',
              {
                useTypesPrefix: true,
              },
              true
            )
          : null;

        const avoidInputsOptionals = this.config.avoidOptionals.inputValue;

        if (argsType !== null) {
          const argsToForceRequire = original.arguments.filter(
            arg => !!arg.defaultValue || arg.type.kind === 'NonNullType'
          );

          if (argsToForceRequire.length > 0) {
            argsType = this.applyRequireFields(argsType, argsToForceRequire);
          } else if (original.arguments.length > 0 && avoidInputsOptionals !== true) {
            argsType = this.applyOptionalFields(argsType, original.arguments);
          }
        }

        const { mappedTypeKey, resolverType } = ((): { mappedTypeKey: string; resolverType: string } => {
          const baseType = getBaseTypeNode(original.type);
          const realType = baseType.name.value;
          const typeToUse = this.getTypeToUse(realType);
          /**
           * Turns GraphQL type to TypeScript types (`mappedType`) e.g.
           * - String!  -> ResolversTypes['String']>
           * - String   -> Maybe<ResolversTypes['String']>
           * - [String] -> Maybe<Array<Maybe<ResolversTypes['String']>>>
           * - [String!]! -> Array<ResolversTypes['String']>
           */
          const mappedType = this._variablesTransformer.wrapAstTypeWithModifiers(typeToUse, original.type);

          const subscriptionType = this._schema.getSubscriptionType();
          const isSubscriptionType = subscriptionType && subscriptionType.name === parentName;

          if (isSubscriptionType) {
            return {
              mappedTypeKey: `${mappedType}, "${typeName}"`,
              resolverType: 'SubscriptionResolver',
            };
          }

          const directiveMappings =
            node.directives
              ?.map(directive => this._directiveResolverMappings[directive.name.value])
              .filter(Boolean)
              .reverse() ?? [];

          return {
            mappedTypeKey: mappedType,
            resolverType: directiveMappings[0] ?? 'Resolver',
          };
        })();

        const signature: {
          name: string;
          modifier: string;
          type: string;
          genericTypes: string[];
        } = {
          name: typeName,
          modifier: avoidResolverOptionals ? '' : '?',
          type: resolverType,
          genericTypes: [mappedTypeKey, this.getParentTypeForSignature(node), contextType, argsType].filter(f => f),
        };

        if (this._federation.isResolveReferenceField(node)) {
          if (!this._federation.getMeta()[parentType.name].hasResolveReference) {
            return { value: '', meta };
          }
          const resultType = `${mappedTypeKey} | FederationReferenceType`;
          const referenceType = 'FederationReferenceType';

          signature.type = 'ReferenceResolver';
          signature.genericTypes = [resultType, referenceType, contextType];
          meta.federation = { isResolveReference: true };
        }

        return {
          value: indent(
            `${signature.name}${signature.modifier}: ${signature.type}<${signature.genericTypes.join(
              ', '
            )}>${this.getPunctuation(declarationKind)}`
          ),
          meta,
        };
      },
    };
  }

  private getFieldContextType(parentName: string, node: FieldDefinitionNode): string {
    if (this._fieldContextTypeMap[`${parentName}.${node.name.value}`]) {
      return this._fieldContextTypeMap[`${parentName}.${node.name.value}`].type;
    }
    return 'ContextType';
  }

  private getContextType(parentName: string, node: FieldDefinitionNode): string {
    let contextType = this.getFieldContextType(parentName, node);

    for (const directive of node.directives) {
      const name = directive.name.value;
      const directiveMap = this._directiveContextTypesMap[name];
      if (directiveMap) {
        contextType = `${directiveMap.type}<${contextType}>`;
      }
    }
    return contextType;
  }

  private parseSchemaMeta(): void {
    const allSchemaTypes = this._schema.getTypeMap();
    const typeNames = this._federation.filterTypeNames(Object.keys(allSchemaTypes));

    for (const typeName of typeNames) {
      const schemaType = allSchemaTypes[typeName];

      if (isUnionType(schemaType)) {
        this._parsedSchemaMeta.types.union[schemaType.name] = {
          type: schemaType,
          unionMembers: {},
        };

        const unionMemberTypes = schemaType.getTypes();
        for (const type of unionMemberTypes) {
          this._parsedSchemaMeta.types.union[schemaType.name].unionMembers[type.name] = type;
          this._parsedSchemaMeta.typesWithIsTypeOf[type.name] = true;
        }
      }

      if (isInterfaceType(schemaType)) {
        this._parsedSchemaMeta.types.interface[schemaType.name] = {
          type: schemaType,
          implementingTypes: {},
        };

        for (const graphqlType of Object.values(allSchemaTypes)) {
          if (graphqlType instanceof GraphQLObjectType) {
            const allInterfaces = graphqlType.getInterfaces();

            if (allInterfaces.some(int => int.name === schemaType.name)) {
              this._parsedSchemaMeta.types.interface[schemaType.name].implementingTypes[graphqlType.name] = graphqlType;
              this._parsedSchemaMeta.typesWithIsTypeOf[graphqlType.name] = true;
            }
          }
        }
      }
    }
  }

  protected applyRequireFields(argsType: string, fields: InputValueDefinitionNode[]): string {
    this._globalDeclarations.add(REQUIRE_FIELDS_TYPE);
    return `RequireFields<${argsType}, ${fields.map(f => `'${f.name.value}'`).join(' | ')}>`;
  }

  protected applyOptionalFields(argsType: string, _fields: readonly InputValueDefinitionNode[]): string {
    return `Partial<${argsType}>`;
  }

  ObjectTypeDefinition(node: ObjectTypeDefinitionNode): string | null {
    const typeName = node.name.value;
    const fieldsToGenerate = this._federation.findFieldNodesToGenerate({ node });
    if (fieldsToGenerate.length === 0) {
      return null;
    }

    const declarationKind = 'type';
    const name = this.convertName(node, {
      suffix: this.config.resolverTypeSuffix,
    });
    const parentType = this.getParentTypeToUse(typeName);

    const rootType = ((): false | 'query' | 'mutation' | 'subscription' => {
      if (this.schema.getQueryType()?.name === typeName) {
        return 'query';
      }
      if (this.schema.getMutationType()?.name === typeName) {
        return 'mutation';
      }
      if (this.schema.getSubscriptionType()?.name === typeName) {
        return 'subscription';
      }
      return false;
    })();

    const fieldsContent = (node.fields as unknown as FieldDefinitionResult[])
      .map(({ printContent }) => {
        return printContent(
          node,
          (rootType === 'query' && this.config.avoidOptionals.query) ||
            (rootType === 'mutation' && this.config.avoidOptionals.mutation) ||
            (rootType === 'subscription' && this.config.avoidOptionals.subscription) ||
            (rootType === false && this.config.avoidOptionals.resolvers)
        ).value;
      })
      .filter(v => v);

    if (!rootType && this._parsedSchemaMeta.typesWithIsTypeOf[typeName]) {
      fieldsContent.push(
        indent(
          `${
            this.config.internalResolversPrefix
          }isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>${this.getPunctuation(declarationKind)}`
        )
      );
    }

    if (fieldsContent.length === 0) {
      return null;
    }

    const genericTypes: string[] = [
      `ContextType = ${this.config.contextType.type}`,
      this.transformParentGenericType(parentType),
    ];
    this._federation.addFederationTypeGenericIfApplicable({
      genericTypes,
      federationTypesType: this.convertName('FederationReferenceTypes'),
      typeName,
    });

    const block = new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind(declarationKind)
      .withName(name, `<${genericTypes.join(', ')}>`)
      .withBlock(fieldsContent.join('\n'));

    this._collectedResolvers[node.name.value] = {
      typename: name + '<ContextType>',
      baseGeneratedTypename: name,
    };

    return block.string;
  }

  UnionTypeDefinition(node: UnionTypeDefinitionNode, key: string | number, parent: any): string {
    const declarationKind = 'type';
    const name = this.convertName(node, {
      suffix: this.config.resolverTypeSuffix,
    });
    const originalNode = parent[key] as UnionTypeDefinitionNode;
    const possibleTypes = originalNode.types
      .map(node => node.name.value)
      .map(f => `'${f}'`)
      .join(' | ');

    this._collectedResolvers[node.name.value] = {
      typename: name + '<ContextType>',
      baseGeneratedTypename: name,
    };
    const parentType = this.getParentTypeToUse(node.name.value);

    return new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind(declarationKind)
      .withName(name, `<ContextType = ${this.config.contextType.type}, ${this.transformParentGenericType(parentType)}>`)
      .withBlock(
        indent(
          `${this.config.internalResolversPrefix}resolveType${
            this.config.optionalResolveType ? '?' : ''
          }: TypeResolveFn<${possibleTypes}, ParentType, ContextType>${this.getPunctuation(declarationKind)}`
        )
      ).string;
  }

  ScalarTypeDefinition(node: ScalarTypeDefinitionNode): string {
    const nameAsString = node.name.value;
    const baseName = this.getTypeToUse(nameAsString);

    if (this._federation.skipScalar(nameAsString)) {
      return null;
    }

    this._hasScalars = true;
    this._collectedResolvers[node.name.value] = {
      typename: 'GraphQLScalarType',
    };

    return new DeclarationBlock({
      ...this._declarationBlockConfig,
      blockTransformer(block) {
        return block;
      },
    })
      .export()
      .asKind('interface')
      .withName(
        this.convertName(node, {
          suffix: 'ScalarConfig',
        }),
        ` extends GraphQLScalarTypeConfig<${baseName}, any>`
      )
      .withBlock(indent(`name: '${node.name.value}'${this.getPunctuation('interface')}`)).string;
  }

  DirectiveDefinition(node: DirectiveDefinitionNode, key: string | number, parent: any): string {
    if (this._federation.skipDirective(node.name.value)) {
      return null;
    }

    const directiveName = this.convertName(node, {
      suffix: 'DirectiveResolver',
    });
    const sourceNode = parent[key] as DirectiveDefinitionNode;
    const hasArguments = sourceNode.arguments && sourceNode.arguments.length > 0;

    this._collectedDirectiveResolvers[node.name.value] = directiveName + '<any, any, ContextType>';

    const directiveArgsTypeName = this.convertName(node, {
      suffix: 'DirectiveArgs',
    });

    return [
      new DeclarationBlock({
        ...this._declarationBlockConfig,
        blockTransformer(block) {
          return block;
        },
      })
        .export()
        .asKind('type')
        .withName(directiveArgsTypeName)
        .withContent(
          hasArguments
            ? `{\n${this._variablesTransformer.transform<InputValueDefinitionNode>(sourceNode.arguments)}\n}`
            : '{ }'
        ).string,
      new DeclarationBlock({
        ...this._declarationBlockConfig,
        blockTransformer(block) {
          return block;
        },
      })
        .export()
        .asKind('type')
        .withName(
          directiveName,
          `<Result, Parent, ContextType = ${this.config.contextType.type}, Args = ${directiveArgsTypeName}>`
        )
        .withContent(`DirectiveResolverFn<Result, Parent, ContextType, Args>`).string,
    ].join('\n');
  }

  protected buildEnumResolverContentBlock(_node: EnumTypeDefinitionNode, _mappedEnumType: string): string {
    throw new Error(`buildEnumResolverContentBlock is not implemented!`);
  }

  protected buildEnumResolversExplicitMappedValues(
    _node: EnumTypeDefinitionNode,
    _valuesMapping: { [valueName: string]: string | number }
  ): string {
    throw new Error(`buildEnumResolversExplicitMappedValues is not implemented!`);
  }

  EnumTypeDefinition(node: EnumTypeDefinitionNode): string {
    const rawTypeName = node.name.value;

    // If we have enumValues set, and it's point to an external enum - we need to allow internal values resolvers
    // In case we have enumValues set but as explicit values, no need to to do mapping since it's already
    // have type validation (the original enum has been modified by base types plugin).
    // If we have mapper for that type - we can skip
    if (!this.config.mappers[rawTypeName] && !this.config.enumValues[rawTypeName]) {
      return null;
    }

    const name = this.convertName(node, { suffix: this.config.resolverTypeSuffix });
    this._collectedResolvers[rawTypeName] = {
      typename: name,
      baseGeneratedTypename: name,
    };
    const hasExplicitValues = this.config.enumValues[rawTypeName]?.mappedValues;

    return new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind('type')
      .withName(name)
      .withContent(
        hasExplicitValues
          ? this.buildEnumResolversExplicitMappedValues(node, this.config.enumValues[rawTypeName].mappedValues)
          : this.buildEnumResolverContentBlock(node, this.getTypeToUse(rawTypeName))
      ).string;
  }

  InterfaceTypeDefinition(node: InterfaceTypeDefinitionNode): string {
    const name = this.convertName(node, {
      suffix: this.config.resolverTypeSuffix,
    });
    const declarationKind = 'type';
    const typeName = node.name.value;
    const implementingTypes = Object.keys(this._parsedSchemaMeta.types.interface[typeName].implementingTypes);

    this._collectedResolvers[typeName] = {
      typename: name + '<ContextType>',
      baseGeneratedTypename: name,
    };

    const parentType = this.getParentTypeToUse(typeName);

    const genericTypes: string[] = [
      `ContextType = ${this.config.contextType.type}`,
      this.transformParentGenericType(parentType),
    ];
    this._federation.addFederationTypeGenericIfApplicable({
      genericTypes,
      federationTypesType: this.convertName('FederationReferenceTypes'),
      typeName,
    });

    const possibleTypes = implementingTypes.map(name => `'${name}'`).join(' | ') || 'null';

    // An Interface has __resolveType resolver, and no other fields.
    const blockFields: string[] = [
      indent(
        `${this.config.internalResolversPrefix}resolveType${
          this.config.optionalResolveType ? '?' : ''
        }: TypeResolveFn<${possibleTypes}, ParentType, ContextType>${this.getPunctuation(declarationKind)}`
      ),
    ];

    // An Interface in Federation may have the additional __resolveReference resolver, if resolvable.
    // So, we filter out the normal fields declared on the Interface and add the __resolveReference resolver.
    const fields = (node.fields as unknown as FieldDefinitionResult[]).map(({ printContent }) =>
      printContent(node, this.config.avoidOptionals.resolvers)
    );
    for (const field of fields) {
      if (field.meta.federation?.isResolveReference || this.config.addInterfaceFieldResolverTypes) {
        blockFields.push(field.value);
      }
    }

    return new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind(declarationKind)
      .withName(name, `<${genericTypes.join(', ')}>`)
      .withBlock(blockFields.join('\n')).string;
  }

  SchemaDefinition() {
    return null;
  }

  SchemaExtension() {
    return null;
  }

  private getRelevantFieldsToOmit({
    schemaType,
    shouldInclude,
    getTypeToUse,
  }: {
    schemaType: GraphQLObjectType;
    getTypeToUse: (name: string) => string;
    shouldInclude?: (type: GraphQLNamedType) => boolean;
  }): {
    addOptionalSign: boolean;
    fieldName: string;
    replaceWithType: string;
  }[] {
    const fields = schemaType.getFields();
    return this._federation
      .filterFieldNames(Object.keys(fields))
      .filter(fieldName => {
        const field = fields[fieldName];
        const baseType = getBaseType(field.type);

        // Filter out fields of types that are not included
        if (shouldInclude && !shouldInclude(baseType)) {
          return false;
        }
        return true;
      })
      .map(fieldName => {
        const field = fields[fieldName];
        const baseType = getBaseType(field.type);
        const isUnion = isUnionType(baseType);
        const isInterface = isInterfaceType(baseType);
        const isObject = isObjectType(baseType);
        let isObjectWithAbstractType = false;

        if (isObject && !this.config.avoidCheckingAbstractTypesRecursively) {
          isObjectWithAbstractType = checkIfObjectTypeHasAbstractTypesRecursively(baseType, {
            isObjectWithAbstractType,
            checkedTypesWithNestedAbstractTypes: this._checkedTypesWithNestedAbstractTypes,
          });
        }

        if (
          !this.config.mappers[baseType.name] &&
          !isUnion &&
          !isInterface &&
          !this._shouldMapType[baseType.name] &&
          !isObjectWithAbstractType
        ) {
          return null;
        }

        const addOptionalSign = !this.config.avoidOptionals.resolvers && !isNonNullType(field.type);

        return {
          addOptionalSign,
          fieldName,
          replaceWithType: wrapTypeWithModifiers(getTypeToUse(baseType.name), field.type, {
            wrapOptional: this.applyMaybe,
            wrapArray: this.wrapWithArray,
          }),
        };
      })
      .filter(a => a);
  }
}

function replacePlaceholder(pattern: string, typename: string): string {
  return pattern.replace(/\{T\}/g, typename);
}

function hasPlaceholder(pattern: string): boolean {
  return pattern.includes('{T}');
}

function normalizeResolversNonOptionalTypename(
  input?: boolean | ResolversNonOptionalTypenameConfig
): ResolversNonOptionalTypenameConfig {
  const defaultConfig: ResolversNonOptionalTypenameConfig = {
    unionMember: false,
  };

  if (typeof input === 'boolean') {
    return {
      unionMember: input,
      interfaceImplementingType: input,
    };
  }

  return {
    ...defaultConfig,
    ...input,
  };
}

function checkIfObjectTypeHasAbstractTypesRecursively(
  baseType: GraphQLObjectType,
  result: {
    isObjectWithAbstractType: boolean;
    checkedTypesWithNestedAbstractTypes: Record<string, { checkStatus: 'yes' | 'no' | 'checking' }>;
  }
): boolean {
  if (
    result.checkedTypesWithNestedAbstractTypes[baseType.name] &&
    (result.checkedTypesWithNestedAbstractTypes[baseType.name].checkStatus === 'yes' ||
      result.checkedTypesWithNestedAbstractTypes[baseType.name].checkStatus === 'no')
  ) {
    return result.checkedTypesWithNestedAbstractTypes[baseType.name].checkStatus === 'yes';
  }

  result.checkedTypesWithNestedAbstractTypes[baseType.name] ||= { checkStatus: 'checking' };

  let atLeastOneFieldWithAbstractType = false;

  const fields = baseType.getFields();
  for (const field of Object.values(fields)) {
    const fieldBaseType = getBaseType(field.type);

    // If the field is self-referencing, skip it. Otherwise, it's an infinite loop
    if (baseType.name === fieldBaseType.name) {
      continue;
    }

    // If the current field has been checked, and it has nested abstract types,
    // mark the parent type as having nested abstract types
    if (result.checkedTypesWithNestedAbstractTypes[fieldBaseType.name]) {
      if (result.checkedTypesWithNestedAbstractTypes[fieldBaseType.name].checkStatus === 'yes') {
        atLeastOneFieldWithAbstractType = true;
        result.checkedTypesWithNestedAbstractTypes[baseType.name].checkStatus = 'yes';
      }
      continue;
    } else {
      result.checkedTypesWithNestedAbstractTypes[fieldBaseType.name] = { checkStatus: 'checking' };
    }

    // If the field is an abstract type, then both the field type and parent type are abstract types
    if (isInterfaceType(fieldBaseType) || isUnionType(fieldBaseType)) {
      atLeastOneFieldWithAbstractType = true;
      result.checkedTypesWithNestedAbstractTypes[fieldBaseType.name].checkStatus = 'yes';
      result.checkedTypesWithNestedAbstractTypes[baseType.name].checkStatus = 'yes';
      continue;
    }

    // If the field is an object, check it recursively to see if it has abstract types
    // If it does, both field type and parent type have abstract types
    if (isObjectType(fieldBaseType)) {
      // IMPORTANT: we are pointing the parent type to the field type here
      // to make sure when the field type is updated to either 'yes' or 'no', it becomes the parent's type as well
      if (result.checkedTypesWithNestedAbstractTypes[baseType.name].checkStatus === 'checking') {
        result.checkedTypesWithNestedAbstractTypes[baseType.name] =
          result.checkedTypesWithNestedAbstractTypes[fieldBaseType.name];
      }

      const foundAbstractType = checkIfObjectTypeHasAbstractTypesRecursively(fieldBaseType, result);
      if (foundAbstractType) {
        atLeastOneFieldWithAbstractType = true;
        result.checkedTypesWithNestedAbstractTypes[fieldBaseType.name].checkStatus = 'yes';
        result.checkedTypesWithNestedAbstractTypes[baseType.name].checkStatus = 'yes';
      }
      continue;
    }

    // Otherwise, the current field type is not abstract type
    // This includes scalar types, enums, input types and objects without abstract types
    result.checkedTypesWithNestedAbstractTypes[fieldBaseType.name].checkStatus = 'no';
  }

  if (atLeastOneFieldWithAbstractType) {
    result.isObjectWithAbstractType = true;
  } else {
    result.checkedTypesWithNestedAbstractTypes[baseType.name].checkStatus = 'no';
  }

  return atLeastOneFieldWithAbstractType;
}
