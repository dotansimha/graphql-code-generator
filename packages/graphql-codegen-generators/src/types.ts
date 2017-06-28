export interface Config {
  template: string;
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
