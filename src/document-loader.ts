import {DocumentNode, Source, parse, concatAST} from 'graphql';
import * as fs from 'fs';

export const loadFileContent = (filePath: string): DocumentNode => {
  if (fs.existsSync(filePath)) {
    return parse(new Source(fs.readFileSync(filePath, 'utf8'), filePath));
  } else {
    throw new Error(`Document file ${filePath} does not exists!`);
  }
};

export const loadDocumentsSources = (filePaths: string[]): DocumentNode => {
  return concatAST(filePaths.map<DocumentNode>(loadFileContent));
};
