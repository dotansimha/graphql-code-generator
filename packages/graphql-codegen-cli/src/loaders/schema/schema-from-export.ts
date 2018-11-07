import { existsSync } from 'fs';
import { extname, isAbsolute, resolve as resolvePath } from 'path';
import isValidPath = require('is-valid-path');
import chalk from 'chalk';
import { buildASTSchema, buildClientSchema, DocumentNode, GraphQLSchema, IntrospectionQuery, parse } from 'graphql';
import { debugLog } from 'graphql-codegen-core';
import { SchemaLoader } from './schema-loader';
import { CLIOptions } from '../../cli-options';
import { getSpinner } from '../../spinner';
import { DetailedError } from '../../errors';

export class SchemaFromExport implements SchemaLoader {
  canHandle(pointerToSchema: string): boolean {
    const fullPath = isAbsolute(pointerToSchema) ? pointerToSchema : resolvePath(process.cwd(), pointerToSchema);

    return isValidPath(pointerToSchema) && existsSync(fullPath) && extname(pointerToSchema) !== '.json';
  }

  handle(file: string, _cliOptions: CLIOptions): Promise<GraphQLSchema> {
    getSpinner().info(
      `Loading GraphQL schema object, text, ast, or introspection json from JavaScript ES6 export: ${file}...`
    );

    return new Promise<GraphQLSchema>(async (resolve, reject) => {
      const fullPath = isAbsolute(file) ? file : resolvePath(process.cwd(), file);

      if (existsSync(fullPath)) {
        try {
          const exports = require(fullPath);

          if (exports) {
            let rawExport = exports.default || exports.schema || exports;

            if (rawExport) {
              let schema;

              if (this.isPromise(rawExport)) {
                schema = await rawExport;
              } else {
                schema = rawExport;
              }

              try {
                const schemaResult = await this.resolveSchema(schema);

                resolve(schemaResult);
              } catch (e) {
                debugLog('Unexpected exception while trying to figure out the schema: ', e);

                reject(new Error('Exported schema must be of type GraphQLSchema, text, AST, or introspection JSON.'));

                return;
              }
            } else {
              reject(
                new Error(`
                  Invalid export from file: ${fullPath}
                  Use either ${chalk.bold('default export')} or export ${chalk.bold('schema')} variable.

                  Example:

                    export default ...;

                    OR

                    export const schema = ...;

                `)
              );
            }
          } else {
            reject(
              new Error(`
            
              Invalid export from file: ${fullPath}

              You forgot to export schema.
              Use either ${chalk.bold('default export')} or export ${chalk.bold('schema')} variable.

              Example:

                export default ...;

                OR

                export const schema = ...;

            `)
            );
          }
        } catch (e) {
          reject(e);
        }
      } else {
        reject(`
        
          Unable to locate introspection from export file: ${fullPath}

          File probably does not exist.

        `);
      }
    });
  }

  isSchemaText(obj: any): obj is string {
    return typeof obj === 'string';
  }

  isSchemaJson(obj: any): obj is { data: IntrospectionQuery } {
    const json = obj as { data: IntrospectionQuery };
    return json.data !== undefined && json.data.__schema !== undefined;
  }

  isSchemaObject(obj: any): obj is GraphQLSchema {
    return obj instanceof GraphQLSchema;
  }

  isSchemaAst(obj: string | DocumentNode): obj is DocumentNode {
    return (obj as DocumentNode).kind !== undefined;
  }

  isPromise(obj: any): obj is Promise<any> {
    return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
  }

  resolveSchema(schema: any): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      if (this.isSchemaObject(schema)) {
        resolve(schema);
      } else if (this.isSchemaAst(schema)) {
        resolve(buildASTSchema(schema));
      } else if (this.isSchemaText(schema)) {
        const ast = parse(schema);
        resolve(buildASTSchema(ast));
      } else if (this.isSchemaJson(schema)) {
        resolve(buildClientSchema(schema.data));
      } else {
        reject(
          new DetailedError(`
            
            Unexpected schema type provided.

            Should be one of following:
              - exported GraphQLSchema object
              - exported string wrapped by the 'gql' tag
              - string without the 'gql' tag
              - .graphql file with schema
              - JSON file with introspection

            Please provide correct schema and run codegen again.
          
        `)
        );
      }
    });
  }
}
