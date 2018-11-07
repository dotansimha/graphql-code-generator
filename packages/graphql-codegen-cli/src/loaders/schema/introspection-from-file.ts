import { introspectionToGraphQLSchema, validateIntrospection } from 'graphql-codegen-core';
import { GraphQLSchema } from 'graphql';
import { SchemaLoader } from './schema-loader';
import { existsSync, readFileSync } from 'fs';
import isValidPath = require('is-valid-path');
import { extname, isAbsolute, resolve as resolvePath } from 'path';
import { CLIOptions } from '../../cli-options';
import { getSpinner } from '../../spinner';
import { DetailedError } from '../../errors';

export class IntrospectionFromFileLoader implements SchemaLoader {
  stripBOM(content: string) {
    content = content.toString();
    // Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
    // because the buffer-to-string conversion in `fs.readFileSync()`
    // translates it to FEFF, the UTF-16 BOM.
    if (content.charCodeAt(0) === 0xfeff) {
      content = content.slice(1);
    }

    return content;
  }

  parseBOM(content: string) {
    return JSON.parse(this.stripBOM(content));
  }

  canHandle(pointerToSchema: string): boolean {
    return isValidPath(pointerToSchema) && existsSync(pointerToSchema) && extname(pointerToSchema) === '.json';
  }

  async handle(pointerToSchema: string, _cliOptions: CLIOptions): Promise<GraphQLSchema> {
    getSpinner().info(`Loading GraphQL Introspection from file: ${pointerToSchema}...`);

    const fullPath = isAbsolute(pointerToSchema) ? pointerToSchema : resolvePath(process.cwd(), pointerToSchema);

    if (existsSync(fullPath)) {
      const fileContent = readFileSync(fullPath, 'utf8');

      if (!fileContent) {
        throw new DetailedError(`Unable to read local introspection file: ${fullPath}`);
      }

      let introspection = this.parseBOM(fileContent);

      if (introspection.data) {
        introspection = introspection.data;
      }

      validateIntrospection(introspection);

      return introspectionToGraphQLSchema(introspection);
    }

    throw new DetailedError(`Unable to locate local introspection file: ${fullPath}`);
  }
}
