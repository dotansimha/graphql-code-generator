import { parse } from 'graphql-codegen-core';
import { Source } from 'graphql';
import gqlPluck from 'graphql-tag-pluck';

export function extractDocumentStringFromCodeFile(source: Source): string | void {
  try {
    const parsed = parse(source.body);

    if (parsed) {
      return source.body;
    }
  } catch (e) {
    return gqlPluck.fromFile.sync(source.name) || null;
  }
}
