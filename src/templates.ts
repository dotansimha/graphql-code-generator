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
  let dirString = path.dirname(fs.realpathSync(__filename));
  let config = <TemplateConfig>(JSON.parse(fs.readFileSync(path.resolve(dirString, generatorPath, 'config.json'), 'utf8')));
  config.basePath = generatorPath;

  return config;
};

export const generators: GeneratorTemplate[] = [
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
