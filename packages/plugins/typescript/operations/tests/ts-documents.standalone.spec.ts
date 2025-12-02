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

    const result = mergeOutputs([await plugin(schema, [{ document }], {})]);

    expect(result).toMatchInlineSnapshot(`
      "type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      export type ResponseErrorType =
        | 'NOT_FOUND'
        | 'INPUT_VALIDATION_ERROR'
        | 'FORBIDDEN_ERROR'
        | 'UNEXPECTED_ERROR';

      export type UserRole =
        | 'ADMIN'
        | 'CUSTOMER';

      export type UsersInput = {
        from: DateTime;
        to: DateTime;
        role: UserRole;
      };

      export type UserQueryVariables = Exact<{
        id: string;
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

  it('test generating input types lists', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type Query {
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

      enum UserRole {
        ADMIN
        CUSTOMER
      }

      type User {
        id: ID!
        name: String!
        role: UserRole!
        createdAt: DateTime!
      }

      input UsersInput {
        from: DateTime
        to: DateTime
        role: [UserRole!]!
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

    const result = mergeOutputs([await plugin(schema, [{ document }], {})]);

    expect(result).toMatchInlineSnapshot(`
      "type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      export type ResponseErrorType =
        | 'NOT_FOUND'
        | 'INPUT_VALIDATION_ERROR'
        | 'FORBIDDEN_ERROR'
        | 'UNEXPECTED_ERROR';

      export type UserRole =
        | 'ADMIN'
        | 'CUSTOMER';

      export type UsersInput = {
        from: DateTime;
        to: DateTime;
        role: Array<UserRole>;
      };

      export type UserQueryVariables = Exact<{
        id: string;
      }>;


      export type UserQuery = { __typename?: 'Query' };

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

  it('try different way to generate enums', async () => {
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

    const result = mergeOutputs([await plugin(schema, [{ document }], { enumType: 'string-literal' })]);

    expect(result).toMatchInlineSnapshot(`
      "type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      export type UserRole =
        | 'ADMIN'
        | 'CUSTOMER';

      export type UserQueryVariables = Exact<{
        id: string;
      }>;


      export type UserQuery = { __typename?: 'Query', user?: { __typename?: 'User', id: string, name: string, role: UserRole } | null };
      "
    `);

    const result2 = mergeOutputs([await plugin(schema, [{ document }], { enumType: 'native-numeric' })]);

    expect(result2).toMatchInlineSnapshot(`
      "type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      export enum UserRole {
        Admin = 0,
        Customer = 1
      }

      export type UserQueryVariables = Exact<{
        id: string;
      }>;


      export type UserQuery = { __typename?: 'Query', user?: { __typename?: 'User', id: string, name: string, role: UserRole } | null };
      "
    `);

    const result3 = mergeOutputs([await plugin(schema, [{ document }], { enumType: 'const' })]);

    expect(result3).toMatchInlineSnapshot(`
      "type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      export const UserRole = {
        Admin: 'ADMIN',
        Customer: 'CUSTOMER'
      } as const;

      export type UserRole = typeof UserRole[keyof typeof UserRole];
      export type UserQueryVariables = Exact<{
        id: string;
      }>;


      export type UserQuery = { __typename?: 'Query', user?: { __typename?: 'User', id: string, name: string, role: UserRole } | null };
      "
    `);

    const result4 = mergeOutputs([await plugin(schema, [{ document }], { enumType: 'native-const' })]);

    expect(result4).toMatchInlineSnapshot(`
      "type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      export const enum UserRole {
        Admin = 'ADMIN',
        Customer = 'CUSTOMER'
      };

      export type UserQueryVariables = Exact<{
        id: string;
      }>;


      export type UserQuery = { __typename?: 'Query', user?: { __typename?: 'User', id: string, name: string, role: UserRole } | null };
      "
    `);

    const result5 = mergeOutputs([await plugin(schema, [{ document }], { enumType: 'native' })]);

    expect(result5).toMatchInlineSnapshot(`
      "type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      export enum UserRole {
        Admin = 'ADMIN',
        Customer = 'CUSTOMER'
      }

      export type UserQueryVariables = Exact<{
        id: string;
      }>;


      export type UserQuery = { __typename?: 'Query', user?: { __typename?: 'User', id: string, name: string, role: UserRole } | null };
      "
    `);
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
      await plugin(schema, [{ document }], { scalars: { ID: 'string | number | boolean' } }),
    ]);

    expect(result).toMatchInlineSnapshot(`
      "type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      export type UserQueryVariables = Exact<{
        id: string | number | boolean;
      }>;


      export type UserQuery = { __typename?: 'Query', user?: { __typename?: 'User', id: string | number | boolean, name: string } | null };
      "
    `);
  });
});

describe('TypeScript Operations Plugin - Enum', () => {
  it.todo('does not generate unused enum in variables and result');
  it.todo('handles native numeric enum correctly');
  it.todo('handles const enum correctly');
  it.todo('handles native const enum correctly');
  it.todo('handles native enum correctly');
  it.todo('handles EnumValues correctly');
  // Bring over tests from https://github.com/dotansimha/graphql-code-generator/blob/accdab69106605241933e9d66d64dc7077656f30/packages/plugins/typescript/typescript/tests/typescript.spec.ts
});
