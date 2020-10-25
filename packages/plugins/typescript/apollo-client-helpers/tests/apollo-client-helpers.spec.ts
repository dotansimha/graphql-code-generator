import { mergeOutputs } from '@graphql-codegen/plugin-helpers';
import { buildSchema } from 'graphql';
import { plugin } from '../src/index';

describe('apollo-client-helpers', () => {
  it('Should output typePolicies object correctly', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type Query {
        user: User!
      }
      type User {
        id: ID!
        name: String!
      }
    `);
    const result = mergeOutputs([await plugin(schema, [], {})]);

    console.log(result);
  });
});
