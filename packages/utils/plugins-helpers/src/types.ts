import type { ApolloEngineOptions } from '@graphql-tools/apollo-engine-loader';
import { Source } from '@graphql-tools/utils';
import { DocumentNode, GraphQLSchema } from 'graphql';
import type { Profiler } from './profiler.js';

export namespace Types {
  export interface GenerateOptions {
    filename: string;
    plugins: Types.ConfiguredPlugin[];
    // TODO: Remove schemaAst and change schema to GraphQLSchema in the next major version
    schema: DocumentNode;
    schemaAst?: GraphQLSchema;
    documents: Types.DocumentFile[];
    config: { [key: string]: any };
    pluginMap: {
      [name: string]: CodegenPlugin;
    };
    skipDocumentsValidation?: Types.SkipDocumentsValidationOptions;
    pluginContext?: { [key: string]: any };
    profiler?: Profiler;
    cache?<T>(namespace: string, key: string, factory: () => Promise<T>): Promise<T>;
    documentTransforms?: ConfiguredDocumentTransform[];
    emitLegacyCommonJSImports?: boolean;
    importExtension?: '' | `.${string}`;
  }

  export type FileOutput = {
    filename: string;
    content: string;
    hooks?: {
      beforeOneFileWrite?: LifecycleHooksDefinition['beforeOneFileWrite'];
      afterOneFileWrite?: LifecycleHooksDefinition['afterOneFileWrite'];
    };
  };

  export interface DocumentFile extends Source {
    hash?: string;
  }

  /* Utils */
  export type Promisable<T> = T | Promise<T>;
  export type InstanceOrArray<T> = T | T[];

  /**
   * @additionalProperties false
   * @description Loads schema using a pointer, with a custom loader (code file).
   */
  export interface SchemaWithLoaderOptions {
    /**
     * @description Specify a path to a custom code file (local or module) that will handle the schema loading.
     */
    loader: string;
  }
  export interface SchemaWithLoader {
    [pointer: string]: SchemaWithLoaderOptions;
  }

  /**
   * @additionalProperties false
   * @description Loads schema using a pointer, without using `require` while looking for schemas in code files.
   */
  export interface SchemaFromCodeFileOptions {
    /**
     * @description Set this to `true` in order to tell codegen not to try to `require` files in order to find schema/docs
     */
    noRequire?: boolean;
    /**
     * @description Set this to `true` in order to tell codegen not to try to extract GraphQL AST strings schema/docs
     */
    noPluck?: boolean;
    /**
     * @description Set this to `true` in order to tell codegen to skip documents validation.
     */
    assumeValid?: boolean;
  }
  export interface SchemaFromCodeFile {
    [path: string]: SchemaFromCodeFileOptions;
  }

  /**
   * @description A function to use for fetching the schema.
   * @see fetch
   */
  export type CustomSchemaFetcher = (url: string, options?: RequestInit) => Promise<Response>;

  /**
   * @additionalProperties false
   * @description Loads a schema from remote endpoint, with custom http options.
   */
  export interface UrlSchemaOptions {
    /**
     * @description HTTP headers you wish to add to the HTTP request sent by codegen to fetch your GraphQL remote schema.
     */
    headers?: { [headerName: string]: string };
    /**
     * @description Specify a Node module name, a custom file, or a function, to be used instead of a standard `fetch`.
     */
    customFetch?: string | CustomSchemaFetcher;
    /**
     * @description HTTP Method to use, either POST (default) or GET.
     */
    method?: string;
    /**
     * @description Handling the response as SDL will allow you to load schema from remote server that doesn't return a JSON introspection.
     */
    handleAsSDL?: boolean;
  }
  export interface UrlSchemaWithOptions {
    [url: string]: UrlSchemaOptions;
  }

  /**
   * @additionalProperties false
   * @description Loads a schema a local file or files, with customized options for parsing/loading.
   */
  export interface LocalSchemaPathOptions {
    /**
     * @description Skips checks for graphql-import syntax and loads the file as-is, without imports support.
     * @default true
     */
    skipGraphQLImport?: boolean;

