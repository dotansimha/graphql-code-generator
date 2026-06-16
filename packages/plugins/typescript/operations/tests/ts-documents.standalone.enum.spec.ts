import { buildSchema, parse } from 'graphql';
import { mergeOutputs } from '@graphql-codegen/plugin-helpers';
import { validateTs } from '@graphql-codegen/testing';
import { plugin } from '../src/index.js';

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

    const result = mergeOutputs([await plugin(schema, [{ document }], {}, { outputFile: '' })]);

    expect(result).toMatchInlineSnapshot(`
      "/** Internal type. DO NOT USE DIRECTLY. */
      type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      /** Internal type. DO NOT USE DIRECTLY. */
      export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
      export type MeQueryVariables = Exact<{ [key: string]: never; }>;


      export type MeQuery = { me: { id: string } | null };
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

    const result = mergeOutputs([
      await plugin(schema, [{ document }], { enumType: 'native-numeric' }, { outputFile: '' }),
    ]);

    expect(result).toMatchInlineSnapshot(`
      "/** Internal type. DO NOT USE DIRECTLY. */
      type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      /** Internal type. DO NOT USE DIRECTLY. */
      export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
      export enum UserRole {
        Admin = 0,
        Customer = 1
      }

      export type MeQueryVariables = Exact<{
        role: UserRole;
      }>;


      export type MeQuery = { me: { id: string } | null };
      "
    `);

    validateTs(result, undefined, undefined, undefined, undefined, true);
  });

  it('handles `native-numeric` enum with types prefix and suffix', async () => {
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
      await plugin(
        schema,
        [{ document }],
        { enumType: 'native-numeric', typesPrefix: 'AA_', typesSuffix: '_ZZ' },
        { outputFile: '' },
      ),
    ]);

    expect(result).toMatchInlineSnapshot(`
      "/** Internal type. DO NOT USE DIRECTLY. */
      type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      /** Internal type. DO NOT USE DIRECTLY. */
      export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
      export enum AA_UserRole_ZZ {
        Admin_ZZ = 0,
        Customer_ZZ = 1
      }

      export type AA_MeQueryVariables_ZZ = Exact<{
        role: AA_UserRole_ZZ;
      }>;


      export type AA_MeQuery_ZZ = { me: { id: string } | null };
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

    const result = mergeOutputs([
      await plugin(schema, [{ document }], { enumType: 'const' }, { outputFile: '' }),
    ]);

    expect(result).toMatchInlineSnapshot(`
      "/** Internal type. DO NOT USE DIRECTLY. */
      type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      /** Internal type. DO NOT USE DIRECTLY. */
      export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
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


      export type MeQuery = { me: { id: string } | null };
      "
    `);

    validateTs(result, undefined, undefined, undefined, undefined, true);
  });

  it('handles `const` enum with types prefix and suffix', async () => {
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

    const result = mergeOutputs([
      await plugin(
        schema,
        [{ document }],
        { enumType: 'const', typesPrefix: 'AA_', typesSuffix: '_ZZ' },
        { outputFile: '' },
      ),
    ]);

    expect(result).toMatchInlineSnapshot(`
      "/** Internal type. DO NOT USE DIRECTLY. */
      type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      /** Internal type. DO NOT USE DIRECTLY. */
      export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
      export const AA_UserRole_ZZ = {
        AA_ABC_ZZ: 'A_B_C',
        AA_XYZ_ZZ: 'X_Y_Z',
        AA_Test_ZZ: '_TEST',
        AA_MyValue_ZZ: 'My_Value',
        AA_123_ZZ: '_123'
      } as const;

      export type AA_UserRole_ZZ = typeof AA_UserRole_ZZ[keyof typeof AA_UserRole_ZZ];
      export type AA_MeQueryVariables_ZZ = Exact<{
        role: AA_UserRole_ZZ;
      }>;


      export type AA_MeQuery_ZZ = { me: { id: string } | null };
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

    const result = mergeOutputs([
      await plugin(schema, [{ document }], { enumType: 'native-const' }, { outputFile: '' }),
    ]);

    expect(result).toMatchInlineSnapshot(`
      "/** Internal type. DO NOT USE DIRECTLY. */
      type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      /** Internal type. DO NOT USE DIRECTLY. */
      export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
      /** Multiline comment test */
      export const enum UserRole {
        Admin = 'ADMIN',
        /** @deprecated Enum value CUSTOMER has been deprecated. */
        Customer = 'CUSTOMER'
      };

      export type MeQueryVariables = Exact<{
        role: UserRole;
      }>;


      export type MeQuery = { me: { id: string } | null };
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

    const result = mergeOutputs([
      await plugin(schema, [{ document }], { enumType: 'native' }, { outputFile: '' }),
    ]);

    expect(result).toMatchInlineSnapshot(`
      "/** Internal type. DO NOT USE DIRECTLY. */
      type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      /** Internal type. DO NOT USE DIRECTLY. */
      export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
      export enum UserRole {
        Admin = 'ADMIN',
        Customer = 'CUSTOMER'
      }

      export type MeQueryVariables = Exact<{
        role: UserRole;
      }>;


      export type MeQuery = { me: { id: string } | null };
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

    const result = mergeOutputs([
      await plugin(schema, [{ document }], { enumType: 'native' }, { outputFile: '' }),
    ]);

    expect(result).toMatchInlineSnapshot(`
      "/** Internal type. DO NOT USE DIRECTLY. */
      type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      /** Internal type. DO NOT USE DIRECTLY. */
      export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
      export enum UserRole {
        ABC = 'A_B_C',
        XYZ = 'X_Y_Z',
        Test = '_TEST',
        MyValue = 'My_Value'
      }

      export type MeQueryVariables = Exact<{
        role: UserRole;
      }>;


      export type MeQuery = { me: { id: string } | null };
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

    const result = mergeOutputs([
      await plugin(schema, [{ document }], { enumType: 'native' }, { outputFile: '' }),
    ]);

    expect(result).toMatchInlineSnapshot(`
      "/** Internal type. DO NOT USE DIRECTLY. */
      type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      /** Internal type. DO NOT USE DIRECTLY. */
      export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
      export enum UserRole {
        _ = '_',
        __ = '__',
        Test = '_TEST'
      }

      export type MeQueryVariables = Exact<{
        role: UserRole;
      }>;


      export type MeQuery = { me: { id: string } | null };
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

    const result = mergeOutputs([
      await plugin(
        schema,
        [{ document }],
        { typesPrefix: 'I', enumPrefix: true },
        { outputFile: '' },
      ),
    ]);
    expect(result).toMatchInlineSnapshot(`
      "/** Internal type. DO NOT USE DIRECTLY. */
      type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      /** Internal type. DO NOT USE DIRECTLY. */
      export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
      export type IUserRole =
        | 'ADMIN'
        | 'CUSTOMER';

      export type IMeQueryVariables = Exact<{
        role: IUserRole;
      }>;


      export type IMeQuery = { me: { id: string } | null };
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

    const result = mergeOutputs([
      await plugin(
        schema,
        [{ document }],
        { typesPrefix: 'I', enumPrefix: false },
        { outputFile: '' },
      ),
    ]);
    expect(result).toMatchInlineSnapshot(`
      "/** Internal type. DO NOT USE DIRECTLY. */
      type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      /** Internal type. DO NOT USE DIRECTLY. */
      export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
      export type UserRole =
        | 'ADMIN'
        | 'CUSTOMER';

      export type IMeQueryVariables = Exact<{
        role: UserRole;
      }>;


      export type IMeQuery = { me: { id: string } | null };
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

    const result = mergeOutputs([
      await plugin(
        schema,
        [{ document }],
        { typesSuffix: 'Z', enumSuffix: true },
        { outputFile: '' },
      ),
    ]);
    expect(result).toMatchInlineSnapshot(`
      "/** Internal type. DO NOT USE DIRECTLY. */
      type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      /** Internal type. DO NOT USE DIRECTLY. */
      export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
      export type UserRoleZ =
        | 'ADMIN'
        | 'CUSTOMER';

      export type MeQueryVariablesZ = Exact<{
        role: UserRoleZ;
      }>;


      export type MeQueryZ = { me: { id: string } | null };
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

    const result = mergeOutputs([
      await plugin(
        schema,
        [{ document }],
        { typesSuffix: 'Z', enumSuffix: false },
        { outputFile: '' },
      ),
    ]);
    expect(result).toMatchInlineSnapshot(`
      "/** Internal type. DO NOT USE DIRECTLY. */
      type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      /** Internal type. DO NOT USE DIRECTLY. */
      export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
      export type UserRole =
        | 'ADMIN'
        | 'CUSTOMER';

      export type MeQueryVariablesZ = Exact<{
        role: UserRole;
      }>;


      export type MeQueryZ = { me: { id: string } | null };
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

      input UserRoleInput {
        role: UserRole!
      }

      enum UserRole {
        ADMIN
        CUSTOMER
      }

      scalar DateTime
    `);

    const document = parse(/* GraphQL */ `
      query Me($input: UserRoleInput!, $role: UserRole!) {
        me {
          id
          role
        }
      }
    `);

    const result = mergeOutputs([
      await plugin(
        schema,
        [{ document }],
        {
          namingConvention: {
            typeNames: 'change-case-all#lowerCase',
            enumValues: 'keep',
          },
        },
        { outputFile: '' },
      ),
    ]);
    expect(result).toMatchInlineSnapshot(`
      "/** Internal type. DO NOT USE DIRECTLY. */
      type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      /** Internal type. DO NOT USE DIRECTLY. */
      export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
      export type userroleinput = {
        role: userrole;
      };

      export type userrole =
        | 'ADMIN'
        | 'CUSTOMER';

      export type mequeryvariables = Exact<{
        input: userroleinput;
        role: userrole;
      }>;


      export type mequery = { me: { id: string, role: userrole } | null };
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

      input UserRoleInput {
        role: UserRole!
      }

      enum UserRole {
        ADMIN
        CUSTOMER
      }

      scalar DateTime
    `);

    const document = parse(/* GraphQL */ `
      query Me($input: UserRoleInput!, $role: UserRole!) {
        me {
          id
          role
        }
      }
    `);

    const result = mergeOutputs([
      await plugin(
        schema,
        [{ document }],
        {
          enumType: 'native',
          namingConvention: {
            typeNames: 'keep',
            enumValues: 'change-case-all#lowerCase',
          },
        },
        { outputFile: '' },
      ),
    ]);
    expect(result).toMatchInlineSnapshot(`
      "/** Internal type. DO NOT USE DIRECTLY. */
      type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      /** Internal type. DO NOT USE DIRECTLY. */
      export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
      export type UserRoleInput = {
        role: UserRole;
      };

      export enum UserRole {
        admin = 'ADMIN',
        customer = 'CUSTOMER'
      }

      export type MeQueryVariables = Exact<{
        input: UserRoleInput;
        role: UserRole;
      }>;


      export type MeQuery = { me: { id: string, role: UserRole } | null };
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
      await plugin(
        schema,
        [{ document }],
        {
          noExport: true,
        },
        { outputFile: '' },
      ),
    ]);
    expect(result).toMatchInlineSnapshot(`
      "/** Internal type. DO NOT USE DIRECTLY. */
      type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      /** Internal type. DO NOT USE DIRECTLY. */
      export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
      type UserRole =
        | 'ADMIN'
        | 'CUSTOMER';

      type MeQueryVariables = Exact<{
        role: UserRole;
      }>;


      type MeQuery = { me: { id: string } | null };
      "
    `);

    validateTs(result, undefined, undefined, undefined, undefined, true);
  });

  it('handles enumValues and named default import', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type Query {
        me: User
      }

      input UserRoleInput {
        role: UserRole!
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
      query Me($input: UserRoleInput!, $role: UserRole!) {
        me {
          id
          role
        }
      }
    `);

    const result = mergeOutputs([
      await plugin(
        schema,
        [{ document }],
        {
          typesPrefix: 'I',
          namingConvention: { enumValues: 'change-case-all#constantCase' },
          enumValues: {
            UserRole: './files#default as UserRole', // NOTE: `as UserRole` doesn't do anything here, this is here to demonstrate that it's the same as './files#default'
          },
        },
        { outputFile: '' },
      ),
    ]);

    expect(result).toMatchInlineSnapshot(`
      "import IUserRole from './files';
      /** Internal type. DO NOT USE DIRECTLY. */
      type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      /** Internal type. DO NOT USE DIRECTLY. */
      export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
      export type IUserRoleInput = {
        role: IUserRole;
      };

      export { IUserRole };

      export type IMeQueryVariables = Exact<{
        input: IUserRoleInput;
        role: IUserRole;
      }>;


      export type IMeQuery = { me: { id: string, role: IUserRole } | null };
      "
    `);

    validateTs(result, undefined, undefined, undefined, undefined, true);
  });

  it('enum members should be quoted if numeric when enumType is native', async () => {
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
        AXB
        _1X2
        _3X4
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
      await plugin(schema, [{ document }], { enumType: 'native' }, { outputFile: '' }),
    ]);

    expect(result).toMatchInlineSnapshot(`
      "/** Internal type. DO NOT USE DIRECTLY. */
      type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      /** Internal type. DO NOT USE DIRECTLY. */
      export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
      export enum UserRole {
        Axb = 'AXB',
        '1X2' = '_1X2',
        '3X4' = '_3X4'
      }

      export type MeQueryVariables = Exact<{
        role: UserRole;
      }>;


      export type MeQuery = { me: { id: string } | null };
      "
    `);
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

    const result = mergeOutputs([
      await plugin(schema, [{ document }], { futureProofEnums: true }, { outputFile: '' }),
    ]);

    expect(result).toMatchInlineSnapshot(`
      "/** Internal type. DO NOT USE DIRECTLY. */
      type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      /** Internal type. DO NOT USE DIRECTLY. */
      export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
      export type UserRole =
        | 'ADMIN'
        | 'CUSTOMER'
        | '%future added value';

      export type MeQueryVariables = Exact<{
        role: UserRole;
      }>;


      export type MeQuery = { me: { id: string } | null };
      "
    `);

    validateTs(result, undefined, undefined, undefined, undefined, true);
  });
});

