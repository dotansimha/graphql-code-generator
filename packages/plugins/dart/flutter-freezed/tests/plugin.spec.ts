import { buildSchema } from 'graphql';
import { plugin } from '../src';

describe('My Plugin', () => {
  const schema = buildSchema(/* GraphQL */ `
    type Query {
      foo: String!
    }
  `);

  it('Should greet', async () => {
    const result = await plugin(schema, [], {
      name: 'Dotan',
    });

    expect(result).toBe('Hello Dotan!');
  });
});