    /**
     * @description Converts all GraphQL comments (`#` sign) to descriptions during the parse phase, to make it available
     * for plugins later.
     * @default false
     */
    commentDescriptions?: boolean;

    /**
     * Set to true to assume the SDL is valid.
     *
     * @default false
     */
    assumeValidSDL?: boolean;

    /**
     * By default, the parser creates AST nodes that know the location
     * in the source that they correspond to. This configuration flag
     * disables that behavior for performance or testing.
     *
     * @default false
     */
    noLocation?: boolean;

    /**
     * If enabled, the parser will parse empty fields sets in the Schema
     * Definition Language. Otherwise, the parser will follow the current
     * specification.
     *
     * This option is provided to ease adoption of the final SDL specification
     * and will be removed in v16.
     *
     * @default false
     */
    allowLegacySDLEmptyFields?: boolean;

    /**
     * If enabled, the parser will parse implemented interfaces with no `&`
     * character between each interface. Otherwise, the parser will follow the
     * current specification.
     *
     * This option is provided to ease adoption of the final SDL specification
     * and will be removed in v16.
     *
     * @default false
     */
    allowLegacySDLImplementsInterfaces?: boolean;

    /**
     * EXPERIMENTAL:
     *
     * If enabled, the parser will understand and parse variable definitions
     * contained in a fragment definition. They'll be represented in the
     * `variableDefinitions` field of the FragmentDefinitionNode.
     *
     * The syntax is identical to normal, query-defined variables. For example:
     *
     *   fragment A($var: Boolean = false) on T  {
     *     ...
     *   }
     *
     * Note: this feature is experimental and may change or be removed in the
     * future.
     *
     * @default false
     */
    experimentalFragmentVariables?: boolean;
  }
  export interface LocalSchemaPathWithOptions {
    [globPath: string]: LocalSchemaPathOptions;
  }

  export interface ApolloEngineSchemaOptions {
    'apollo-engine': ApolloEngineOptions;
  }

  export interface GitHubSchemaOptions {
    [githubProtocol: string]: { token: string };
  }

  export type SchemaGlobPath = string;
  /**
   * @description A URL to your GraphQL endpoint, a local path to `.graphql` file, a glob pattern to your GraphQL schema files, or a JavaScript file that exports the schema to generate code from. This can also be an array which specifies multiple schemas to generate code from. You can read more about the supported formats [here](schema-field#available-formats).
   */
  export type Schema =
    | string
    | UrlSchemaWithOptions
    | ApolloEngineSchemaOptions
    | GitHubSchemaOptions
    | LocalSchemaPathWithOptions
    | SchemaGlobPath
    | SchemaWithLoader
    | SchemaFromCodeFile;

  /* Document Definitions */
  export type OperationDocumentGlobPath = string;

  /**
   * @additionalProperties false
   * @description Specify a path to a custom loader for your GraphQL documents.
   */
  export interface CustomDocumentLoaderOptions {
    /**
     * @description Specify a path to a custom code file (local or module) that will handle the documents loading.
     */
    loader: string;
  }
  export interface CustomDocumentLoader {
    [path: string]: CustomDocumentLoaderOptions;
  }
  export type OperationDocument = OperationDocumentGlobPath | CustomDocumentLoader;

  /* Plugin Definition */
  export type PluginConfig<T = any> = { [key: string]: T };
  export interface ConfiguredPlugin {
    [name: string]: PluginConfig;
  }
  export type NamedPlugin = string;

  /* Output Definition */
  export type NamedPreset = string;
  export type OutputConfig = NamedPlugin | ConfiguredPlugin;

  export type PresetNamesBase =
    | 'client'
    | 'near-operation-file'
    | 'gql-tag-operations'
    | 'graphql-modules'
    | 'import-types';
  export type PresetNames = `${PresetNamesBase}-preset` | PresetNamesBase;

