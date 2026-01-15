import { mergeOutputs } from '@graphql-codegen/plugin-helpers';
import { validateTs } from '@graphql-codegen/testing';
import { buildSchema, parse } from 'graphql';
import { plugin } from '../src/index.js';

describe('TypeScript Operations Plugin - Input', () => {
  it('generates nested input correctly', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type Query {
        users(input: UsersInput!, ageRange1: [Int], ageRange2: [Int]!, ageRange3: [Int!], ageRange4: [Int!]!): [User!]!
      }

      type User {
        id: ID!
        ageRange1: [Int]
        ageRange2: [Int]!
        ageRange3: [Int!]
        ageRange4: [Int!]!
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
        timezone: TimeZone
        role: UserRole
        ageRange1: [Int]
        ageRange2: [Int]!
        ageRange3: [Int!]
        ageRange4: [Int!]!
        bestFriend: UsersBestFriendInput
        nestedInput: UsersInput
      }

      input UsersBestFriendInput {
        name: String
      }

      scalar DateTime
      scalar TimeZone
    `);
    const document = parse(/* GraphQL */ `
      query UsersWithScalarInput(
        $inputNonNullable: UsersInput!
        $inputNullable: UsersInput
        $ageRange1: [Int]
        $ageRange2: [Int]!
        $ageRange3: [Int!]
        $ageRange4: [Int!]!
      ) {
        users(
          input: $inputNonNullable
          ageRange1: $ageRange1
          ageRange2: $ageRange2
          ageRange3: $ageRange3
          ageRange4: $ageRange4
        ) {
          ageRange1
          ageRange2
          ageRange3
          ageRange4
        }
      }
    `);

    const result = mergeOutputs([
      await plugin(
        schema,
        [{ document }],
        {
          scalars: {
            DateTime: 'Date',
          },
        },
        { outputFile: '' }
      ),
    ]);

    expect(result).toMatchInlineSnapshot(`
      "type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
      /** UserRole Description */
      export type UserRole =
        /** UserRole ADMIN */
        | 'ADMIN'
        /** UserRole CUSTOMER */
        | 'CUSTOMER';

      /** UsersInput Description */
      type UsersInput = {
        /** UsersInput from */
        from?: Date | null | undefined;
        /** UsersInput to */
        to?: Date | null | undefined;
        timezone?: unknown | null | undefined;
        role?: UserRole | null | undefined;
        ageRange1?: Array<number | null | undefined> | null | undefined;
        ageRange2: Array<number | null | undefined>;
        ageRange3?: Array<number> | null | undefined;
        ageRange4: Array<number>;
        bestFriend?: UsersBestFriendInput | null | undefined;
        nestedInput?: UsersInput | null | undefined;
      };

      type UsersBestFriendInput = {
        name?: string | null | undefined;
      };

      export type UsersWithScalarInputQueryVariables = Exact<{
        inputNonNullable: UsersInput;
        inputNullable?: UsersInput | null;
        ageRange1?: Array<number | null> | number | null;
        ageRange2: Array<number | null> | number;
        ageRange3?: Array<number> | number | null;
        ageRange4: Array<number> | number;
      }>;


      export type UsersWithScalarInputQuery = { users: Array<{ ageRange1: Array<number | null> | null, ageRange2: Array<number | null>, ageRange3: Array<number> | null, ageRange4: Array<number> }> };
      "
    `);

    validateTs(result, undefined, undefined, undefined, undefined, true);
  });

  it('generates readonly input when immutableTypes:true', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type Query {
        users(input: UsersInput!): [User!]!
      }

      type User {
        id: ID!
        ageRange1: [Int]
        ageRange2: [Int]!
        ageRange3: [Int!]
        ageRange4: [Int!]!
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
        timezone: TimeZone
        role: UserRole
        ageRange1: [Int]
        ageRange2: [Int]!
        ageRange3: [Int!]
        ageRange4: [Int!]!
        bestFriend: UsersBestFriendInput
        nestedInput: UsersInput
      }

      input UsersBestFriendInput {
        name: String
      }

      scalar DateTime
      scalar TimeZone
    `);
    const document = parse(/* GraphQL */ `
      query UsersWithScalarInput($inputNonNullable: UsersInput!, $inputNullable: UsersInput) {
        users(input: $inputNonNullable) {
          ageRange1
          ageRange2
          ageRange3
          ageRange4
        }
      }
    `);

    const result = mergeOutputs([
      await plugin(
        schema,
        [{ document }],
        {
          scalars: {
            DateTime: 'Date',
          },
          immutableTypes: true,
        },
        { outputFile: '' }
      ),
    ]);

    expect(result).toMatchInlineSnapshot(`
      "type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
      /** UserRole Description */
      export type UserRole =
        /** UserRole ADMIN */
        | 'ADMIN'
        /** UserRole CUSTOMER */
        | 'CUSTOMER';

      /** UsersInput Description */
      type UsersInput = {
        /** UsersInput from */
        readonly from?: Date | null | undefined;
        /** UsersInput to */
        readonly to?: Date | null | undefined;
        readonly timezone?: unknown | null | undefined;
        readonly role?: UserRole | null | undefined;
        readonly ageRange1?: Array<number | null | undefined> | null | undefined;
        readonly ageRange2: Array<number | null | undefined>;
        readonly ageRange3?: Array<number> | null | undefined;
        readonly ageRange4: Array<number>;
        readonly bestFriend?: UsersBestFriendInput | null | undefined;
        readonly nestedInput?: UsersInput | null | undefined;
      };

      type UsersBestFriendInput = {
        readonly name?: string | null | undefined;
      };

      export type UsersWithScalarInputQueryVariables = Exact<{
        inputNonNullable: UsersInput;
        inputNullable?: UsersInput | null;
      }>;


      export type UsersWithScalarInputQuery = { readonly users: ReadonlyArray<{ readonly ageRange1: ReadonlyArray<number | null> | null, readonly ageRange2: ReadonlyArray<number | null>, readonly ageRange3: ReadonlyArray<number> | null, readonly ageRange4: ReadonlyArray<number> }> };
      "
    `);

    validateTs(result, undefined, undefined, undefined, undefined, true);
  });

  it('generates @oneOf input correctly', async () => {
    const schema = buildSchema(/* GraphQL */ `
      directive @oneOf on INPUT_OBJECT

      type Query {
        users(input: UsersInput!): [User!]!
      }

      type User {
        id: ID!
        ageRange1: [Int]
        ageRange2: [Int]!
        ageRange3: [Int!]
        ageRange4: [Int!]!
      }

      "UserRole Description"
      enum UserRole {
        "UserRole ADMIN"
        ADMIN
        "UserRole CUSTOMER"
        CUSTOMER
      }

      "UsersInput Description"
      input UsersInput @oneOf {
        "UsersInput from"
        from: DateTime
        "UsersInput to"
        to: DateTime
        timezone: TimeZone
        role: UserRole
        ageRange1: [Int]
        ageRange3: [Int!]
        bestFriend: UsersBestFriendInput
        nestedInput: UsersInput
      }

      input UsersBestFriendInput {
        name: String
      }

      scalar DateTime
      scalar TimeZone
    `);
    const document = parse(/* GraphQL */ `
      query Users($inputNonNullable: UsersInput!, $inputNullable: UsersInput) {
        users(input: $inputNonNullable) {
          __typename
        }
      }
    `);

    const result = mergeOutputs([
      await plugin(
        schema,
        [{ document }],
        {
          scalars: {
            DateTime: 'Date',
          },
        },
        { outputFile: '' }
      ),
    ]);

    expect(result).toMatchInlineSnapshot(`
      "type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
      /** UserRole Description */
      export type UserRole =
        /** UserRole ADMIN */
        | 'ADMIN'
        /** UserRole CUSTOMER */
        | 'CUSTOMER';

      /** UsersInput Description */
      type UsersInput =
        {   /** UsersInput from */
        from: Date; to?: never; timezone?: never; role?: never; ageRange1?: never; ageRange3?: never; bestFriend?: never; nestedInput?: never; }
        |  { from?: never;   /** UsersInput to */
        to: Date; timezone?: never; role?: never; ageRange1?: never; ageRange3?: never; bestFriend?: never; nestedInput?: never; }
        |  { from?: never; to?: never;   timezone: unknown; role?: never; ageRange1?: never; ageRange3?: never; bestFriend?: never; nestedInput?: never; }
        |  { from?: never; to?: never; timezone?: never;   role: UserRole; ageRange1?: never; ageRange3?: never; bestFriend?: never; nestedInput?: never; }
        |  { from?: never; to?: never; timezone?: never; role?: never;   ageRange1: Array<number | null | undefined>; ageRange3?: never; bestFriend?: never; nestedInput?: never; }
        |  { from?: never; to?: never; timezone?: never; role?: never; ageRange1?: never;   ageRange3: Array<number>; bestFriend?: never; nestedInput?: never; }
        |  { from?: never; to?: never; timezone?: never; role?: never; ageRange1?: never; ageRange3?: never;   bestFriend: UsersBestFriendInput; nestedInput?: never; }
        |  { from?: never; to?: never; timezone?: never; role?: never; ageRange1?: never; ageRange3?: never; bestFriend?: never;   nestedInput: UsersInput; };

      type UsersBestFriendInput = {
        name?: string | null | undefined;
      };

      export type UsersQueryVariables = Exact<{
        inputNonNullable: UsersInput;
        inputNullable?: UsersInput | null;
      }>;


      export type UsersQuery = { users: Array<{ __typename: 'User' }> };
      "
    `);

    validateTs(result, undefined, undefined, undefined, undefined, true);
  });

  it('generates with custom inputMaybeValue', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type Query {
        user(input: UserInput!): User
      }

      type User {
        id: ID!
      }

      input UserInput {
        dateRange1: [DateTime]
        dateRange2: [DateTime]!
        dateRange3: [DateTime!]
        dateRange4: [DateTime!]!
        bestFriend: UserBestFriendInput
        nestedInput: UserInput
      }

      input UserBestFriendInput {
        name: String
        bestFriendDateRange1: [DateTime]
        bestFriendDateRange2: [DateTime]!
        bestFriendDateRange3: [DateTime!]
        bestFriendDateRange4: [DateTime!]!
      }

      scalar DateTime
    `);
    const document = parse(/* GraphQL */ `
      query Users(
        $input: UserInput
        $dateTime1: DateTime
        $dateTime2: DateTime!
        $dateTimeArray1: [DateTime]
        $dateTimeArray2: [DateTime]!
        $dateTimeArray3: [DateTime!]
        $dateTimeArray4: [DateTime!]!
      ) {
        user {
          __typename
        }
      }
    `);

    const result = mergeOutputs([
      await plugin(
        schema,
        [{ document }],
        {
          inputMaybeValue: 'T | null',
          scalars: {
            DateTime: 'Date',
          },
        },
        { outputFile: '' }
      ),
    ]);

    expect(result).toMatchInlineSnapshot(`
      "type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
      type UserInput = {
        dateRange1?: Array<Date | null> | null;
        dateRange2: Array<Date | null>;
        dateRange3?: Array<Date> | null;
        dateRange4: Array<Date>;
        bestFriend?: UserBestFriendInput | null;
        nestedInput?: UserInput | null;
      };

      type UserBestFriendInput = {
        name?: string | null;
        bestFriendDateRange1?: Array<Date | null> | null;
        bestFriendDateRange2: Array<Date | null>;
        bestFriendDateRange3?: Array<Date> | null;
        bestFriendDateRange4: Array<Date>;
      };

      export type UsersQueryVariables = Exact<{
        input?: UserInput | null;
        dateTime1?: Date | null;
        dateTime2: Date;
        dateTimeArray1?: Array<Date | null> | Date | null;
        dateTimeArray2: Array<Date | null> | Date;
        dateTimeArray3?: Array<Date> | Date | null;
        dateTimeArray4: Array<Date> | Date;
      }>;


      export type UsersQuery = { user: { __typename: 'User' } | null };
      "
    `);

    validateTs(result, undefined, undefined, undefined, undefined, true);
  });
});
