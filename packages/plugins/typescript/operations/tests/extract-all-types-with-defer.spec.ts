import { buildSchema, parse } from 'graphql';
import { mergeOutputs } from '@graphql-codegen/plugin-helpers';
import { validateTs } from '@graphql-codegen/testing';
import { plugin } from '../src/index.js';

describe('extractAllFieldsToTypes: true with @defer', () => {
  it('#10867 - should extract fields to types with @defer', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type Query {
        user(id: ID!): User
      }

      type User {
        id: ID!
        username: String!
        email: String!
      }
    `);

    const document = parse(/* GraphQL */ `
      fragment UserEmail on User {
        email
      }

      query user {
        user(id: 1) {
          id
          username
          ...UserEmail @defer
        }
      }
    `);

    const result = mergeOutputs([
      await plugin(schema, [{ document }], { extractAllFieldsToTypes: true }, { outputFile: '' }),
    ]);

    expect(result).toMatchInlineSnapshot(`
      "/** Internal type. DO NOT USE DIRECTLY. */
      type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      /** Internal type. DO NOT USE DIRECTLY. */
      export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
      export type UserEmailFragment = { email: string };

      export type UserQuery_user_User_0 = { id: string, username: string };

      export type UserQuery_user_User_1 = { email: string } | { email?: never };

      export type UserQuery_Query = { user: UserQuery_user_User_0 & UserQuery_user_User_1 | null };


      export type UserQueryVariables = Exact<{ [key: string]: never; }>;


      export type UserQuery = UserQuery_Query;
      "
    `);

    validateTs(result, undefined, undefined, undefined, undefined, true);
  });
});
