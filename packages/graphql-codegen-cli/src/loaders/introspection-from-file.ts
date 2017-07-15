import * as fs from 'fs';
import { IntrospectionQuery } from 'graphql-codegen-core';

export const introspectionFromFile = (file: string) => {
  console.log(`Loading GraphQL Introspection from file: ${file}...`);

  return new Promise<IntrospectionQuery>((resolve, reject) => {
    if (fs.existsSync(file)) {
      try {
        const fileContent = fs.readFileSync(file, 'utf8');

        if (!fileContent) {
          reject(`Unable to read local introspection file: ${file}`);
        }

        let introspection = JSON.parse(fileContent);
        if (introspection.data) {
          introspection = introspection.data;
        }

        resolve(<IntrospectionQuery>introspection);
      }
      catch (e) {
        reject(e);
      }
    }
    else {
      reject(`Unable to locate local introspection file: ${file}`);
    }
  });
};
