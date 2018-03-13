import * as stripComments from 'strip-comments';
import { parse } from 'graphql-codegen-core';

export const extractDocumentStringFromCodeFile = (fileContent: string): string | null => {
  try {
    const parsed = parse(fileContent);

    if (parsed) {
      return fileContent;
    }
  } catch (e) {
    fileContent = stripComments(fileContent);
    let matches = fileContent.match(/gql[(]?[`'"]([\s\S\n\r.]*?)[`'"][)]?/gm);

    if (matches === null) {
      matches = fileContent.match(/(['"](query|subscription|fragment|mutation) .*?['"])/gm);
    }

    const result = (matches || []).map(item => item.replace(/\$\{.*?\}/g, '').replace(/(gql|`)/g, '')).join();

    if (!result || result === '') {
      return null;
    } else {
      return result;
    }
  }
};
