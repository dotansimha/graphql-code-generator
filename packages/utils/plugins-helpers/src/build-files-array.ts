import { AstNode, Document } from 'graphql-codegen-core';
import { resolve, extname, basename } from 'path';

export interface TemplateDocumentFileReference {
  relative: string;
  absolute: string;
  cwd: string;
  filename: string;
  extension: string;
  documents: AstNode[];
}

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
