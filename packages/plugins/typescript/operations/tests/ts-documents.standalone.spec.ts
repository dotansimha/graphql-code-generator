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
      export type UserRole =
        | 'ADMIN'
        | 'CUSTOMER';

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
  it('does not generate enums if not used in variables and result', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type Query {
        me: User
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

      scalar DateTime
    `);
    const document = parse(/* GraphQL */ `
      query Me {
        me {
          id
        }
      }
    `);

    const result = mergeOutputs([await plugin(schema, [{ document }], {})]);

    expect(result).toMatchInlineSnapshot(`
      "type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      export type MeQueryVariables = Exact<{ [key: string]: never; }>;


      export type MeQuery = { __typename?: 'Query', me?: { __typename?: 'User', id: string } | null };
      "
    `);

    validateTs(result, undefined, undefined, undefined, undefined, true);
  });

  it('handles `native-numeric` enum correctly', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type Query {
        me: User
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

      scalar DateTime
    `);
    const document = parse(/* GraphQL */ `
      query Me($role: UserRole!) {
        me {
          id
        }
      }
    `);

    const result = mergeOutputs([await plugin(schema, [{ document }], { enumType: 'native-numeric' })]);

    expect(result).toMatchInlineSnapshot(`
      "type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      export enum UserRole {
        Admin = 0,
        Customer = 1
      }

      export type MeQueryVariables = Exact<{
        role: UserRole;
      }>;


      export type MeQuery = { __typename?: 'Query', me?: { __typename?: 'User', id: string } | null };
      "
    `);

    validateTs(result, undefined, undefined, undefined, undefined, true);
  });

  it('handles `const` enum correctly', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type Query {
        me: User
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

      scalar DateTime
    `);
    const document = parse(/* GraphQL */ `
      query Me($role: UserRole!) {
        me {
          id
        }
      }
    `);

    const result = mergeOutputs([await plugin(schema, [{ document }], { enumType: 'const' })]);

    expect(result).toMatchInlineSnapshot(`
      "type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      export const UserRole = {
        Admin: 'ADMIN',
        Customer: 'CUSTOMER'
      } as const;

      export type UserRole = typeof UserRole[keyof typeof UserRole];
      export type MeQueryVariables = Exact<{
        role: UserRole;
      }>;


      export type MeQuery = { __typename?: 'Query', me?: { __typename?: 'User', id: string } | null };
      "
    `);

    validateTs(result, undefined, undefined, undefined, undefined, true);
  });

  it('handles `native-const` enum correctly', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type Query {
        me: User
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

      scalar DateTime
    `);
    const document = parse(/* GraphQL */ `
      query Me($role: UserRole!) {
        me {
          id
        }
      }
    `);

    const result = mergeOutputs([await plugin(schema, [{ document }], { enumType: 'native-const' })]);

    expect(result).toMatchInlineSnapshot(`
      "type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      export const enum UserRole {
        Admin = 'ADMIN',
        Customer = 'CUSTOMER'
      };

      export type MeQueryVariables = Exact<{
        role: UserRole;
      }>;


      export type MeQuery = { __typename?: 'Query', me?: { __typename?: 'User', id: string } | null };
      "
    `);

    validateTs(result, undefined, undefined, undefined, undefined, true);
  });

  it('handles `native` enum correctly', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type Query {
        me: User
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

      scalar DateTime
    `);
    const document = parse(/* GraphQL */ `
      query Me($role: UserRole!) {
        me {
          id
        }
      }
    `);

    const result = mergeOutputs([await plugin(schema, [{ document }], { enumType: 'native' })]);

    expect(result).toMatchInlineSnapshot(`
      "type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      export enum UserRole {
        Admin = 'ADMIN',
        Customer = 'CUSTOMER'
      }

      export type MeQueryVariables = Exact<{
        role: UserRole;
      }>;


      export type MeQuery = { __typename?: 'Query', me?: { __typename?: 'User', id: string } | null };
      "
    `);

    validateTs(result, undefined, undefined, undefined, undefined, true);
  });

  it('handles `enumValues` with `native` enum correctly', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type Query {
        me: User
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

      scalar DateTime
    `);
    const document = parse(/* GraphQL */ `
      query Me($role: UserRole!) {
        me {
          id
        }
      }
    `);

    const result = mergeOutputs([
      await plugin(schema, [{ document }], {
        enumType: 'native',
        enumValues: {
          UserRole: {
            ADMIN: 0,
            CUSTOMER: 'test',
          },
        },
      }),
    ]);

    expect(result).toMatchInlineSnapshot(`
      "type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      export enum UserRole {
        Admin = 0,
        Customer = 'test'
      }

      export type MeQueryVariables = Exact<{
        role: UserRole;
      }>;


      export type MeQuery = { __typename?: 'Query', me?: { __typename?: 'User', id: string } | null };
      "
    `);

    validateTs(result, undefined, undefined, undefined, undefined, true);
  });

  it.todo('handles `enumValues` as file correctly');
  // Bring over tests from https://github.com/dotansimha/graphql-code-generator/blob/accdab69106605241933e9d66d64dc7077656f30/packages/plugins/typescript/typescript/tests/typescript.spec.ts
});