  /**
   * @additionalProperties false
   */
  export interface ConfiguredOutput {
    /**
     * @type array
     * @items { "$ref": "#/definitions/GeneratedPluginsMap" }
     * @description List of plugins to apply to this current output file.
     *
     * You can either specify plugins from the community using the NPM package name (after you installed it in your project), or you can use a path to a local file for custom plugins.
     *
     * You can find a list of available plugins here: https://the-guild.dev/graphql/codegen/docs/plugins/index
     * Need a custom plugin? read this: https://the-guild.dev/graphql/codegen/docs/custom-codegen/index
     */
    plugins?: OutputConfig[];
    /**
     * @description If your setup uses Preset to have a more dynamic setup and output, set the name of your preset here.
     *
     * Presets are a way to have more than one file output, for example: https://the-guild.dev/graphql/codegen/docs/presets/near-operation-file
     *
     * You can either specify a preset from the community using the NPM package name (after you installed it in your project), or you can use a path to a local file for a custom preset.
     *
     * List of available presets: https://graphql-code-generator.com/docs/presets/presets-index
     */
    preset?: PresetNames | OutputPreset;
    /**
     * @description If your setup uses Preset to have a more dynamic setup and output, set the configuration object of your preset here.
     *
     * List of available presets: https://graphql-code-generator.com/docs/presets/presets-index
     */
    presetConfig?: { [key: string]: any };
    /**
     * @description A flag to overwrite files if they already exist when generating code (`true` by default).
     *
     * For more details: https://graphql-code-generator.com/docs/config-reference/codegen-config
     */
    overwrite?: boolean;
    /**
     * @description A pointer(s) to your GraphQL documents: query, mutation, subscription and fragment. These documents will be loaded into for all your output files.
     * You can use one of the following:
     *
     * - Path to a local `.graphql` file
     * - Path to a code file (for example: `.js` or `.tsx`) containing GraphQL operation strings.
     * - Glob expression pointing to multiple `.graphql` files
     * - Glob expression pointing to multiple code files
     * - Inline string containing GraphQL SDL operation definition
     *
     * You can specify either a single file, or multiple.
     *
     * For more details: https://graphql-code-generator.com/docs/config-reference/documents-field
     */
    documents?: InstanceOrArray<OperationDocument>;
    /**
     * @description A pointer(s) to your GraphQL schema. This schema will be available only for this specific `generates` record.
     * You can use one of the following:
     *
     * - URL pointing to a GraphQL endpoint
     * - Path to a local `.json` file
     * - Path to a local `.graphql` file
     * - Glob expression pointing to multiple `.graphql` files
     * - Path to a local code file (for example: `.js`) that exports `GraphQLSchema` object
     * - Inline string containing GraphQL SDL schema definition
     *
     * You can specify either a single schema, or multiple, and GraphQL Code Generator will merge the schemas into a single schema.
     *
     * For more details: https://graphql-code-generator.com/docs/config-reference/schema-field
     */
    schema?: InstanceOrArray<Schema>;
    /**
     * @description Configuration object containing key => value that will be passed to the plugins.
     * Specifying configuration in this level of your configuration file will pass it to all plugins, in all outputs.
     *
     * The options may vary depends on what plugins you are using.
     *
     * For more details: https://graphql-code-generator.com/docs/config-reference/config-field
     */
    config?: PluginConfig;
    /**
     * @description Specifies scripts to run when events are happening in the codegen core.
     * Hooks defined on that level will effect only the current output files.
     *
     * For more details: https://graphql-code-generator.com/docs/config-reference/lifecycle-hooks
     */
    hooks?: Partial<LifecycleHooksDefinition>;
    /**
     * @description DocumentTransform changes documents before executing plugins.
     */
    documentTransforms?: OutputDocumentTransform[];
    /**
     * @description: Additional file pattern to watch when using watch mode
     */
    watchPattern?: string | string[];
  }

  /* Output Builder Preset */
  export type PresetFnArgs<
    Config = any,
    PluginConfig = {
      [key: string]: any;
    }
  > = {
    presetConfig: Config;
    baseOutputDir: string;
    plugins: Types.ConfiguredPlugin[];
    schema: DocumentNode;
    schemaAst?: GraphQLSchema;
    documents: Types.DocumentFile[];
    config: PluginConfig;
    pluginMap: {
      [name: string]: CodegenPlugin;
    };
    pluginContext?: {
      [name: string]: any;
    };
    profiler?: Profiler;
    cache?<T>(namespace: string, key: string, factory: () => Promise<T>): Promise<T>;
    documentTransforms?: ConfiguredDocumentTransform[];
  };

