import {Codegen} from './interfaces';
import * as handlebars from 'handlebars';
import * as fs from 'fs';

const loadFromPath = (filePath: string): string => {
  if (fs.existsSync(filePath)) {
    return fs.readFileSync(filePath, 'utf8');
  } else {
    throw new Error(`Template file ${filePath} does not exists!`);
  }
};

export const generateCode = (codegen: Codegen, templatePath: string): string => {
  return handlebars.compile(loadFromPath(templatePath))(codegen);
};
