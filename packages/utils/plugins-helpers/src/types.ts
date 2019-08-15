import { GraphQLSchema, DocumentNode } from 'graphql';

export namespace Types {
  export interface GenerateOptions {
    filename: string;
    plugins: Types.ConfiguredPlugin[];
    schema: DocumentNode;
    schemaAst?: GraphQLSchema;
    documents: Types.DocumentFile[];
    config: { [key: string]: any };
    pluginMap: {
      [name: string]: CodegenPlugin;
    };
    skipDuplicateDocumentsValidation?: boolean;
  }

  export type FileOutput = {
    filename: string;
    content: string;
    hooks?: {
      beforeOneFileWrite?: LifecycleHooksDefinition<string | string[]>['beforeOneFileWrite'];
      afterOneFileWrite?: LifecycleHooksDefinition<string | string[]>['afterOneFileWrite'];
    };
  };

  export type DocumentFile = {
    filePath: string;
    content: DocumentNode;
  };

  /* Utils */
  export type ObjectMap<T = any> = { [key: string]: T };
  export type Promisable<T> = T | Promise<T>;
  export type InstanceOrArray<T> = T | T[];

  /* Schema Definition */
  export type SchemaWithLoader = { [schemaString: string]: { loader: string } };
  export type UrlSchema = string | { [url: string]: { headers?: { [headerName: string]: string } } };
  export type LocalSchemaPath = string;
  export type SchemaGlobPath = string;
  export type Schema = UrlSchema | LocalSchemaPath | SchemaGlobPath | SchemaWithLoader;

  /* Document Definitions */
  export type OperationDocumentGlobPath = string;
  export type CustomDocumentLoader = { [path: string]: { loader: string } };
  export type OperationDocument = OperationDocumentGlobPath | CustomDocumentLoader;

  /* Plugin Definition */
  export type PluginConfig = InstanceOrArray<string> | ObjectMap;
  export type ConfiguredPlugin = { [name: string]: PluginConfig };
  export type NamedPlugin = string;

  /* Output Definition */
  export type NamedPreset = string;
  export type OutputConfig = InstanceOrArray<NamedPlugin | ConfiguredPlugin>;
  export type ConfiguredOutput = {
    plugins: OutputConfig;
    preset?: string | OutputPreset;
    presetConfig?: { [key: string]: any };
    overwrite?: boolean;
    documents?: InstanceOrArray<OperationDocument>;
    schema?: InstanceOrArray<Schema>;
    config?: PluginConfig;
    hooks?: LifecycleHooksDefinition<string | string[]>;
  };

  /* Output Builder Preset */
  export type PresetFnArgs<Config = any> = {
    presetConfig: Config;
    baseOutputDir: string;
    plugins: Types.ConfiguredPlugin[];
    schema: DocumentNode;
    schemaAst?: GraphQLSchema;
    documents: Types.DocumentFile[];
    config: { [key: string]: any };
    pluginMap: {
      [name: string]: CodegenPlugin;
    };
  };

  export type OutputPreset<TPresetConfig = any> = {
    buildGeneratesSection: (options: PresetFnArgs<TPresetConfig>) => Promisable<GenerateOptions[]>;
  };

  /* Require Extensions */
  export type RequireExtension = InstanceOrArray<string>;

  /* PackageLoaderFn Loader */
  export type PackageLoaderFn<TExpectedResult> = (name: string) => Promisable<TExpectedResult>;

  /* Config Definition */
  export interface Config {
    schema?: InstanceOrArray<Schema>;
    require?: RequireExtension;
    customFetch?: string;
    documents?: InstanceOrArray<OperationDocument>;
    config?: { [key: string]: any };
    generates: { [output: string]: OutputConfig | ConfiguredOutput };
    overwrite?: boolean;
    watch?: boolean | string | string[];
    configFilePath?: string;
    silent?: boolean;
    pluginLoader?: PackageLoaderFn<CodegenPlugin>;
    pluckConfig?: {
      modules?: Array<{
        name: string;
        identifier?: string;
      }>;
      magicComment?: string;
      globalIdentifier?: string;
    };
    hooks?: LifecycleHooksDefinition<string | string[]>;
  }

  export type ComplexPluginOutput = { content: string; prepend?: string[]; append?: string[] };
  export type PluginOutput = string | ComplexPluginOutput;

  export type LifecycleHooksDefinition<T = string | string[]> = {
    afterStart: T;
    beforeDone: T;
    onWatchTriggered: T;
    onError: T;
    afterOneFileWrite: T;
    afterAllFileWrite: T;
    beforeOneFileWrite: T;
    beforeAllFileWrite: T;
    [key: string]: T;
  };
}

export function isComplexPluginOutput(obj: Types.PluginOutput): obj is Types.ComplexPluginOutput {
  return typeof obj === 'object' && obj.hasOwnProperty('content');
}

export type PluginFunction<T = any> = (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config: T,
  info?: {
    outputFile?: string;
    allPlugins?: Types.ConfiguredPlugin[];
    [key: string]: any;
  }
) => Types.Promisable<Types.PluginOutput>;

export type PluginValidateFn<T = any> = (schema: GraphQLSchema, documents: Types.DocumentFile[], config: T, outputFile: string, allPlugins: Types.ConfiguredPlugin[]) => Types.Promisable<void>;

export type AddToSchemaResult = string | DocumentNode | undefined;

export interface CodegenPlugin<T = any> {
  plugin: PluginFunction<T>;
  addToSchema?: AddToSchemaResult | ((config: T) => AddToSchemaResult);
  validate?: PluginValidateFn;
}
