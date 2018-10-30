import { gql, GraphQLSchema, makeExecutableSchema } from 'graphql-codegen-core';

describe('Tests Example', () => {
  const testSchema = gql`
    type Query {
      fieldTest: String
    }

    schema {
      query: Query
    }
  `;

  describe('Example', () => {
    it('Example', async () => {
      const schema: GraphQLSchema = makeExecutableSchema({ typeDefs: testSchema, allowUndefinedInResolve: true });

      expect(schema).toBeDefined();
    });
  });
});
