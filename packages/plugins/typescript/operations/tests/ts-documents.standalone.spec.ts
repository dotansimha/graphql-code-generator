import { mergeOutputs } from '@graphql-codegen/plugin-helpers';
import { validateTs } from '@graphql-codegen/testing';
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
        nickname: String
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
          nickname
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

    const result = mergeOutputs([await plugin(schema, [{ document }], {}, { outputFile: '' })]);

    expect(result).toMatchInlineSnapshot(`
      "type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
      /** UserRole Description */
      export type UserRole =
        /** UserRole ADMIN */
        | 'ADMIN'
        /** UserRole CUSTOMER */
        | 'CUSTOMER';

      export type UserQueryVariables = Exact<{
        id: string;
      }>;


      export type UserQuery = { __typename?: 'Query', user: { __typename?: 'User', id: string, name: string, role: UserRole, createdAt: any, nickname: string | null } | null };

      export type UsersQueryVariables = Exact<{
        input: UsersInput;
      }>;


      export type UsersQuery = { __typename?: 'Query', users:
          | { __typename?: 'UsersResponseOk', result: Array<{ __typename?: 'User', id: string }> }
          | { __typename?: 'ResponseError', error: ResponseErrorType }
         };

      export type UsersWithScalarInputQueryVariables = Exact<{
        from: any;
        to?: any | null;
        role?: UserRole | null;
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

  it('test overrdiding config.scalars', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type Query {
        user(id: ID!): User
      }

      type User {
        id: ID!
        name: String!
      }
    `);
    const document = parse(/* GraphQL */ `
      query User($id: ID!) {
        user(id: $id) {
          id
          name
        }
      }
    `);

    const result = mergeOutputs([
      await plugin(schema, [{ document }], { scalars: { ID: 'string | number | boolean' } }, { outputFile: '' }),
    ]);

    expect(result).toMatchInlineSnapshot(`
      "type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
      export type UserQueryVariables = Exact<{
        id: string | number | boolean;
      }>;


      export type UserQuery = { __typename?: 'Query', user: { __typename?: 'User', id: string | number | boolean, name: string } | null };
      "
    `);
  });

  it('does not generate Variables, Result or Fragments when generatesOperationTypes is false', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type Query {
        user(id: ID!): User
        users(input: UsersInput!): UsersResponse!
      }

      type Mutation {
        makeUserAdmin(id: ID!): User!
      }

      type Subscription {
        userChanges(id: ID!): User!
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
              ...UserFragment
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

      mutation MakeAdmin {
        makeUserAdmin(id: "100") {
          ...UserFragment
        }
      }

      subscription UserChanges {
        makeUserAdmin(id: "100") {
          ...UserFragment
        }
      }

      fragment UserFragment on User {
        id
        role
      }
    `);

    const result = mergeOutputs([
      await plugin(schema, [{ document }], { generatesOperationTypes: false }, { outputFile: '' }),
    ]);

    expect(result).toMatchInlineSnapshot(`
      "

      /** UserRole Description */
      export type UserRole =
        /** UserRole ADMIN */
        | 'ADMIN'
        /** UserRole CUSTOMER */
        | 'CUSTOMER';

      "
    `);

    validateTs(result, undefined, undefined, undefined, undefined, true);
  });

  it('does not generate unused schema enum and input types', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type Query {
        user(id: ID!): User
        users(input: UsersInput!): UsersResponse!
      }

      type Mutation {
        makeUserAdmin(id: ID!): User!
      }

      type Subscription {
        userChanges(id: ID!): User!
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
      query User {
        user(id: "100") {
          id
        }
      }
    `);

    const result = mergeOutputs([
      await plugin(schema, [{ document }], { generatesOperationTypes: false }, { outputFile: '' }),
    ]);

    expect(result).toMatchInlineSnapshot(`
      "

      "
    `);

    validateTs(result, undefined, undefined, undefined, undefined, true);
  });
});
