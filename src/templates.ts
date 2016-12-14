import * as fs from 'fs';
import * as path from 'path';

export interface TemplateConfig {
  strategy: 'SINGLE_FILE' | 'MULTIPLE_FILES';
  template?: string;
  filesExtension?: string;
  templates?: {[key: string]: string};
  primitives?: {[key: string]: string};
  basePath?: string;
}

export interface GeneratorTemplate {
  language: string;
  aliases: string[];
  config?: TemplateConfig;
}

const getConfig = (generatorPath: string): TemplateConfig => {
  let dirString = __dirname;
  const configPath = path.resolve(dirString, generatorPath, 'config.json');
  let config = <TemplateConfig>(JSON.parse(fs.readFileSync(configPath, 'utf8')));
  config.basePath = generatorPath;

  return config;
};

export const getGenerators = () => {
  return [
    {
      language: 'TypeScript Single File',
      aliases: ['ts', 'typescript', 'ts-single', 'typescript-single'],
      config: getConfig('../generators/typescript-single-file/')
    },
    {
      language: 'TypeScript Multiple Files',
      aliases: ['ts-multiple', 'typescript-multiple'],
      config: getConfig('../generators/typescript-multiple-files/')
    },
    {
      language: 'Flow Single File',
      aliases: ['flow', 'flow-single'],
      config: getConfig('../generators/flow-single-file/')
    }
  ];
};

