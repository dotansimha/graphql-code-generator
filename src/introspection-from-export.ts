import * as fs from 'fs';
import {IntrospectionQuery} from 'graphql/utilities/introspectionQuery';
import {GraphQLSchema} from 'graphql/type/schema';
import { graphql, introspectionQuery } from 'graphql';

export const introspectionFromExport = (file: string) => {
  return new Promise<IntrospectionQuery>((resolve, reject) => {
    if (fs.existsSync(file)) {
      try {
        const schema = require(file);

        if (schema && schema instanceof GraphQLSchema) {
          resolve(graphql(schema, introspectionQuery).then(res => res.data));
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
      reject(`Unable to locate introspection export file: ${file}`);
    }
  });
};
