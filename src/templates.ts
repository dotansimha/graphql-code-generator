export interface GeneratorTemplate {
  language: string;
  aliases: string[];
  templateFile: string;
  configFile?: string;
}

export const generators: GeneratorTemplate[] = [
  {
    language: 'TypeScript',
    aliases: ['ts', 'typescript'],
    templateFile: './generators/typescript/graphql-types.d.ts.handlebars',
    configFile: './generators/typescript/config.json'
  }
];
