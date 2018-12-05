import { DocumentLoader } from './document-loader';
import { parse, Source, DocumentNode } from 'graphql';
import { Types, DocumentFile } from 'graphql-codegen-core';
import * as isGlob from 'is-glob';
import * as glob from 'glob';
import { existsSync, readFileSync } from 'fs';
import { extname } from 'path';
import { extractDocumentStringFromCodeFile } from '../../utils/document-finder';
import { DetailedError } from '../../errors';
import isValidPath = require('is-valid-path');

export const graphQLExtensions = ['.graphql', '.graphqls', '.gql'];

export class DocumentsFromGlob implements DocumentLoader {
  canHandle(doc: string): Promise<boolean> | boolean {
    return isGlob(doc) || isValidPath(doc);
  }

  documentsFromGlobs(documentGlob: string): Promise<string[]> {
    return new Promise<string[]>((resolve, reject) => {
      glob(documentGlob, (err, files) => {
        if (err) {
          reject(err);
        }

        if (!files || files.length === 0) {
          console['warn'](`No files matched for glob expression: ${documentGlob}`);
        }

        resolve(files);
      });
    });
  }

  loadFileContent(filePath: string): DocumentNode | null {
    if (existsSync(filePath)) {
      const fileContent = readFileSync(filePath, 'utf8');
      const fileExt = extname(filePath);

      if (graphQLExtensions.includes(fileExt)) {
        return parse(new Source(fileContent, filePath));
      }

      const foundDoc = extractDocumentStringFromCodeFile(new Source(fileContent, filePath));

      if (foundDoc) {
        return parse(new Source(foundDoc, filePath));
      } else {
        return null;
      }
    } else {
      throw new DetailedError(
        'Failed to load a document',
        `

      Failed to load a document.
      Document file ${filePath} does not exists.

      `
      );
    }
  }

  loadDocumentsSources(filePaths: string[]): DocumentFile[] {
    return filePaths
      .map(filePath => ({ filePath, content: this.loadFileContent(filePath) }))
      .filter(result => result.content);
  }

  async handle(doc: string, config: Types.Config): Promise<DocumentFile[]> {
    const foundDocumentsPaths = await this.documentsFromGlobs(doc);

    return this.loadDocumentsSources(foundDocumentsPaths);
  }
}
