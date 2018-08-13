import { SchemaLoader } from './schema-loader';
import * as isGlob from 'is-glob';
import * as isValidPath from 'is-valid-path';
import { GraphQLSchema } from 'graphql';
import * as glob from 'glob';
import { makeExecutableSchema } from 'graphql-tools';
import { readFileSync } from 'fs';
import { importSchema } from 'graphql-import';
import { CLIOptions } from '../../cli-options';

export class SchemaFromTypedefs implements SchemaLoader {
  canHandle(globPath: string): boolean {
    return isGlob(globPath) || (isValidPath(globPath) && globPath.endsWith('.graphql'));
  }

  handle(globPath: string, cliOptions: CLIOptions): GraphQLSchema {
    const globFiles = glob.sync(globPath, { cwd: process.cwd() });

    if (!globFiles || globFiles.length === 0) {
      throw new Error(`Unable to find matching files for glob: ${globPath}!`);
    }

    const typeDefs =
      globFiles.length > 1 ? globFiles.map(filePath => readFileSync(filePath, 'utf-8')) : importSchema(globFiles[0]);

    return makeExecutableSchema({
      typeDefs,
      allowUndefinedInResolve: true,
      resolvers: {}
    });
  }
}