describe('TypeScript Operations Plugin - Enum enumValues', () => {
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

      input UserRoleInput {
        role: UserRole!
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
      query Me($input: UserRoleInput!, $role: UserRole!) {
        me {
          id
          role
        }
      }
    `);

    const result = mergeOutputs([
      await plugin(
        schema,
        [{ document }],
        {
          enumType: 'string-literal',
          enumValues: {
            UserRole: {
              A_B_C: 0,
              X_Y_Z: 'Foo',
              _TEST: 'Bar',
              My_Value: 1,
            },
          },
        },
        { outputFile: '' },
      ),
    ]);

    expect(result).toMatchInlineSnapshot(`
      "/** Internal type. DO NOT USE DIRECTLY. */
      type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      /** Internal type. DO NOT USE DIRECTLY. */
      export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
      export type UserRoleInput = {
        role: UserRole;
      };

      export type UserRole =
        | 0
        | 'Foo'
        | 'Bar'
        | 1;

      export type MeQueryVariables = Exact<{
        input: UserRoleInput;
        role: UserRole;
      }>;


      export type MeQuery = { me: { id: string, role: UserRole } | null };
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

      input UserRoleInput {
        role: UserRole!
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
      query Me($input: UserRoleInput!, $role: UserRole!) {
        me {
          id
          role
        }
      }
    `);

    const result = mergeOutputs([
      await plugin(
        schema,
        [{ document }],
        {
          enumType: 'const',
          enumValues: {
            UserRole: {
              A_B_C: 0,
              X_Y_Z: 'Foo',
              _TEST: 'Bar',
              My_Value: 1,
            },
          },
        },
        { outputFile: '' },
      ),
    ]);

    expect(result).toMatchInlineSnapshot(`
      "/** Internal type. DO NOT USE DIRECTLY. */
      type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      /** Internal type. DO NOT USE DIRECTLY. */
      export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
      export type UserRoleInput = {
        role: UserRole;
      };

      export const UserRole = {
        ABC: 0,
        XYZ: 'Foo',
        Test: 'Bar',
        MyValue: 1
      } as const;

      export type UserRole = typeof UserRole[keyof typeof UserRole];
      export type MeQueryVariables = Exact<{
        input: UserRoleInput;
        role: UserRole;
      }>;


      export type MeQuery = { me: { id: string, role: UserRole } | null };
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

      input UserRoleInput {
        role: UserRole!
      }

      enum UserRole {
        ADMIN
        CUSTOMER
      }

      scalar DateTime
    `);
    const document = parse(/* GraphQL */ `
      query Me($input: UserRoleInput!, $role: UserRole!) {
        me {
          id
          role
        }
      }
    `);

    const result = mergeOutputs([
      await plugin(
        schema,
        [{ document }],
        {
          enumType: 'native',
          enumValues: {
            UserRole: {
              ADMIN: 0,
              CUSTOMER: 'test',
            },
          },
        },
        { outputFile: '' },
      ),
    ]);

    expect(result).toMatchInlineSnapshot(`
      "/** Internal type. DO NOT USE DIRECTLY. */
      type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      /** Internal type. DO NOT USE DIRECTLY. */
      export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
      export type UserRoleInput = {
        role: UserRole;
      };

      export enum UserRole {
        Admin = 0,
        Customer = 'test'
      }

      export type MeQueryVariables = Exact<{
        input: UserRoleInput;
        role: UserRole;
      }>;


      export type MeQuery = { me: { id: string, role: UserRole } | null };
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

      input UserRoleInput {
        role: UserRole!
      }

      enum UserRole {
        ADMIN
        CUSTOMER
      }

      scalar DateTime
    `);

    const document = parse(/* GraphQL */ `
      query Me($input: UserRoleInput!, $role: UserRole!) {
        me {
          id
          role
        }
      }
    `);

    const result = mergeOutputs([
      await plugin(
        schema,
        [{ document }],
        {
          enumValues: {
            UserRole: './my-file#MyEnum',
          },
        },
        { outputFile: '' },
      ),
    ]);

    expect(result).toMatchInlineSnapshot(`
      "import { MyEnum as UserRole } from './my-file';
      /** Internal type. DO NOT USE DIRECTLY. */
      type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      /** Internal type. DO NOT USE DIRECTLY. */
      export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
      export type UserRoleInput = {
        role: UserRole;
      };

      export { UserRole };

      export type MeQueryVariables = Exact<{
        input: UserRoleInput;
        role: UserRole;
      }>;


      export type MeQuery = { me: { id: string, role: UserRole } | null };
      "
    `);

    validateTs(result, undefined, undefined, undefined, undefined, true);
  });

  it('does not import or export `enumValues` (as file import) if enum is not used', async () => {
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
      query {
        me {
          id
        }
      }
    `);

    const result = mergeOutputs([
      await plugin(
        schema,
        [{ document }],
        {
          enumValues: {
            UserRole: './my-file#MyEnum',
          },
        },
        { outputFile: '' },
      ),
    ]);

    expect(result).toMatchInlineSnapshot(`
      "/** Internal type. DO NOT USE DIRECTLY. */
      type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      /** Internal type. DO NOT USE DIRECTLY. */
      export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
      export type Unnamed_1_QueryVariables = Exact<{ [key: string]: never; }>;


      export type Unnamed_1_Query = { me: { id: string } | null };
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

      input UserRoleInput {
        role: UserRole!
      }

      enum UserRole {
        ADMIN
        CUSTOMER
      }

      scalar DateTime
    `);

    const document = parse(/* GraphQL */ `
      query Me($input: UserRoleInput!, $role: UserRole!) {
        me {
          id
          role
        }
      }
    `);

    const result = mergeOutputs([
      await plugin(
        schema,
        [{ document }],
        {
          enumValues: {
            UserRole: './my-file#NS.ETest',
          },
        },
        { outputFile: '' },
      ),
    ]);

    expect(result).toMatchInlineSnapshot(`
      "import { NS } from './my-file';
      import UserRole = NS.ETest;
      /** Internal type. DO NOT USE DIRECTLY. */
      type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      /** Internal type. DO NOT USE DIRECTLY. */
      export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
      export type UserRoleInput = {
        role: UserRole;
      };

      export { UserRole };

      export type MeQueryVariables = Exact<{
        input: UserRoleInput;
        role: UserRole;
      }>;


      export type MeQuery = { me: { id: string, role: UserRole } | null };
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

      input UserRoleInput {
        role: UserRole!
      }

      enum UserRole {
        ADMIN
        CUSTOMER
      }

      scalar DateTime
    `);

    const document = parse(/* GraphQL */ `
      query Me($input: UserRoleInput!, $role: UserRole!) {
        me {
          id
          role
        }
      }
    `);

    const result = mergeOutputs([
      await plugin(
        schema,
        [{ document }],
        {
          enumValues: {
            UserRole: './my-file#NS.UserRole',
          },
        },
        { outputFile: '' },
      ),
    ]);

    expect(result).toMatchInlineSnapshot(`
      "import { NS } from './my-file';
      import UserRole = NS.UserRole;
      /** Internal type. DO NOT USE DIRECTLY. */
      type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      /** Internal type. DO NOT USE DIRECTLY. */
      export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
      export type UserRoleInput = {
        role: UserRole;
      };

      export { UserRole };

      export type MeQueryVariables = Exact<{
        input: UserRoleInput;
        role: UserRole;
      }>;


      export type MeQuery = { me: { id: string, role: UserRole } | null };
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

      input UserRoleInput {
        role: UserRole!
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
      query Me($input: UserRoleInput!, $role: UserRole!, $status: UserStatus!) {
        me {
          id
          role
        }
      }
    `);

    const result = mergeOutputs([
      await plugin(
        schema,
        [{ document }],
        {
          enumType: 'native',
          enumValues: './my-file',
        },
        { outputFile: '' },
      ),
    ]);

    expect(result).toMatchInlineSnapshot(`
      "import { UserRole } from './my-file';
      import { UserStatus } from './my-file';
      /** Internal type. DO NOT USE DIRECTLY. */
      type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      /** Internal type. DO NOT USE DIRECTLY. */
      export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
      export type UserRoleInput = {
        role: UserRole;
      };

      export { UserRole };

      export { UserStatus };

      export type MeQueryVariables = Exact<{
        input: UserRoleInput;
        role: UserRole;
        status: UserStatus;
      }>;


      export type MeQuery = { me: { id: string, role: UserRole } | null };
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

      input UserRoleInput {
        role: UserRole!
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
      query Me($input: UserRoleInput!, $role: UserRole!, $status: UserStatus!) {
        me {
          id
          role
        }
      }
    `);

    const result = mergeOutputs([
      await plugin(
        schema,
        [{ document }],
        {
          enumType: 'native',
          enumValues: { UserRole: './my-file#UserRole', UserStatus: './my-file#UserStatus2X' },
        },
        { outputFile: '' },
      ),
    ]);

    expect(result).toMatchInlineSnapshot(`
      "import { UserRole } from './my-file';
      import { UserStatus2X as UserStatus } from './my-file';
      /** Internal type. DO NOT USE DIRECTLY. */
      type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      /** Internal type. DO NOT USE DIRECTLY. */
      export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
      export type UserRoleInput = {
        role: UserRole;
      };

      export { UserRole };

      export { UserStatus };

      export type MeQueryVariables = Exact<{
        input: UserRoleInput;
        role: UserRole;
        status: UserStatus;
      }>;


      export type MeQuery = { me: { id: string, role: UserRole } | null };
      "
    `);

    validateTs(result, undefined, undefined, undefined, undefined, true);
  });

  it('#10471 - `enumValues` as named import from file must consider naming convention', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type Query {
        license: License
      }

      type License {
        id: ID!
        sku: LicenseSKU!
      }

      enum LicenseSKU {
        BASIC
        ADVANCED
      }
    `);

    const document = parse(/* GraphQL */ `
      query License {
        license {
          sku
        }
      }
    `);

    const result = mergeOutputs([
      await plugin(
        schema,
        [{ document }],
        {
          enumValues: {
            LicenseSKU: './my-file#LicenseSku',
          },
        },
        { outputFile: '' },
      ),
    ]);

    expect(result).toMatchInlineSnapshot(`
      "import { LicenseSku } from './my-file';
      /** Internal type. DO NOT USE DIRECTLY. */
      type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      /** Internal type. DO NOT USE DIRECTLY. */
      export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
      export { LicenseSku };

      export type LicenseQueryVariables = Exact<{ [key: string]: never; }>;


      export type LicenseQuery = { license: { sku: LicenseSku } | null };
      "
    `);

    validateTs(result, undefined, undefined, undefined, undefined, true);
  });
});
