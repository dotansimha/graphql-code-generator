import { buildSchema, parse } from 'graphql';
import { mergeOutputs } from '@graphql-codegen/plugin-helpers';
import { validateTs } from '@graphql-codegen/testing';
import { plugin } from '../src/index.js';

describe('TypeScript Operations Plugin - externalDocuments', () => {
  it('uses external document file as reference, without generating types for it', async () => {
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
    const query = parse(/* GraphQL */ `
      query User {
        user(id: "100") {
          id
          ...UserFragment
        }
      }
    `);

    const fragment = parse(/* GraphQL */ `
      fragment UserFragment on User {
        id
        name
      }
    `);

    const result = mergeOutputs([
      await plugin(
        schema,
        [
          { location: '', document: query, type: 'standard' },
          { location: '', document: fragment, type: 'external' },
        ],
        {},
        { outputFile: '' },
      ),
    ]);

    expect(result).toMatchInlineSnapshot(`
      "/** Internal type. DO NOT USE DIRECTLY. */
      type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      /** Internal type. DO NOT USE DIRECTLY. */
      export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
      export type UserQueryVariables = Exact<{ [key: string]: never; }>;


      export type UserQuery = { user: { id: string, name: string } | null };
      "
    `);

    validateTs(result, undefined, undefined, undefined, undefined, true);
  });
});
