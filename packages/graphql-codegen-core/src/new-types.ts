import { GraphQLSchema } from 'graphql';
import { DocumentFile } from './types';

export namespace Types {
  /* Utils */
  export type InstanceOrArray<T> = T | T[];

  /* Schema Definition */
  export type UrlSchema = string | { [url: string]: { headers?: { [headerName: string]: string } } };
  export type LocalSchemaPath = string;
  export type SchemaGlobPath = string;
  export type Schema = UrlSchema | LocalSchemaPath | SchemaGlobPath;

  /* Document Definitions */
  export type OperationDocumentGlobPath = string;
  export type OperationDocument = OperationDocumentGlobPath;

  /* Plugin Definition */
  export type PluginConfig = InstanceOrArray<string> | { [key: string]: any };
  export type ConfiguredPlugin = { [name: string]: PluginConfig };
  export type NamedPlugin = string;

  /* Output Definition */
  export type OutputConfig = InstanceOrArray<NamedPlugin | ConfiguredPlugin>;
  export type ConfiguredOutput = {
    documents?: InstanceOrArray<OperationDocument>;
    schema?: InstanceOrArray<Schema>;
    plugins: OutputConfig;
  };

  /* Require Extensions */
  export type RequireExtension = InstanceOrArray<string>;

  /* Config Definition */
  export interface Config {
    schema: InstanceOrArray<Schema>;
    require: RequireExtension;
    mergeSchemaFiles?: string;
    documents?: InstanceOrArray<OperationDocument>;
    generates: { [filename: string]: OutputConfig | ConfiguredOutput };
    overwrite?: boolean;
    watch?: boolean;
    silent?: boolean;
  }
}

export type PluginFunction<T = any> = (schema: GraphQLSchema, documents: DocumentFile[], config: T) => Promise<string>;
