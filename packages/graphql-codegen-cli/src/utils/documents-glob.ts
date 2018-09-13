import * as glob from 'glob';
import { getLogger } from 'graphql-codegen-core';

export const documentsFromGlobs = (documents: string[]): Promise<string[]> => {
  return Promise.all(
    documents.map((documentGlob: string) => {
      return new Promise<string[]>((resolve, reject) => {
        glob(documentGlob, (err, files) => {
          if (err) {
            reject(err);
          }

          if (!files || files.length === 0) {
            getLogger().warn(`No files matched for glob expression: ${documentGlob}`);
          }

          resolve(files);
        });
      });
    })
  ).then((files: string[][]) => {
    return files.length === 0
      ? []
      : files.reduce((a, b) => {
          return a.concat(b);
        });
  });
};
