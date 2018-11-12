import { Types } from 'graphql-codegen-core';
import { SchemaLoader } from './schema-loader';
import * as isGlob from 'is-glob';
import isValidPath = require('is-valid-path');
import chalk from 'chalk';
import { GraphQLSchema } from 'graphql';
import * as glob from 'glob';
import { makeExecutableSchema } from 'graphql-tools';
import { readFileSync } from 'fs';
import { importSchema } from 'graphql-import';
import * as path from 'path';
import * as fs from 'fs';
import { DetailedError } from '../../errors';
import { graphQLExtensions } from '../documents/documents-from-glob';

function isGraphQLFile(globPath: string): boolean {
  return graphQLExtensions.some(ext => globPath.endsWith(ext));
}

function loadSchemaFile(filepath: string): string {
  const content = fs.readFileSync(filepath, {
    encoding: 'utf-8'
  });

  if (/^\# import /i.test(content.trimLeft())) {
    return importSchema(filepath);
  }

  return content;
}

export class SchemaFromTypedefs implements SchemaLoader {
  canHandle(globPath: string): boolean {
    return isGlob(globPath) || (isValidPath(globPath) && isGraphQLFile(globPath));
  }

  handle(globPath: string, config: Types.Config, schemaOptions: any): GraphQLSchema {
    const globFiles = glob.sync(globPath, { cwd: process.cwd() });

    if (!globFiles || globFiles.length === 0) {
      throw new DetailedError(
        'Unable to find matching files',
        `
      
        Unable to find matching files for glob: ${globPath} in directory: ${process.cwd()}
      `
      );
    }

    let mergeLogic = <T = any>(arr: T[]) => arr;

    if ('mergeSchemaFiles' in config) {
      const patternArr = config.mergeSchemaFiles.split('#');
      const mergeModuleName = patternArr[0];
      const mergeFunctionName = patternArr[1];
      if (!mergeModuleName || !mergeFunctionName) {
        throw new DetailedError(
          `You have to specify your merge logic with 'mergeSchema' option`,
          `

          You have to specify your merge logic with 'mergeSchema' option.

          The pattern is following:
            
            ${chalk.bold('path/to/file')}#${chalk.bold('merge')}

            - path/to/file - points to JavaScript module
            - merge - name of exported function
          
          
          CLI:

            $ gql-gen --mergeSchema path/to/file#merge

          API:

            generate({
              mergeSchema: 'path/to/file#merge',
              ...
            });

        `
        );
      }
      const localFilePath = path.resolve(process.cwd(), mergeModuleName);
      const localFileExists = fs.existsSync(localFilePath);
      const mergeModule = require(localFileExists ? localFilePath : mergeModuleName);
      if (!(mergeFunctionName in mergeModule)) {
        throw new DetailedError(
          `Provided function couldn't be found`,
          `
        
          Provided ${mergeFunctionName} function couldn't be found in ${mergeModule}

          You probably forgot to export ${mergeFunctionName} function

            export const ${mergeFunctionName} ...

        `
        );
      }
      mergeLogic = mergeModule[mergeFunctionName];
    }

    const typeDefs =
      globFiles.length > 1
        ? mergeLogic(globFiles.map(filePath => readFileSync(filePath, 'utf-8')))
        : loadSchemaFile(globFiles[0]);

    return makeExecutableSchema({
      typeDefs,
      allowUndefinedInResolve: true,
      resolvers: {},
      resolverValidationOptions: { requireResolversForResolveType: false }
    });
  }
}
