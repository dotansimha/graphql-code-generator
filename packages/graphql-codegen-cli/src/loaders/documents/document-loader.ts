import { DocumentNode, Source, parse, DocumentFile } from 'graphql-codegen-core';
import * as fs from 'fs';
import * as path from 'path';
import { extractDocumentStringFromCodeFile } from '../../utils/document-finder';
import { DetailedError } from '../../errors';

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
    } else {
      return null;
    }
  } else {
    throw new DetailedError(`

      Failed to load a document.
      Document file ${filePath} does not exists.

    `);
  }
};

export const loadDocumentsSources = (filePaths: string[]): DocumentFile[] => {
  return filePaths.map(filePath => ({ filePath, content: loadFileContent(filePath) })).filter(result => result.content);
};
