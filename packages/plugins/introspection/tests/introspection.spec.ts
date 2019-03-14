import { buildSchema, introspectionFromSchema } from 'graphql';
import { plugin } from '../src';

describe('Introspection template', () => {
  it('should output a JSON file', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type Query {
        fieldTest: String
      }

      schema {
        query: Query
      }
    `);

    const content = await plugin(schema, [], {}, { outputFile: '' });
    const introspection = JSON.stringify(introspectionFromSchema(schema, { descriptions: true }));
    expect(introspection).toEqual(content);
  });
});
