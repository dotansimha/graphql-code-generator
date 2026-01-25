import { buildSchema, parse } from 'graphql';
import { validateTs } from '@graphql-codegen/testing';
import { mergeOutputs } from '@graphql-codegen/plugin-helpers';
import { plugin } from '../src/index.js';

describe('TypeScript Operations Plugin - Import Types', () => {
  it('imports user-defined types externally with relative importSchemaTypesFrom correctly', async () => {
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
      await plugin(
        schema,
        [{ document }],
        {
          importSchemaTypesFrom: './base-dir/path-to-other-file.generated.ts',
          namespacedImportName: 'TypeImport',
        },
        { outputFile: './base-dir/this-file.ts' }
      ),
    ]);

    expect(result).toMatchInlineSnapshot(`
      "import type * as TypeImport from './path-to-other-file.generated';

      type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
      export type UserQueryVariables = Exact<{
        id: string;
      }>;


      export type UserQuery = { user: { id: string, name: string, role: TypeImport.UserRole, createdAt: unknown } | null };

      export type UsersQueryVariables = Exact<{
        input: TypeImport.UsersInput;
      }>;


      export type UsersQuery = { users:
          | { result: Array<{ id: string }> }
          | { error: TypeImport.ResponseErrorType }
         };

      export type UsersWithScalarInputQueryVariables = Exact<{
        from: unknown;
        to?: unknown;
        role?: TypeImport.UserRole | null | undefined;
      }>;


      export type UsersWithScalarInputQuery = { users:
          | { result: Array<{ __typename: 'User' }> }
          | { __typename: 'ResponseError' }
         };
      "
    `);
  });

  it('imports user-defined types externally with absolute importSchemaTypesFrom correctly', async () => {
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
      await plugin(
        schema,
        [{ document }],
        {
          importSchemaTypesFrom: '~@my-company/package/types',
          namespacedImportName: 'TypeImport',
        },
        { outputFile: './base-dir/this-file.ts' }
      ),
    ]);

    expect(result).toMatchInlineSnapshot(`
      "import type * as TypeImport from '@my-company/package/types';

      type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
      export type UserQueryVariables = Exact<{
        id: string;
      }>;


      export type UserQuery = { user: { id: string, name: string, role: TypeImport.UserRole, createdAt: unknown } | null };

      export type UsersQueryVariables = Exact<{
        input: TypeImport.UsersInput;
      }>;


      export type UsersQuery = { users:
          | { result: Array<{ id: string }> }
          | { error: TypeImport.ResponseErrorType }
         };

      export type UsersWithScalarInputQueryVariables = Exact<{
        from: unknown;
        to?: unknown;
        role?: TypeImport.UserRole | null | undefined;
      }>;


      export type UsersWithScalarInputQuery = { users:
          | { result: Array<{ __typename: 'User' }> }
          | { __typename: 'ResponseError' }
         };
      "
    `);
  });

  it('does not import external types if only native GraphQL types are used in Variables and Result', async () => {
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
      await plugin(
        schema,
        [{ document }],
        {
          importSchemaTypesFrom: './path-to-other-file',
          namespacedImportName: 'TypeImport',
        },
        { outputFile: '' }
      ),
    ]);

    expect(result).toMatchInlineSnapshot(`
      "import type * as TypeImport from './graphql-code-generator/path-to-other-file';

      type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
      export type UserQueryVariables = Exact<{
        id?: string | null | undefined;
        name?: string | null | undefined;
        bool?: boolean | null | undefined;
        int?: number | null | undefined;
        float?: number | null | undefined;
      }>;


      export type UserQuery = { user: { id: string, name: string, isOld: boolean, ageInt: number, ageFloat: number } | null };
      "
    `);

    validateTs(result, undefined, undefined, undefined, undefined, true);
  });
});