  export type OutputPreset<TPresetConfig = any> = {
    buildGeneratesSection: (options: PresetFnArgs<TPresetConfig>) => Promisable<GenerateOptions[]>;
    prepareDocuments?: (
      outputFilePath: string,
      outputSpecificDocuments: Types.OperationDocument[]
    ) => Promisable<Types.OperationDocument[]>;
  };

  /* Require Extensions */
  export type RequireExtension = InstanceOrArray<string>;

  /* PackageLoaderFn Loader */
  export type PackageLoaderFn<TExpectedResult> = (name: string) => Promisable<TExpectedResult>;

  /**
   * @description Represents the root YAML schema for the config file.
   * @additionalProperties false
   */
  export interface Config {
    /**
     * @description A pointer(s) to your GraphQL schema. This schema will be the base schema for all your outputs.
     * You can use one of the following:
     *
     * - URL pointing to a GraphQL endpoint
     * - Path to a local `.json` file
     * - Path to a local `.graphql` file
     * - Glob expression pointing to multiple `.graphql` files
     * - Path to a local code file (for example: `.js`) that exports `GraphQLSchema` object
     * - Inline string containing GraphQL SDL schema definition
     *
     * You can specify either a single schema, or multiple, and GraphQL Code Generator will merge the schemas into a single schema.
     *
     * For more details: https://graphql-code-generator.com/docs/config-reference/schema-field
     */
    schema?: InstanceOrArray<Schema>;
    /**
     * @description A path to a file which defines custom Node.JS require() handlers for custom file extensions.
     * This is essential if the code generator has to go through files which require other files in an unsupported format (by default).
     *
     * For more details: https://graphql-code-generator.com/docs/config-reference/require-field
     * See more information about require.extensions: https://gist.github.com/jamestalmage/df922691475cff66c7e6.
     *
     * Note: values that specified in your .yml file will get loaded after loading the config .yml file.
     */
    require?: RequireExtension;
    /**
     * @description Specify a Node module name, a custom file, or a function, to be used instead of a standard `fetch`.
     */
    customFetch?: string | CustomSchemaFetcher;
    /**
     * @description A pointer(s) to your GraphQL documents: query, mutation, subscription and fragment. These documents will be loaded into for all your output files.
     * You can use one of the following:
     *
     * - Path to a local `.graphql` file
     * - Path to a code file (for example: `.js` or `.tsx`) containing GraphQL operation strings.
     * - Glob expression pointing to multiple `.graphql` files
     * - Glob expression pointing to multiple code files
     * - Inline string containing GraphQL SDL operation definition
     *
     * You can specify either a single file, or multiple.
     *
     * For more details: https://graphql-code-generator.com/docs/config-reference/documents-field
     */
    documents?: InstanceOrArray<OperationDocument>;
    /**
     * @type object
     * @additionalProperties true
     * @description Configuration object containing key => value that will be passed to the plugins.
     * Specifying configuration in this level of your configuration file will pass it to all plugins, in all outputs.
     *
     * The options may vary depends on what plugins you are using.
     *
     * For more details: https://graphql-code-generator.com/docs/config-reference/config-field
     */
    config?: PluginConfig;
    /**
     * @description A map where the key represents an output path for the generated code and the value represents a set of options which are relevant for that specific file.
     *
     * For more details: https://graphql-code-generator.com/docs/config-reference/codegen-config
     */
    generates: {
      [outputPath: string]: ConfiguredOutput | ConfiguredPlugin[];
    };
    /**
     * @description A flag to overwrite files if they already exist when generating code (`true` by default).
     *
     * For more details: https://graphql-code-generator.com/docs/config-reference/codegen-config
     */
    overwrite?: boolean;
    /**
     * @description A flag to trigger codegen when there are changes in the specified GraphQL schemas.
     *
     * You can either specify a boolean to turn it on/off or specify an array of glob patterns to add custom files to the watch.
     *
     * For more details: https://graphql-code-generator.com/docs/getting-started/development-workflow#watch-mode
     */
    watch?: boolean | string | string[];
    /**
     * @description A flag to suppress non-zero exit code when there are no documents to generate.
     */
    ignoreNoDocuments?: boolean;
    /**
     * @deprecated Please use `importExtension` instead.
     * @description A flag to disable adding `.js` extension to the output file. Default: `true`.
     */
    emitLegacyCommonJSImports?: boolean;
    /**
     * @description Append this extension to all imports.
     * Useful for ESM environments that require file extensions in import statements.
     */
    importExtension?: '' | `.${string}`;
    /**
     * @description A flag to suppress printing errors when they occur.
     */
    silent?: boolean;
    /**
     * @description A flag to output more detailed information about tasks
     */
    verbose?: boolean;
    /**
     * @description A flag to output debug logs
     */
    debug?: boolean;
    /**
     * @description A flag to print only errors.
     */
    errorsOnly?: boolean;
    /**
     * @description If you are using the programmatic API in a browser environment, you can override this configuration to load your plugins in a way different than require.
     */
    pluginLoader?: PackageLoaderFn<CodegenPlugin>;
    /**
     * @description Additional context passed to plugins
     */
    pluginContext?: { [key: string]: any };
    /**
     * @description Allows you to override the configuration for `@graphql-tools/graphql-tag-pluck`, the tool that extracts your GraphQL operations from your code files.
     *
     * For more details: https://graphql-code-generator.com/docs/config-reference/documents-field#graphql-tag-pluck
     */
    pluckConfig?: {
      /**
       * @description An array of package name and identifier that will be used to track down your gql usages and imports. Use this if your code files imports gql from another library or you have a custom gql tag. identifier is the named export, so don't provide it if the tag function is imported as default.
       */
      modules?: Array<{
        /**
         * @description the name of the NPM package name you wish to look for
         */
        name: string;
        /**
         * @description the tag identifier name you wish to look for
         */
        identifier?: string;
      }>;
      /**
       * @description Configures the magic GraphQL comments to look for. The default is `GraphQL`.
       */
      gqlMagicComment?: string;
      /**
       * @description Overrides the name of the default GraphQL name identifier.
       */
      globalIdentifier?: string;
      /**
       * @description Allows to use a global identifier instead of a module import.
       */
      globalGqlIdentifierName?: string | string[];
    };
    /**
     * @description Specifies scripts to run when events are happening in the codegen core.
     * Hooks defined on that level will effect all output files.
     *
     * For more details: https://graphql-code-generator.com/docs/config-reference/lifecycle-hooks
     */
    hooks?: Partial<LifecycleHooksDefinition>;
    /**
     * @description Alows to raise errors if any matched files are not valid GraphQL. Default: false.
     */
    noSilentErrors?: boolean;
    /**
     * @description If `true`, write to files whichever `generates` block succeeds. If `false`, one failed `generates` means no output is written to files. Default: false
     */
    allowPartialOutputs?: boolean;
  }

