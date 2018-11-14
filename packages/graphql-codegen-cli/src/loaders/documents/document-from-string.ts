import { DocumentLoader } from './document-loader';
import isValidPath = require('is-valid-path');
import { Types, DocumentFile } from 'graphql-codegen-core';
import { parse } from 'graphql';

export class DocumentFromString implements DocumentLoader {
  canHandle(doc: string): Promise<boolean> | boolean {
    if (isValidPath(doc)) {
      return false;
    }

    try {
      parse(doc);

      return true;
    } catch (e) {
      return false;
    }
  }

  handle(doc: string, config: Types.Config): Promise<DocumentFile[]> | DocumentFile[] {
    return [{ filePath: 'document.graphql', content: parse(doc) }];
  }
}
