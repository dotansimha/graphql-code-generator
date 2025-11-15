import { mergeOutputs } from '@graphql-codegen/plugin-helpers';
// import { validateTs } from '@graphql-codegen/testing';
import { buildSchema, parse } from 'graphql';
import { plugin } from '../src/index.js';

describe('TypeScript Operations Plugin - Standalone', () => {
  it('generates using default config', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type Query {
        user(id: ID!): User
        users(input: UsersInput!): UsersResponse!
      }

      type ResponseError {
        error: ResponseErrorType!
      }

      enum ResponseErrorType {
        NOT_FOUND
        INPUT_VALIDATION_ERROR
        FORBIDDEN_ERROR
        UNEXPECTED_ERROR
      }

      type User {
        id: ID!
        name: String!
        role: UserRole!
        createdAt: DateTime!
      }

      enum UserRole {
        ADMIN
        CUSTOMER
      }

      input UsersInput {
        from: DateTime
        to: DateTime
      }

      type UsersResponseOk {
        result: [User!]!
      }
      union UsersResponse = UsersResponseOk | ResponseError

      scalar DateTime
    `);
    const document = parse(/* GraphQL */ `
      query User($id: ID!) {
        user(id: $id) {
          id
          name
          role
          createdAt
        }
      }

      query Users($input: UsersInput!) {
        users(input: $input) {
          ... on UsersResponseOk {
            result {
              id
            }
          }
          ... on ResponseError {
            error
          }
        }
      }

      query UsersWithScalarInput($from: DateTime!, $to: DateTime) {
        users(input: { from: $from, to: $to }) {
          ... on UsersResponseOk {
            result {
              __typename
            }
          }
          ... on ResponseError {
            __typename
          }
        }
      }
    `);

    const result = mergeOutputs([await plugin(schema, [{ document }], {})]);

    expect(result).toMatchInlineSnapshot(`
      "type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      export type UserQueryVariables = Exact<{
        id: Scalars['ID']['input'];
      }>;


      export type UserQuery = { __typename?: 'Query', user?: { __typename?: 'User', id: string, name: string, role: UserRole, createdAt: any } | null };

      export type UsersQueryVariables = Exact<{
        input: UsersInput;
      }>;


      export type UsersQuery = { __typename?: 'Query', users:
          | { __typename?: 'UsersResponseOk', result: Array<{ __typename?: 'User', id: string }> }
          | { __typename?: 'ResponseError', error: ResponseErrorType }
         };

      export type UsersWithScalarInputQueryVariables = Exact<{
        from: Scalars['DateTime']['input'];
        to?: InputMaybe<Scalars['DateTime']['input']>;
      }>;


      export type UsersWithScalarInputQuery = { __typename?: 'Query', users:
          | { __typename?: 'UsersResponseOk', result: Array<{ __typename: 'User' }> }
          | { __typename: 'ResponseError' }
         };
      "
    `);

    // FIXME: enable this to ensure type correctness
    // validateTs(content, undefined, undefined, undefined, undefined, true);
  });
});
