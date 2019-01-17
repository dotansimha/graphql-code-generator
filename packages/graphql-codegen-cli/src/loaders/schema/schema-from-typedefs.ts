import { Types, debugLog } from 'graphql-codegen-core';
import { SchemaLoader } from './schema-loader';
import * as isGlob from 'is-glob';
import isValidPath = require('is-valid-path');
import { DocumentNode, parse, Source } from 'graphql';
import * as glob from 'glob';
import { readFileSync } from 'fs';
import { extname } from 'path';
import { DetailedError } from '../../errors';
import { graphQLExtensions } from '../documents/documents-from-glob';
import { mergeGraphQLSchemas } from '@graphql-modules/epoxy';
import { extractDocumentStringFromCodeFile } from '../../utils/document-finder';

function isGraphQLFile(globPath: string): boolean {
  return graphQLExtensions.some(ext => globPath.endsWith(ext));
}

function loadSchemaFile(filepath: string): string {
  const content = readFileSync(filepath, {
    encoding: 'utf-8'
  });

  if (/^\# import /i.test(content.trimLeft())) {
    debugLog(`[Schema Loader] Using 'graphql-import' package`);
    const { importSchema } = require('graphql-import');

    return importSchema(filepath);
  }

  const foundDoc = extractDocumentStringFromCodeFile(new Source(content, filepath));

  if (foundDoc) {
    return foundDoc;
  }

  return content;
}

export class SchemaFromTypedefs implements SchemaLoader {
  canHandle(globPath: string): boolean {
    return isGlob(globPath) || (isValidPath(globPath) && isGraphQLFile(globPath));
  }

  handle(globPath: string, config: Types.Config, schemaOptions: any): DocumentNode {
    const globFiles = glob.sync(globPath, { cwd: process.cwd() });

    if (!globFiles || globFiles.length === 0) {
      throw new DetailedError(
        'Unable to find matching files',
        `
      
        Unable to find matching files for glob: ${globPath} in directory: ${process.cwd()}
      `
      );
    }

    if (globFiles.length > 1) {
      return mergeGraphQLSchemas(globFiles.map(filePath => this.loadFileContent(filePath)).filter(f => f));
    } else {
      return parse(loadSchemaFile(globFiles[0]));
    }
  }

  loadFileContent(filePath: string): Source {
    const fileContent = readFileSync(filePath, 'utf8');
    const fileExt = extname(filePath);

    if (graphQLExtensions.includes(fileExt)) {
      return new Source(fileContent, filePath);
    }

    const foundDoc = extractDocumentStringFromCodeFile(new Source(fileContent, filePath));

    if (foundDoc) {
      return new Source(foundDoc, filePath);
    }

    return null;
  }
}
