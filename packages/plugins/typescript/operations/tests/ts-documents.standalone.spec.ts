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

    const result = mergeOutputs([await plugin(schema, [{ document }], {})]);

    expect(result).toMatchInlineSnapshot(`
      "type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      /** UserRole Description */
      export type UserRole =
        /** UserRole ADMIN */
        | 'ADMIN'
        /** UserRole CUSTOMER */
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

  it('handles `native-numeric` enum', async () => {
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

  it('handles `const` enum', async () => {
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
        A_B_C
        X_Y_Z
        _TEST
        My_Value
        _123
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
        ABC: 'A_B_C',
        XYZ: 'X_Y_Z',
        Test: '_TEST',
        MyValue: 'My_Value',
        '123': '_123'
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

  it('handles `native-const` enum', async () => {
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

      """
      Multiline comment test
      """
      enum UserRole {
        ADMIN
        CUSTOMER @deprecated(reason: "Enum value CUSTOMER has been deprecated.")
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
      /** Multiline comment test */
      export const enum UserRole {
        Admin = 'ADMIN',
        /** @deprecated Enum value CUSTOMER has been deprecated. */
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

  it('handles `native` enum', async () => {
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

  it('handles `enumValues` with `string-literal` enum', async () => {
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
        A_B_C
        X_Y_Z
        _TEST
        My_Value
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
        enumType: 'string-literal',
        enumValues: {
          UserRole: {
            A_B_C: 0,
            X_Y_Z: 'Foo',
            _TEST: 'Bar',
            My_Value: 1,
          },
        },
      }),
    ]);

    expect(result).toMatchInlineSnapshot(`
      "type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      export type UserRole =
        | 0
        | 'Foo'
        | 'Bar'
        | 1;

      export type MeQueryVariables = Exact<{
        role: UserRole;
      }>;


      export type MeQuery = { __typename?: 'Query', me?: { __typename?: 'User', id: string } | null };
      "
    `);

    validateTs(result, undefined, undefined, undefined, undefined, true);
  });

  it('handles `enumValues` with `const` enum', async () => {
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
        A_B_C
        X_Y_Z
        _TEST
        My_Value
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
        enumType: 'const',
        enumValues: {
          UserRole: {
            A_B_C: 0,
            X_Y_Z: 'Foo',
            _TEST: 'Bar',
            My_Value: 1,
          },
        },
      }),
    ]);

    expect(result).toMatchInlineSnapshot(`
      "type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      export const UserRole = {
        ABC: 0,
        XYZ: 'Foo',
        Test: 'Bar',
        MyValue: 1
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

  it('handles `enumValues` with `native` enum', async () => {
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

  it('handles `enumValues` as file import', async () => {
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
        enumValues: {
          UserRole: './my-file#MyEnum',
        },
      }),
    ]);

    expect(result).toMatchInlineSnapshot(`
      "import { MyEnum as UserRole } from './my-file';
      type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      export { UserRole };

      export type MeQueryVariables = Exact<{
        role: UserRole;
      }>;


      export type MeQuery = { __typename?: 'Query', me?: { __typename?: 'User', id: string } | null };
      "
    `);

    validateTs(result, undefined, undefined, undefined, undefined, true);
  });

  it('handles `enumValues` with custom imported enum from namespace with different name', async () => {
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
        enumValues: {
          UserRole: './my-file#NS.ETest',
        },
      }),
    ]);

    expect(result).toMatchInlineSnapshot(`
      "import { NS } from './my-file';
      import UserRole = NS.ETest;
      type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      export { UserRole };

      export type MeQueryVariables = Exact<{
        role: UserRole;
      }>;


      export type MeQuery = { __typename?: 'Query', me?: { __typename?: 'User', id: string } | null };
      "
    `);

    validateTs(result, undefined, undefined, undefined, undefined, true);
  });

  it('handles `enumValues` with custom imported enum from namespace with the same name', async () => {
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
        enumValues: {
          UserRole: './my-file#NS.UserRole',
        },
      }),
    ]);

    expect(result).toMatchInlineSnapshot(`
      "import { NS } from './my-file';
      import UserRole = NS.UserRole;
      type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      export { UserRole };

      export type MeQueryVariables = Exact<{
        role: UserRole;
      }>;


      export type MeQuery = { __typename?: 'Query', me?: { __typename?: 'User', id: string } | null };
      "
    `);

    validateTs(result, undefined, undefined, undefined, undefined, true);
  });

  it('handles `enumValues` from a single file', async () => {
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

      enum UserStatus {
        ACTIVE
        PENDING
      }

      scalar DateTime
    `);

    const document = parse(/* GraphQL */ `
      query Me($role: UserRole!, $status: UserStatus!) {
        me {
          id
        }
      }
    `);

    const result = mergeOutputs([
      await plugin(schema, [{ document }], {
        enumType: 'native',
        enumValues: './my-file',
      }),
    ]);

    expect(result).toMatchInlineSnapshot(`
      "import { UserRole } from './my-file';
      import { UserStatus } from './my-file';
      type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      export { UserRole };

      export { UserStatus };

      export type MeQueryVariables = Exact<{
        role: UserRole;
        status: UserStatus;
      }>;


      export type MeQuery = { __typename?: 'Query', me?: { __typename?: 'User', id: string } | null };
      "
    `);

    validateTs(result, undefined, undefined, undefined, undefined, true);
  });

  it('handles `enumValues` from a single file when specified as string', async () => {
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

      enum UserStatus {
        ACTIVE
        PENDING
      }

      scalar DateTime
    `);

    const document = parse(/* GraphQL */ `
      query Me($role: UserRole!, $status: UserStatus!) {
        me {
          id
        }
      }
    `);

    const result = mergeOutputs([
      await plugin(schema, [{ document }], {
        enumType: 'native',
        enumValues: { UserRole: './my-file#UserRole', UserStatus: './my-file#UserStatus2X' },
      }),
    ]);

    expect(result).toMatchInlineSnapshot(`
      "import { UserRole } from './my-file';
      import { UserStatus2X as UserStatus } from './my-file';
      type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      export { UserRole };

      export { UserStatus };

      export type MeQueryVariables = Exact<{
        role: UserRole;
        status: UserStatus;
      }>;


      export type MeQuery = { __typename?: 'Query', me?: { __typename?: 'User', id: string } | null };
      "
    `);

    validateTs(result, undefined, undefined, undefined, undefined, true);
  });

  it('removes underscore from enum values', async () => {
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
        A_B_C
        X_Y_Z
        _TEST
        My_Value
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
        ABC = 'A_B_C',
        XYZ = 'X_Y_Z',
        Test = '_TEST',
        MyValue = 'My_Value'
      }

      export type MeQueryVariables = Exact<{
        role: UserRole;
      }>;


      export type MeQuery = { __typename?: 'Query', me?: { __typename?: 'User', id: string } | null };
      "
    `);

    validateTs(result, undefined, undefined, undefined, undefined, true);
  });

  it('keeps underscores in enum values when the value is only underscores', async () => {
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
        _
        __
        _TEST
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
        _ = '_',
        __ = '__',
        Test = '_TEST'
      }

      export type MeQueryVariables = Exact<{
        role: UserRole;
      }>;


      export type MeQuery = { __typename?: 'Query', me?: { __typename?: 'User', id: string } | null };
      "
    `);

    validateTs(result, undefined, undefined, undefined, undefined, true);
  });

  it('adds typesPrefix to enum when enumPrefix is true', async () => {
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

    const result = mergeOutputs([await plugin(schema, [{ document }], { typesPrefix: 'I', enumPrefix: true })]);
    expect(result).toMatchInlineSnapshot(`
      "type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      export type IUserRole =
        | 'ADMIN'
        | 'CUSTOMER';

      export type IMeQueryVariables = Exact<{
        role: IUserRole;
      }>;


      export type IMeQuery = { __typename?: 'Query', me?: { __typename?: 'User', id: string } | null };
      "
    `);

    validateTs(result, undefined, undefined, undefined, undefined, true);
  });

  it('does not add typesPrefix to enum when enumPrefix is false', async () => {
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

    const result = mergeOutputs([await plugin(schema, [{ document }], { typesPrefix: 'I', enumPrefix: false })]);
    expect(result).toMatchInlineSnapshot(`
      "type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      export type UserRole =
        | 'ADMIN'
        | 'CUSTOMER';

      export type IMeQueryVariables = Exact<{
        role: UserRole;
      }>;


      export type IMeQuery = { __typename?: 'Query', me?: { __typename?: 'User', id: string } | null };
      "
    `);

    validateTs(result, undefined, undefined, undefined, undefined, true);
  });

  it('adds typesSuffix to enum when enumSuffix is true', async () => {
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

    const result = mergeOutputs([await plugin(schema, [{ document }], { typesSuffix: 'Z', enumSuffix: true })]);
    expect(result).toMatchInlineSnapshot(`
      "type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      export type UserRoleZ =
        | 'ADMIN'
        | 'CUSTOMER';

      export type MeQueryVariablesZ = Exact<{
        role: UserRoleZ;
      }>;


      export type MeQueryZ = { __typename?: 'Query', me?: { __typename?: 'User', id: string } | null };
      "
    `);

    validateTs(result, undefined, undefined, undefined, undefined, true);
  });

  it('does not add typesSuffix to enum when enumSuffix is false', async () => {
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

    const result = mergeOutputs([await plugin(schema, [{ document }], { typesSuffix: 'Z', enumSuffix: false })]);
    expect(result).toMatchInlineSnapshot(`
      "type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      export type UserRole =
        | 'ADMIN'
        | 'CUSTOMER';

      export type MeQueryVariablesZ = Exact<{
        role: UserRole;
      }>;


      export type MeQueryZ = { __typename?: 'Query', me?: { __typename?: 'User', id: string } | null };
      "
    `);

    validateTs(result, undefined, undefined, undefined, undefined, true);
  });

  it('keeps enum value naming convention when namingConvention.enumValues is `keep`', async () => {
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
        namingConvention: {
          typeNames: 'change-case-all#lowerCase',
          enumValues: 'keep',
        },
      }),
    ]);
    expect(result).toMatchInlineSnapshot(`
      "type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      export type userrole =
        | 'ADMIN'
        | 'CUSTOMER';

      export type mequeryvariables = Exact<{
        role: userrole;
      }>;


      export type mequery = { __typename?: 'Query', me?: { __typename?: 'User', id: string } | null };
      "
    `);

    validateTs(result, undefined, undefined, undefined, undefined, true);
  });

  it('uses custom enum naming convention when namingConvention.enumValues is provided and enumType is native', async () => {
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
        namingConvention: {
          typeNames: 'keep',
          enumValues: 'change-case-all#lowerCase',
        },
      }),
    ]);
    expect(result).toMatchInlineSnapshot(`
      "type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      export enum UserRole {
        admin = 'ADMIN',
        customer = 'CUSTOMER'
      }

      export type MeQueryVariables = Exact<{
        role: UserRole;
      }>;


      export type MeQuery = { __typename?: 'Query', me?: { __typename?: 'User', id: string } | null };
      "
    `);

    validateTs(result, undefined, undefined, undefined, undefined, true);
  });

  it('does not contain "export" when noExport is set to true', async () => {
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
        noExport: true,
      }),
    ]);
    expect(result).toMatchInlineSnapshot(`
      "type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      type UserRole =
        | 'ADMIN'
        | 'CUSTOMER';

      type MeQueryVariables = Exact<{
        role: UserRole;
      }>;


      type MeQuery = { __typename?: 'Query', me?: { __typename?: 'User', id: string } | null };
      "
    `);

    validateTs(result, undefined, undefined, undefined, undefined, true);
  });
});

