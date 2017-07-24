import * as fs from 'fs';
import { GraphQLSchema } from 'graphql-codegen-core';
import * as path from 'path';

export const schemaFromExport = (file: string): Promise<GraphQLSchema> => {
  console.log(`Loading GraphQL Introspection from JavaScript ES6 export: ${file}...`);

  return new Promise<any>((resolve, reject) => {
    const fullPath = path.isAbsolute(file) ? file : path.resolve(process.cwd(), file);

    if (fs.existsSync(fullPath)) {
      try {
        const exports = require(fullPath);

        if (exports) {
          const schema = exports.default || exports.schema;

          if (schema) {
            resolve(schema as GraphQLSchema);
          } else {
            reject(new Error(`Invalid export from export file ${fullPath}: missing default export or 'schema' export!`));
          }
        }
        else {
          reject(new Error(`Invalid export from export file ${fullPath}: empty export!`));
        }
      }
      catch (e) {
        reject(e);
      }
    }
    else {
      reject(`Unable to locate introspection from export file: ${fullPath}`);
    }
  });
};
