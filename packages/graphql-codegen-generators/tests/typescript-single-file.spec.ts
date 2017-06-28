import { schemaToTemplateContext, SchemaTemplateContext } from 'graphql-codegen-core';
import { GraphQLSchema } from 'graphql';
import { makeExecutableSchema } from 'graphql-tools';

describe('TypeScript Single File', () => {
  const compileAndBuildContext = (typeDefs: string): SchemaTemplateContext => {
    const schema = makeExecutableSchema({ typeDefs, resolvers: {}, allowUndefinedInResolve: true }) as GraphQLSchema;

    return schemaToTemplateContext(schema);
  };

  describe('Schema', () => {
    it('should compile template correctly when using a simple Query', () => {
      const templateContext = compileAndBuildContext(`
        type Query {
          fieldTest: String
        }
      `);

    });
  });
});
