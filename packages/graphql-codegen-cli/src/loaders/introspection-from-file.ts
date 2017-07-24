import * as fs from 'fs';
import { IntrospectionQuery } from 'graphql-codegen-core';
import * as path from 'path';

export const introspectionFromFile = (file: string) => {
  console.log(`Loading GraphQL Introspection from file: ${file}...`);

  return new Promise<IntrospectionQuery>((resolve, reject) => {
    const fullPath = path.isAbsolute(file) ? file : path.resolve(process.cwd(), file);

    if (fs.existsSync(fullPath)) {
      try {
        const fileContent = fs.readFileSync(fullPath, 'utf8');

        if (!fileContent) {
          reject(`Unable to read local introspection file: ${fullPath}`);
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
      reject(`Unable to locate local introspection file: ${fullPath}`);
    }
  });
};
