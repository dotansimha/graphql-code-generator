import {Source} from 'graphql';
import * as fs from 'fs';

export const loadFileContent = (filePath: string): Source => {
  if (fs.existsSync(filePath)) {
    return new Source(fs.readFileSync(filePath, 'utf8'), filePath);
  } else {
    throw new Error(`Document file ${filePath} does not exists!`);
  }
};

export const loadDocumentsSources = (filePaths: string[]): Source[] => {
  return filePaths.map<Source>(loadFileContent);
};
