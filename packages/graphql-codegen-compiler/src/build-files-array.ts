import { Document, TemplateDocumentFileReference } from 'graphql-codegen-core';
import { AstNode } from '../../graphql-codegen-core/dist/types';
import { resolve, extname, basename } from 'path';

function getFileAttrs(
  filePath: string
): { cwd: string; relative: string; absolute: string; filename: string; extension: string } {
  const cwd = process.cwd();

  return {
    cwd,
    relative: filePath,
    absolute: resolve(filePath),
    filename: basename(filePath),
    extension: extname(filePath)
  };
}

export function buildFilesArray(parsedDocument: Document): TemplateDocumentFileReference[] {
  const filesMap: { [filename: string]: AstNode[] } = {};
  const relevantOperations = [...parsedDocument.operations, ...parsedDocument.fragments].filter(o => o.originalFile);

  for (const operation of relevantOperations) {
    if (!filesMap[operation.originalFile]) {
      filesMap[operation.originalFile] = [];
    }

    filesMap[operation.originalFile].push(operation);
  }

  return Object.keys(filesMap).map(filename => ({ documents: filesMap[filename], ...getFileAttrs(filename) }));
}