describe('TypeScript Operations Plugin - Enum `%future added value`', () => {
  it('adds `%future added value` to the type when enumType is `string-literal` and futureProofEnums is true', async () => {
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

    const result = mergeOutputs([await plugin(schema, [{ document }], { futureProofEnums: true })]);

    expect(result).toMatchInlineSnapshot(`
      "type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      export type UserRole =
        | 'ADMIN'
        | 'CUSTOMER'
        | '%future added value';

      export type MeQueryVariables = Exact<{
        role: UserRole;
      }>;


      export type MeQuery = { __typename?: 'Query', me?: { __typename?: 'User', id: string } | null };
      "
    `);

    validateTs(result, undefined, undefined, undefined, undefined, true);
  });

  it('it adds `%future added value` to output when enumType is `native` and futureProofEnums is true', async () => {
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
          role
        }
      }
    `);

    const result = mergeOutputs([await plugin(schema, [{ document }], { enumType: 'native', futureProofEnums: true })]);

    expect(result).toMatchInlineSnapshot(`
      "type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      export enum UserRole {
        Admin = 'ADMIN',
        Customer = 'CUSTOMER'
      }

      export type MeQueryVariables = Exact<{
        role: UserRole;
      }>;


      export type MeQuery = { __typename?: 'Query', me?: { __typename?: 'User', id: string, role: UserRole } | null };
      "
    `);

    validateTs(result, undefined, undefined, undefined, undefined, true);
  });

  it.todo('adds `%future added value` to enum usage when futureProofEnums is true and enumType is string-literal');
  it.todo('adds `%future added value` to enum usage when futureProofEnums is true and allowEnumStringTypes is true');
});
