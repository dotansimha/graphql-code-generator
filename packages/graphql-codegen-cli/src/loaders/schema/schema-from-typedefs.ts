import { Types } from 'graphql-codegen-core';
import { SchemaLoader } from './schema-loader';
import * as isGlob from 'is-glob';
import isValidPath = require('is-valid-path');
import { DocumentNode, parse } from 'graphql';
import * as glob from 'glob';
import { readFileSync } from 'fs';
import * as fs from 'fs';
import { DetailedError } from '../../errors';
import { graphQLExtensions } from '../documents/documents-from-glob';
import { mergeGraphQLSchemas } from '@graphql-modules/epoxy';

function isGraphQLFile(globPath: string): boolean {
  return graphQLExtensions.some(ext => globPath.endsWith(ext));
}

function loadSchemaFile(filepath: string): string {
  const content = fs.readFileSync(filepath, {
    encoding: 'utf-8'
  });

  if (/^\# import /i.test(content.trimLeft())) {
    const { importSchema } = require('graphql-import');

    return importSchema(filepath);
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
      return mergeGraphQLSchemas(globFiles.map(filePath => readFileSync(filePath, 'utf-8')));
    } else {
      return parse(loadSchemaFile(globFiles[0]));
    }
  }
}
