export interface PluginOption {
  name: string;
  package: string;
  value: string;
  pathInRepo: string;
  available(tags: Tags[]): boolean;
  shouldBeSelected(tags: Tags[]): boolean;
}

export interface Answers {
  targets: Tags[];
  config: string;
  plugins: PluginOption[];
  schema: string;
  documents?: string;
  output: string;
  script: string;
  introspection: boolean;
}

export enum Tags {
  browser = 'Browser',
  node = 'Node',
  typescript = 'TypeScript',
  flow = 'Flow',
  angular = 'Angular',
  stencil = 'Stencil',
  react = 'React',
}
