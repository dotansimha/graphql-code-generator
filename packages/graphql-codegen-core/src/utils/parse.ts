import { parse as coreParse, Source } from 'graphql';

export function parse(source: Source | string) {
  try {
    return coreParse(source);
  } catch (e) {
    let error: Error;

    if (typeof source === 'string') {
      error = new Error(`Parsing '${source.trim().substr(0, 25)}...' failed with: ${e.message}`);
    } else {
      error = new Error(`Parsing a document in '${source.name}' failed with: ${e.message}`);
    }

    throw error;
  }
}
