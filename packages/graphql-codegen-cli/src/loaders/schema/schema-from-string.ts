import { Types } from 'graphql-codegen-core';
import { SchemaLoader } from './schema-loader';
import { parse, DocumentNode } from 'graphql';

export class SchemaFromString implements SchemaLoader {
  canHandle(str: string): boolean {
    // XXX: is-valid-path or is-glob treat SDL as a valid path
    // (`scalar Date` for example)
    // this why checking the extension is fast enough
    // and prevent from parsing the string in order to find out
    // if the string is a SDL
    if (/\.[a-z0-9]+$/i.test(str)) {
      return false;
    }

    try {
      parse(str);

      return true;
    } catch (e) {
      return false;
    }
  }

  handle(str: string, config: Types.Config, schemaOptions: any): DocumentNode {
    return parse(str);
  }
}
