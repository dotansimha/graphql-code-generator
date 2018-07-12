import { GraphQLSchema } from 'graphql';
import { makeExecutableSchema } from 'graphql-tools';
import { readFileSync } from 'fs';

export function loadSchemaFromTypeDefs(files: string[]): GraphQLSchema {
  return makeExecutableSchema({
    typeDefs: files.map(filePath => readFileSync(filePath, 'utf-8')),
    allowUndefinedInResolve: true,
    resolvers: {}
  });
}
