import { SchemaLoader } from './schema-loader';
import * as isGlob from 'is-glob';
import * as isValidPath from 'is-valid-path';
import { GraphQLSchema } from 'graphql';
import * as glob from 'glob';
import { makeExecutableSchema } from 'graphql-tools';
import { readFileSync } from 'fs';
import { importSchema } from 'graphql-import';
import { CLIOptions } from '../../cli-options';
import * as path from 'path';
import * as fs from 'fs';

export class SchemaFromTypedefs implements SchemaLoader {
  canHandle(globPath: string): boolean {
    return isGlob(globPath) || (isValidPath(globPath) && globPath.endsWith('.graphql'));
  }

  handle(globPath: string, cliOptions: CLIOptions): GraphQLSchema {
    const globFiles = glob.sync(globPath, { cwd: process.cwd() });

    if (!globFiles || globFiles.length === 0) {
      throw new Error(`Unable to find matching files for glob: ${globPath}!`);
    }

    let mergeLogic = arr => arr;

    if ('mergeSchema' in cliOptions) {
      const patternArr = cliOptions.mergeSchema.split('#');
      const mergeModuleName = patternArr[0];
      const mergeFunctionName = patternArr[1];
      if (!mergeModuleName || !mergeFunctionName) {
        throw new Error('You have to specify your merge logic with `mergeSchema` option; <mergeModule#mergeFn>');
      }
      const localFilePath = path.resolve(process.cwd(), mergeModuleName);
      const localFileExists = fs.existsSync(localFilePath);
      const mergeModule = require(localFileExists ? localFilePath : mergeModuleName);
      if (!(mergeFunctionName in mergeModule)) {
        throw new Error(`${mergeFunctionName} couldn't be found in ${mergeModule}`);
      }
      mergeLogic = mergeModule[mergeFunctionName];
    }

    const typeDefs =
      globFiles.length > 1
        ? mergeLogic(globFiles.map(filePath => readFileSync(filePath, 'utf-8')))
        : importSchema(globFiles[0]);

    return makeExecutableSchema({
      typeDefs,
      allowUndefinedInResolve: true,
      resolvers: {}
    });
  }
}
