import { buildSchema } from 'graphql';
import { plugin } from '../src';

describe('operations-document', () => {
  it('should generate operations for each root field', async () => {
    const testSchema = buildSchema(/* GraphQL */ `
      type Query {
        foo(id: ID!): Foo
      }
      type Mutation {
        createFoo(input: CreateFooInput!): Foo
      }
      type Foo {
        id: ID!
        name: String!
      }
      input CreateFooInput {
        name: String!
      }
    `);
    const content = await plugin(testSchema, [], {});

    expect(content).toMatchInlineSnapshot(`
      Object {
        "content": "query foo_query($id: ID!) {
        foo(id: $id) {
          id
          name
        }
      }

      mutation createFoo_mutation($input: CreateFooInput!) {
        createFoo(input: $input) {
          id
          name
        }
      }
      ",
      }
    `);
  });
});