  export type ComplexPluginOutput<M = Record<string, unknown>> = {
    content: string;
    prepend?: string[];
    append?: string[];
    meta?: M;
  };
  export type PluginOutput = string | ComplexPluginOutput;
  export type HookFunction = (...args: any[]) => void | Promise<void>;
  export type HookAlterFunction = (...args: any[]) => void | string | Promise<void | string>;

  export type LifeCycleHookValue = string | HookFunction | (string | HookFunction)[];
  export type LifeCycleAlterHookValue =
    | string
    | HookFunction
    | HookAlterFunction
    | (string | HookFunction | HookAlterFunction)[];

  /**
   * @description All available lifecycle hooks
   * @additionalProperties false
   */
  export type LifecycleHooksDefinition = {
    /**
     * @description Triggered with no arguments when the codegen starts (after the `codegen.yml` has beed parsed).
     *
     * Specify a shell command to run.
     */
    afterStart: LifeCycleHookValue;
    /**
     * @description Triggered with no arguments, right before the codegen closes, or when watch mode is stopped.
     *
     * Specify a shell command to run.
     */
    beforeDone: LifeCycleHookValue;
    /**
     * @description Triggered every time a file changes when using watch mode.
     * Triggered with two arguments: the type of the event (for example, `changed`) and the path of the file.
     */
    onWatchTriggered: LifeCycleHookValue;
    /**
     * @description Triggered in case of a general error in the codegen. The argument is a string containing the error.
     */
    onError: LifeCycleHookValue;
    /**
     * @description Triggered after a file is written to the file-system. Executed with the path for the file.
     * If the content of the file hasn't changed since last execution - this hooks won't be triggered.
     *
     * > This is a very useful hook, you can use it for integration with Prettier or other linters.
     */
    afterOneFileWrite: LifeCycleHookValue;
    /**
     * @description Executed after writing all the files to the file-system.
     * Triggered with multiple arguments - paths for all files.
     */
    afterAllFileWrite: LifeCycleHookValue;
    /**
     * @description Triggered before a file is written to the file-system.
     * Executed with the path and content for the file.
     *
     * Returning a string will override the content of the file.
     *
     * If the content of the file hasn't changed since last execution - this hooks won't be triggered.
     */
    beforeOneFileWrite: LifeCycleAlterHookValue;
    /**
     * @description Executed after the codegen has done creating the output and before writing the files to the file-system.
     *
     * Triggered with multiple arguments - paths for all relevant files.
     *
     * > Not all the files will be actually written to the file-system, because this is triggered before checking if the file has changed since last execution.
     */
    beforeAllFileWrite: LifeCycleHookValue;
  };

