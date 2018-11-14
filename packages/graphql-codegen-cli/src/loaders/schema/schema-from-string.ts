import { Types } from 'graphql-codegen-core';
import { SchemaLoader } from './schema-loader';
import isValidPath = require('is-valid-path');
import { GraphQLSchema, parse } from 'graphql';
import { makeExecutableSchema } from 'graphql-tools';

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

  handle(str: string, config: Types.Config, schemaOptions: any): GraphQLSchema {
    return makeExecutableSchema({
      typeDefs: [str],
      allowUndefinedInResolve: true,
      resolvers: {},
      resolverValidationOptions: { requireResolversForResolveType: false }
    });
  }
}
