export interface Config {
  singleFile: boolean;
  flattenTypes: boolean;
  templates: { [templateName: string]: string };
  primitives: {
    String: string;
    Int: string;
    Float: string;
    Boolean: string;
    ID: string;
  };
}

export interface FileOutput {
  filename: string;
  content: string;
}
