import * as fs from 'fs';
import { graphql, introspectionQuery, GraphQLSchema } from 'graphql-codegen-core';

export const introspectionFromExport = (file: string) => {
  console.log(`Loading GraphQL Introspection from JavaScript ES6 export: ${file}...`);

  return new Promise<any>((resolve, reject) => {
    if (fs.existsSync(file)) {
      try {
        const schema = require(file);

        if (schema && schema instanceof GraphQLSchema) {
          const result = graphql(schema, introspectionQuery).then(res => res.data);

          resolve(result);
        }
        else {
          reject(new Error(`Invalid export from export file ${file}, make sure to default export your GraphQLSchema object!`));
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
