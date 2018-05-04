import * as fs from 'fs';
import * as path from 'path';
import {
  GraphQLSchema,
  DocumentNode,
  parse,
  buildASTSchema,
  extendSchema,
  IntrospectionQuery,
  buildClientSchema
} from 'graphql';
import { debugLog } from 'graphql-codegen-core';

function isPromise(obj) {
  return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
}

function resolveSchema(schema: any): Promise<any> {
  return new Promise((resolve, reject) => {
    if (isSchemaObject(schema)) {
      resolve(schema);
    } else if (isSchemaAst(schema)) {
      resolve(buildASTSchema(schema));
    } else if (isSchemaText(schema)) {
      const ast = parse(schema);
      resolve(buildASTSchema(ast));
    } else if (isSchemaJson(schema)) {
      resolve(buildClientSchema(schema.data));
    } else {
      reject(new Error('Unexpected schema type provided!'));
    }
  });
}

export const schemaFromExport = (file: string): Promise<GraphQLSchema> => {
  console.log(`Loading GraphQL schema object, text, ast, or introspection json from JavaScript ES6 export: ${file}...`);

  return new Promise<any>(async (resolve, reject) => {
    const fullPath = path.isAbsolute(file) ? file : path.resolve(process.cwd(), file);

    if (fs.existsSync(fullPath)) {
      try {
        const exports = require(fullPath);

        if (exports) {
          let rawExport = exports.default || exports.schema || exports;

          if (rawExport) {
            let schema;

            if (isPromise(rawExport)) {
              schema = await rawExport;
            } else {
              schema = rawExport;
            }

            try {
              const schemaResult = await resolveSchema(schema);

              resolve(schemaResult);
            } catch (e) {
              debugLog('Unexpected exceptiom while trying to figure out the schema: ', e);

              reject(new Error('Exported schema must be of type GraphQLSchema, text, AST, or introspection JSON.'));

              return;
            }
          } else {
            reject(
              new Error(`Invalid export from export file ${fullPath}: missing default export or 'schema' export!`)
            );
          }
        } else {
          reject(new Error(`Invalid export from export file ${fullPath}: empty export!`));
        }
      } catch (e) {
        reject(e);
      }
    } else {
      reject(`Unable to locate introspection from export file: ${fullPath}`);
    }
  });
};

function isSchemaText(obj: any): obj is string {
  return typeof obj === 'string';
}

function isSchemaJson(obj: any): obj is { data: IntrospectionQuery } {
  const json = obj as { data: IntrospectionQuery };
  return json.data !== undefined && json.data.__schema !== undefined;
}

function isSchemaObject(obj: any): obj is GraphQLSchema {
  return obj instanceof GraphQLSchema;
}

function isSchemaAst(obj: string | DocumentNode): obj is DocumentNode {
  return (obj as DocumentNode).kind !== undefined;
}
