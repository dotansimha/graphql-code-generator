import { existsSync } from 'fs';
import { extname, isAbsolute, resolve as resolvePath } from 'path';
import isValidPath = require('is-valid-path');
import { buildASTSchema, buildClientSchema, DocumentNode, GraphQLSchema, IntrospectionQuery, parse } from 'graphql';
import { debugLog, Types } from 'graphql-codegen-core';
import { SchemaLoader } from './schema-loader';
import { DetailedError } from '../../errors';

export class SchemaFromExport implements SchemaLoader {
  canHandle(pointerToSchema: string): boolean {
    const fullPath = isAbsolute(pointerToSchema) ? pointerToSchema : resolvePath(process.cwd(), pointerToSchema);

    return isValidPath(pointerToSchema) && existsSync(fullPath) && extname(pointerToSchema) !== '.json';
  }

  async handle(file: string, config: Types.Config, schemaOptions: any): Promise<GraphQLSchema> {
    // spinner.info(
    //   `Loading GraphQL schema object, text, ast, or introspection json from JavaScript ES6 export: ${file}...`
    // );

    const fullPath = isAbsolute(file) ? file : resolvePath(process.cwd(), file);

    if (existsSync(fullPath)) {
      try {
        const exports = require(fullPath);

        if (exports) {
          let rawExport = exports.default || exports.schema || exports;

          if (rawExport) {
            let schema = await rawExport;

            try {
              const schemaResult = await this.resolveSchema(schema);

              return schemaResult;
            } catch (e) {
              debugLog('Unexpected exception while trying to figure out the schema: ', e);

              throw new Error('Exported schema must be of type GraphQLSchema, text, AST, or introspection JSON.');
            }
          } else {
            throw new Error(`Invalid export from export file ${fullPath}: missing default export or 'schema' export!`);
          }
        } else {
          throw new Error(`Invalid export from export file ${fullPath}: empty export!`);
        }
      } catch (e) {
        throw new DetailedError(e.message, e.stack, fullPath);
      }
    } else {
      throw new Error(`Unable to locate introspection from export file: ${fullPath}`);
    }
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

  async resolveSchema(schema: any): Promise<any> {
    if (this.isSchemaObject(schema)) {
      return schema;
    } else if (this.isSchemaAst(schema)) {
      return buildASTSchema(schema);
    } else if (this.isSchemaText(schema)) {
      const ast = parse(schema);
      return buildASTSchema(ast);
    } else if (this.isSchemaJson(schema)) {
      return buildClientSchema(schema.data);
    } else {
      throw new Error('Unexpected schema type provided!');
    }
  }
}
