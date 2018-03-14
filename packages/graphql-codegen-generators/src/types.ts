// tslint:disable-next-line:variable-name
export const EInputType = {
  SINGLE_FILE: 'SINGLE_FILE',
  MULTIPLE_FILES: 'MULTIPLE_FILES',
  PROJECT: 'PROJECT'
};

export interface GeneratorConfig {
  inputType: string; // EInputType
  flattenTypes: boolean;
  config?: { [configName: string]: any };
  templates: { [templateName: string]: string | string[] } | string;
  primitives: {
    String: string;
    Int: string;
    Float: string;
    Boolean: string;
    ID: string;
  };
  outFile?: string;
  filesExtension?: string;
  customHelpers?: { [helperName: string]: Function };
}
