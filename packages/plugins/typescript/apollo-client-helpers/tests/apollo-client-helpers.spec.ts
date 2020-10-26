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
    expect(result).toMatchSnapshot();
  });

  it('Should output typePolicies object with requireKeyFields: true', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type Query {
        user: User!
      }
      type User {
        id: ID!
        name: String!
      }
    `);
    const result = mergeOutputs([
      await plugin(schema, [], {
        requireKeyFields: true,
      }),
    ]);
    expect(result).toContain(`keyFields:`);
    expect(result).not.toContain(`keyFields?:`);
    expect(result).toMatchSnapshot();
  });

  it('Should output typePolicies object with requirePoliciesForAllTypes: true', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type Query {
        user: User!
      }
      type User {
        id: ID!
        name: String!
      }
    `);
    const result = mergeOutputs([
      await plugin(schema, [], {
        requirePoliciesForAllTypes: true,
      }),
    ]);
    expect(result).toContain(`User:`);
    expect(result).toContain(`Query?:`);
    expect(result).toMatchSnapshot();
  });
});
