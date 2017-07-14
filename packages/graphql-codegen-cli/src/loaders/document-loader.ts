import { DocumentNode, Source, parse, concatAST } from 'graphql-codegen-core';
import * as fs from 'fs';
import * as path from 'path';
import { extractDocumentStringFromCodeFile } from '../utils/document-finder';

export const loadFileContent = (filePath: string): DocumentNode | null => {
  if (fs.existsSync(filePath)) {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const fileExt = path.extname(filePath);

    if (fileExt === '.graphql' || fileExt === '.gql') {
      return parse(new Source(fileContent, filePath));
    }

    const foundDoc = extractDocumentStringFromCodeFile(fileContent);

    if (foundDoc) {
      return parse(new Source(foundDoc, filePath));
    }
    else {
      return null;
    }
  } else {
    throw new Error(`Document file ${filePath} does not exists!`);
  }
};

export const loadDocumentsSources = (filePaths: string[]): DocumentNode => {
  return concatAST(filePaths.map<DocumentNode>(loadFileContent).filter(content => content));
};
