import { makeExecutableSchema } from 'graphql-tools';
import { introspectionFromSchema } from 'graphql';
import { plugin } from '../src';

describe('Introspection template', () => {
  it('should output a JSON file', async () => {
    const schema = makeExecutableSchema({
      typeDefs: `
          type Query {
            fieldTest: String
          }
          
          schema {
            query: Query
          }
          `
    });

    const content = await plugin(schema, [], {}, { outputFile: '' });
    const introspection = JSON.stringify(introspectionFromSchema(schema, { descriptions: true }));
    expect(introspection).toEqual(content);
  });
});