describe('TypeScript Operations Plugin - Import Types with external custom Scalars', () => {
  it('imports external custom scalar in shared type file when said scalar is used in relevant Input', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type Query {
        user(input: UserInput): User
      }

      input UserInput {
        id: ID!
        scalar1: Scalar1
      }

      type User {
        id: ID!
      }

      scalar Scalar1
    `);
    const document = parse(/* GraphQL */ `
      query User($input: UserInput) {
        user(input: $input) {
          id
        }
      }
    `);

    const sharedTypeFileResult = mergeOutputs([
      await plugin(
        schema,
        [{ document }],
        {
          generatesOperationTypes: false,
          scalars: {
            Scalar1: '@org/scalars#Scalar1',
          },
        },
        { outputFile: '' }
      ),
    ]);
    expect(sharedTypeFileResult).toMatchInlineSnapshot(`
      "import { Scalar1 } from '@org/scalars';


      export type UserInput = {
        id: string | number;
        scalar1?: Scalar1 | null | undefined;
      };
      "
    `);
    validateTs(sharedTypeFileResult, undefined, undefined, undefined, undefined, true);

    const operationFileResult = mergeOutputs([
      await plugin(
        schema,
        [{ document }],
        {
          importSchemaTypesFrom: './path-to-other-file',
          namespacedImportName: 'TypeImport',
          scalars: {
            Scalar1: '@org/scalars#Scalar1',
          },
        },
        { outputFile: '' }
      ),
    ]);
    expect(operationFileResult).toMatchInlineSnapshot(`
      "import type * as TypeImport from './graphql-code-generator/path-to-other-file';

      import { Scalar1 } from '@org/scalars';
      type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
      export type UserQueryVariables = Exact<{
        input?: TypeImport.UserInput | null | undefined;
      }>;


      export type UserQuery = { user: { id: string } | null };
      "
    `);
    validateTs(operationFileResult, undefined, undefined, undefined, undefined, true);
  });

  it('imports external custom scalar in operation file when said scalar is used in Variables', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type Query {
        user(id: ID!): User
      }

      type User {
        id: ID!
        scalar1: Scalar1
      }

      scalar Scalar1
    `);
    const document = parse(/* GraphQL */ `
      query User($scalar1: Scalar1) {
        user(id: "100") {
          id
        }
      }
    `);

    const sharedTypeFileResult = mergeOutputs([
      await plugin(
        schema,
        [{ document }],
        {
          generatesOperationTypes: false,
          scalars: {
            Scalar1: '@org/scalars#Scalar1',
          },
        },
        { outputFile: '' }
      ),
    ]);
    expect(sharedTypeFileResult).toMatchInlineSnapshot(`
      "import { Scalar1 } from '@org/scalars';


      "
    `);
    validateTs(sharedTypeFileResult, undefined, undefined, undefined, undefined, true);

    const operationFileResult = mergeOutputs([
      await plugin(
        schema,
        [{ document }],
        {
          importSchemaTypesFrom: './path-to-other-file',
          namespacedImportName: 'TypeImport',
          scalars: {
            Scalar1: '@org/scalars#Scalar1',
          },
        },
        { outputFile: '' }
      ),
    ]);
    expect(operationFileResult).toMatchInlineSnapshot(`
      "import type * as TypeImport from './graphql-code-generator/path-to-other-file';

      import { Scalar1 } from '@org/scalars';
      type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
      export type UserQueryVariables = Exact<{
        scalar1?: Scalar1 | null | undefined;
      }>;


      export type UserQuery = { user: { id: string } | null };
      "
    `);
    validateTs(operationFileResult, undefined, undefined, undefined, undefined, true);
  });

  it('imports external custom scalar in operation file when said scalar is used in Result SelectionSet', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type Query {
        user(id: ID!): User
      }

      type User {
        id: ID!
        scalar1: Scalar1
      }

      scalar Scalar1
    `);
    const document = parse(/* GraphQL */ `
      query User {
        user(id: "100") {
          id
          scalar1
        }
      }
    `);

    const sharedTypeFileResult = mergeOutputs([
      await plugin(
        schema,
        [{ document }],
        {
          generatesOperationTypes: false,
          scalars: {
            Scalar1: '@org/scalars#Scalar1',
          },
        },
        { outputFile: '' }
      ),
    ]);
    expect(sharedTypeFileResult).toMatchInlineSnapshot(`
      "import { Scalar1 } from '@org/scalars';


      "
    `);
    validateTs(sharedTypeFileResult, undefined, undefined, undefined, undefined, true);

    const operationFileResult = mergeOutputs([
      await plugin(
        schema,
        [{ document }],
        {
          importSchemaTypesFrom: './path-to-other-file',
          namespacedImportName: 'TypeImport',
          scalars: {
            Scalar1: '@org/scalars#Scalar1',
          },
        },
        { outputFile: '' }
      ),
    ]);
    expect(operationFileResult).toMatchInlineSnapshot(`
      "import type * as TypeImport from './graphql-code-generator/path-to-other-file';

      import { Scalar1 } from '@org/scalars';
      type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
      export type UserQueryVariables = Exact<{ [key: string]: never; }>;


      export type UserQuery = { user: { id: string, scalar1: Scalar1 | null } | null };
      "
    `);
    validateTs(operationFileResult, undefined, undefined, undefined, undefined, true);
  });
});
