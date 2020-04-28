import { buildSchema } from 'graphql';
import { plugin } from '../src/index';

describe('TypeScript Typedefs Plugin', () => {
  describe('Output', () => {
    const typeDefs = /* GraphQL */ `
      type Query {
        helloWorld(name: String): String!
      }

      schema {
        query: Query
      }
    `;
    const schema = buildSchema(typeDefs);

    it('Should output the schema inside gql template literal tag', async () => {
      const content = await plugin(schema, [], {});

      expect(content).toBeSimilarStringTo(`
        import gql from 'graphql-tag';
      
        type Query {
          helloWorld(name: String): String!
        }

        schema {
          query: Query
        }
      `);
    });
  });
});
