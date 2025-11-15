import { validateTs } from '@graphql-codegen/testing';
import { buildSchema, parse } from 'graphql';
import { plugin } from '../src/index.js';

describe('TypeScript Operations Plugin - Standalone', () => {
  it('generates using default config', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type Query {
        user(id: ID!): User
      }

      type User {
        id: ID!
        name: String!
        role: UserRole!
      }

      enum UserRole {
        ADMIN
        CUSTOMER
      }
    `);
    const document = parse(/* GraphQL */ `
      query User($id: ID!) {
        user(id: $id) {
          id
          name
          role
        }
      }
    `);

    const { content } = await plugin(schema, [{ document }], {});

    expect(content).toMatchInlineSnapshot(`
      "export type UserQueryVariables = Exact<{
        id: Scalars['ID']['input'];
      }>;


      export type UserQuery = { __typename?: 'Query', user?: { __typename?: 'User', id: string, name: string, role: UserRole } | null };
      "
    `);

    validateTs(content, undefined, undefined, undefined, undefined, true);
  });
});
