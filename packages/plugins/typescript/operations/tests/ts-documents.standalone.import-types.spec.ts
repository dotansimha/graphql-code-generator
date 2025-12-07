import { buildSchema, parse } from 'graphql';
import { validateTs } from '@graphql-codegen/testing';
import { mergeOutputs } from '@graphql-codegen/plugin-helpers';
import { plugin } from '../src/index.js';

describe('TypeScript Operations Plugin - Import Types', () => {
  it('imports user-defined types externally with importSchemaTypesFrom correctly', async () => {
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

      "UserRole Description"
      enum UserRole {
        "UserRole ADMIN"
        ADMIN
        "UserRole CUSTOMER"
        CUSTOMER
      }

      "UsersInput Description"
      input UsersInput {
        "UsersInput from"
        from: DateTime
        "UsersInput to"
        to: DateTime
        role: UserRole
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

      query UsersWithScalarInput($from: DateTime!, $to: DateTime, $role: UserRole) {
        users(input: { from: $from, to: $to, role: $role }) {
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

    const result = mergeOutputs([
      await plugin(schema, [{ document }], {
        importSchemaTypesFrom: './path-to-other-file',
        namespacedImportName: 'TypeImport',
      }),
    ]);

    expect(result).toMatchInlineSnapshot(`
      "import type * as TypeImport from './graphql-code-generator';

      type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      export type UserQueryVariables = Exact<{
        id: string;
      }>;


      export type UserQuery = { __typename?: 'Query', user?: { __typename?: 'User', id: string, name: string, role: TypeImport.UserRole, createdAt: any } | null };

      export type UsersQueryVariables = Exact<{
        input: TypeImport.UsersInput;
      }>;


      export type UsersQuery = { __typename?: 'Query', users:
          | { __typename?: 'UsersResponseOk', result: Array<{ __typename?: 'User', id: string }> }
          | { __typename?: 'ResponseError', error: TypeImport.ResponseErrorType }
         };

      export type UsersWithScalarInputQueryVariables = Exact<{
        from: any;
        to?: any | null;
        role?: TypeImport.UserRole | null;
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

  it('does not import external types if native GraphQL types are used in Variables and Result', async () => {
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
        # Native GraphQL types
        id: ID!
        name: String!
        isOld: Boolean!
        ageInt: Int!
        ageFloat: Float!

        # User-defined types
        role: UserRole!
        createdAt: DateTime!
      }

      "UserRole Description"
      enum UserRole {
        "UserRole ADMIN"
        ADMIN
        "UserRole CUSTOMER"
        CUSTOMER
      }

      "UsersInput Description"
      input UsersInput {
        "UsersInput from"
        from: DateTime
        "UsersInput to"
        to: DateTime
        role: UserRole
      }

      type UsersResponseOk {
        result: [User!]!
      }
      union UsersResponse = UsersResponseOk | ResponseError

      scalar DateTime
    `);
    const document = parse(/* GraphQL */ `
      query User($id: ID, $name: String, $bool: Boolean, $int: Int, $float: Float) {
        user(id: $id) {
          id
          name
          isOld
          ageInt
          ageFloat
        }
      }
    `);

    const result = mergeOutputs([
      await plugin(schema, [{ document }], {
        importSchemaTypesFrom: './path-to-other-file',
        namespacedImportName: 'TypeImport',
      }),
    ]);

    expect(result).toMatchInlineSnapshot(`
      "type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      export type UserQueryVariables = Exact<{
        id?: string | null;
        name?: string | null;
        bool?: boolean | null;
        int?: number | null;
        float?: number | null;
      }>;


      export type UserQuery = { __typename?: 'Query', user?: { __typename?: 'User', id: string, name: string, isOld: boolean, ageInt: number, ageFloat: number } | null };
      "
    `);

    validateTs(result, undefined, undefined, undefined, undefined, true);
  });
});
