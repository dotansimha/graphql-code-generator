import { Types } from 'graphql-codegen-core';
import { SchemaLoader } from './schema-loader';
import { GraphQLSchema, parse } from 'graphql';
import { makeExecutableSchema } from 'graphql-tools';
import isValidPath = require('is-valid-path');

export class SchemaFromString implements SchemaLoader {
  canHandle(str: string): boolean {
    if (isValidPath(str)) {
      return false;
    }

    try {
      parse(str);

      return true;
    } catch (e) {
      return false;
    }
  }

  handle(src: string, config: Types.Config, schemaOptions: any): GraphQLSchema {
    try {
      return makeExecutableSchema({
        typeDefs: [src],
        allowUndefinedInResolve: true,
        resolvers: {},
        resolverValidationOptions: { requireResolversForResolveType: false }
      });
    } catch (e) {
      return null;
    }
  }
}
