import { buildSchema, parse } from 'graphql';
import { mergeOutputs } from '@graphql-codegen/plugin-helpers';
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
      "export type UserQueryVariables = Exact<{ [key: string]: never; }>;


      export type UserQuery = { __typename?: 'Query', user?: { __typename?: 'User', id: string, name: string } | null };
      "
    `);

    // FIXME: cannot call `validateTs` until next major version
    // https://github.com/dotansimha/graphql-code-generator/pull/10496/changes
    // validateTs(result, undefined, undefined, undefined, undefined, true);
  });
});