  export type SkipDocumentsValidationOptions =
    | {
        /**
         * @description Allows you to skip specific rules while validating the documents.
         * See all the rules; https://github.com/graphql/graphql-js/tree/main/src/validation/rules
         */
        ignoreRules?: string[];
        /**
         * @description Ignore duplicate documents validation
         */
        skipDuplicateValidation?: boolean;
        /**
         * @description Skip document validation entirely against the schema
         */
        skipValidationAgainstSchema?: boolean;
      }
    | boolean;

  export type DocumentTransformFunction<Config = object> = (options: {
    documents: Types.DocumentFile[];
    schema: DocumentNode;
    config: Config;
    pluginContext?: { [key: string]: any };
  }) => Types.Promisable<Types.DocumentFile[]>;

  export type DocumentTransformObject<T = object> = {
    transform: DocumentTransformFunction<T>;
  };

  export type DocumentTransformFileName = string;
  export type DocumentTransformFileConfig<T = object> = { [name: DocumentTransformFileName]: T };
  export type DocumentTransformFile<T> = DocumentTransformFileName | DocumentTransformFileConfig<T>;

  export type OutputDocumentTransform<T = object> = DocumentTransformObject<T> | DocumentTransformFile<T>;
  export type ConfiguredDocumentTransform<T = object> = {
    name: string;
    transformObject: DocumentTransformObject<T>;
    config?: T;
  };
}

export function isComplexPluginOutput(obj: Types.PluginOutput): obj is Types.ComplexPluginOutput {
  return typeof obj === 'object' && Object.prototype.hasOwnProperty.call(obj, 'content');
}

export type PluginFunction<T = any, TOutput extends Types.PluginOutput = Types.PluginOutput> = (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config: T,
  info?: {
    outputFile?: string;
    allPlugins?: Types.ConfiguredPlugin[];
    pluginContext?: { [key: string]: any };
    [key: string]: any;
  }
) => Types.Promisable<TOutput>;

export type PluginValidateFn<T = any> = (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config: T,
  outputFile: string,
  allPlugins: Types.ConfiguredPlugin[],
  pluginContext?: { [key: string]: any }
) => Types.Promisable<void>;

export type AddToSchemaResult = string | DocumentNode | undefined;

export interface CodegenPlugin<T = any> {
  plugin: PluginFunction<T>;
  addToSchema?: AddToSchemaResult | ((config: T) => AddToSchemaResult);
  validate?: PluginValidateFn;
}
