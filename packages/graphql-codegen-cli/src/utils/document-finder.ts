import { parse } from 'graphql-codegen-core';
import gqlPluck from 'graphql-tag-pluck';

export const extractDocumentStringFromCodeFile = (fileContent: string): string | void => {
  try {
    const parsed = parse(fileContent);

    if (parsed) {
      return fileContent;
    }
  } catch (e) {
    return gqlPluck.fromCodeString.sync(fileContent) || null;
  }
};
