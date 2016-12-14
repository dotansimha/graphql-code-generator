import * as handlebars from 'handlebars';
import * as fs from 'fs';
import {GeneratorTemplate, getGenerators} from './templates';

export const loadFromPath = (filePath: string): string => {
  if (fs.existsSync(filePath)) {
    return fs.readFileSync(filePath, 'utf8');
  } else {
    throw new Error(`Template file ${filePath} does not exists!`);
  }
};

const getGeneratorTemplate = (templateName: string): GeneratorTemplate => {
  return getGenerators().find(item => (item.aliases || []).indexOf(templateName.toLowerCase()) > -1);
};

export const getTemplateGenerator = (template: string): Promise<GeneratorTemplate> => {
  return new Promise<GeneratorTemplate>((resolve, reject) => {
    const generatorTemplate = getGeneratorTemplate(template);

    if (generatorTemplate) {
      resolve(generatorTemplate);
    }
    else {
      const allowedTemplates = getGenerators().map(item => item.aliases).reduce((a, b) => a.concat(b)).join(', ');
      reject(`Unknown template language specified: ${template}, available are: ${allowedTemplates}`);
    }
  });
};

export const compileTemplate = (compileContext: any, templatePath: string): string => {
  return handlebars.compile(loadFromPath(templatePath))(compileContext);
};
