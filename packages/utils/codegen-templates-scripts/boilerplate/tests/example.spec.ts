import { makeExecutableSchema } from 'graphql-tools';
import gql from 'graphql-tag';
import { GraphQLSchema } from 'graphql';

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
