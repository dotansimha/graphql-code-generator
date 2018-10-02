export interface CLIOptions {
  schema?: string;
  clientSchema?: string;
  args?: string[];
  template?: string;
  project?: string;
  out?: string;
  header?: string[];
  skipSchema?: any;
  skipDocuments?: any;
  config?: string;
  require?: string[];
  overwrite?: boolean;
  watch?: boolean;
  silent?: boolean;
  mergeSchema?: string;
  includeIntrospectionTypes?: boolean;
}
