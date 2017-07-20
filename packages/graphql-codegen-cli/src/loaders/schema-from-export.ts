import * as fs from 'fs';
import { GraphQLSchema } from 'graphql-codegen-core';

export const schemaFromExport = (file: string): Promise<GraphQLSchema> => {
  console.log(`Loading GraphQL Introspection from JavaScript ES6 export: ${file}...`);

  return new Promise<any>((resolve, reject) => {
    if (fs.existsSync(file)) {
      try {
        const exports = require(file);

        if (exports) {
          const schema = exports.default || exports.schema;

          if (schema) {
            resolve(schema as GraphQLSchema);
          } else {
            reject(new Error(`Invalid export from export file ${file}: missing default export or 'schema' export!`));
          }
        }
        else {
          reject(new Error(`Invalid export from export file ${file}: empty export!`));
        }
      }
      catch (e) {
        reject(e);
      }
    }
    else {
      reject(`Unable to locate introspection from export file: ${file}`);
    }
  });
};
