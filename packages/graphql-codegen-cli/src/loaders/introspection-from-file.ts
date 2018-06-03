import * as fs from 'fs';
import { IntrospectionQuery, logger } from 'graphql-codegen-core';
import * as path from 'path';

// from https://github.com/npm/npm/blob/latest/lib/utils/parse-json.js
// from read-package-json
const stripBOM = (content: string) => {
  content = content.toString();
  // Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
  // because the buffer-to-string conversion in `fs.readFileSync()`
  // translates it to FEFF, the UTF-16 BOM.
  if (content.charCodeAt(0) === 0xfeff) {
    content = content.slice(1);
  }
  return content;
};

export const parseBOM = (content: string) => JSON.parse(stripBOM(content));

export const introspectionFromFile = (file: string) => {
  logger.info(`Loading GraphQL Introspection from file: ${file}...`);

  return new Promise<IntrospectionQuery>((resolve, reject) => {
    const fullPath = path.isAbsolute(file) ? file : path.resolve(process.cwd(), file);

    if (fs.existsSync(fullPath)) {
      try {
        const fileContent = fs.readFileSync(fullPath, 'utf8');

        if (!fileContent) {
          reject(`Unable to read local introspection file: ${fullPath}`);
        }

        let introspection = parseBOM(fileContent);
        if (introspection.data) {
          introspection = introspection.data;
        }

        resolve(<IntrospectionQuery>introspection);
      } catch (e) {
        reject(e);
      }
    } else {
      reject(`Unable to locate local introspection file: ${fullPath}`);
    }
  });
};
