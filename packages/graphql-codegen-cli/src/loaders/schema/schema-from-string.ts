import { Types } from 'graphql-codegen-core';
import { SchemaLoader } from './schema-loader';
import { parse, DocumentNode } from 'graphql';

export class SchemaFromString implements SchemaLoader {
  canHandle(str: string): boolean {
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
