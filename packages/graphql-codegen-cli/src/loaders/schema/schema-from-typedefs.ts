import { SchemaLoader } from './schema-loader';
import * as isGlob from 'is-glob';
import * as isValidPath from 'is-valid-path';
import { GraphQLSchema } from 'graphql';
import * as glob from 'glob';
import { makeExecutableSchema } from 'graphql-tools';
import { readFileSync } from 'fs';
import { CLIOptions } from '../../cli-options';
import { mergeGraphQLSchemas } from '@graphql-modules/epoxy';

export class SchemaFromTypedefs implements SchemaLoader {
  canHandle(globPath: string): boolean {
    return isGlob(globPath) && !isValidPath(globPath);
  }

  handle(globPath: string, cliOptions: CLIOptions): GraphQLSchema {
    const globFiles = glob.sync(globPath, { cwd: process.cwd() });

    if (!globFiles || globFiles.length === 0) {
      throw new Error(`Unable to find matching files for glob: ${globPath}!`);
    }

    return makeExecutableSchema({
      typeDefs: mergeGraphQLSchemas(globFiles.map(filePath => readFileSync(filePath, 'utf-8'))),
      allowUndefinedInResolve: true,
      resolvers: {}
    });
  }
}
