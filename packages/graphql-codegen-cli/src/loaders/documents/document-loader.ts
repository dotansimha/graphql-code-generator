import { Types, DocumentFile } from 'graphql-codegen-core';

export interface DocumentLoader {
  canHandle(doc: string): Promise<boolean> | boolean;
  handle(doc: string, config: Types.Config): Promise<DocumentFile[]> | DocumentFile[];
}
