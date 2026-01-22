import { mergeOutputs } from '@graphql-codegen/plugin-helpers';
import { validateTs } from '@graphql-codegen/testing';
import { buildSchema, parse } from 'graphql';
import { plugin } from '../src/index.js';

describe('TypeScript Operations Plugin - config.avoidOptionals', () => {
  it('generates optional for nullable Variables and Input by default', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type Query {
        user(input: UserInput): User
      }

      input UserInput {
        id: ID!
        legacyId: ID
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

      scalar DateTime
    `);
    const document = parse(/* GraphQL */ `
      query User($testNullable: ID, $testNonNullable: ID!, $inputNullable: UserInput, $inputNonNullable: UserInput!) {
        user(input: $input) {
          id
          name
          nickname
        }
      }
    `);

    const result = mergeOutputs([await plugin(schema, [{ document }], {}, { outputFile: '' })]);

    expect(result).toMatchInlineSnapshot(`
      "type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
      export type UserInput = {
        id: string | number;
        legacyId?: string | number | null | undefined;
      };

      export type UserQueryVariables = Exact<{
        testNullable?: string | null | undefined;
        testNonNullable: string;
        inputNullable?: UserInput | null | undefined;
        inputNonNullable: UserInput;
      }>;


      export type UserQuery = { user: { id: string, name: string, nickname: string | null } | null };
      "
    `);

    validateTs(result, undefined, undefined, undefined, undefined, true);
  });

  it('generates non-optional Variables and Input when `avoidOptionals:true`', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type Query {
        user(input: UserInput): User
      }

      input UserInput {
        id: ID!
        legacyId: ID
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

      scalar DateTime
    `);
    const document = parse(/* GraphQL */ `
      query User($testNullable: ID, $testNonNullable: ID!, $inputNullable: UserInput, $inputNonNullable: UserInput!) {
        user(input: $input) {
          id
          name
          nickname
        }
      }
    `);

    const result = mergeOutputs([await plugin(schema, [{ document }], { avoidOptionals: true }, { outputFile: '' })]);

    expect(result).toMatchInlineSnapshot(`
      "type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
      export type UserInput = {
        id: string | number;
        legacyId: string | number | null | undefined;
      };

      export type UserQueryVariables = Exact<{
        testNullable: string | null | undefined;
        testNonNullable: string;
        inputNullable: UserInput | null | undefined;
        inputNonNullable: UserInput;
      }>;


      export type UserQuery = { user: { id: string, name: string, nickname: string | null } | null };
      "
    `);

    validateTs(result, undefined, undefined, undefined, undefined, true);
  });

  it('generates non-optional Input when `avoidOptionals.inputValue:true`', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type Query {
        user(input: UserInput): User
      }

      input UserInput {
        id: ID!
        legacyId: ID
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

      scalar DateTime
    `);
    const document = parse(/* GraphQL */ `
      query User($test: ID, $input: UserInput) {
        user {
          id
          name
          nickname
        }
      }
    `);

    const result = mergeOutputs([
      await plugin(
        schema,
        [{ document }],
        {
          avoidOptionals: {
            inputValue: true,
          },
        },
        { outputFile: '' }
      ),
    ]);

    expect(result).toMatchInlineSnapshot(`
      "type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
      export type UserInput = {
        id: string | number;
        legacyId: string | number | null | undefined;
      };

      export type UserQueryVariables = Exact<{
        test?: string | null | undefined;
        input?: UserInput | null | undefined;
      }>;


      export type UserQuery = { user: { id: string, name: string, nickname: string | null } | null };
      "
    `);

    validateTs(result, undefined, undefined, undefined, undefined, true);
  });

  it('generates non-optional Variable when `avoidOptionals.variableValue:true`', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type Query {
        user(input: UserInput): User
      }

      input UserInput {
        id: ID!
        legacyId: ID
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

      scalar DateTime
    `);
    const document = parse(/* GraphQL */ `
      query User($test: ID, $input: UserInput) {
        user {
          id
          name
          nickname
        }
      }
    `);

    const result = mergeOutputs([
      await plugin(
        schema,
        [{ document }],
        {
          avoidOptionals: {
            variableValue: true,
          },
        },
        { outputFile: '' }
      ),
    ]);

    expect(result).toMatchInlineSnapshot(`
      "type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
      export type UserInput = {
        id: string | number;
        legacyId?: string | number | null | undefined;
      };

      export type UserQueryVariables = Exact<{
        test: string | null | undefined;
        input: UserInput | null | undefined;
      }>;


      export type UserQuery = { user: { id: string, name: string, nickname: string | null } | null };
      "
    `);

    validateTs(result, undefined, undefined, undefined, undefined, true);
  });

  it('generates optional Variable if there is a default value when `avoidOptionals.variableValue:true` and `avoidOptionals.defaultValue:false`', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type Query {
        user(input: UserInput): User
      }

      input UserInput {
        id: ID!
        legacyId: ID
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

      scalar DateTime
    `);
    const document = parse(/* GraphQL */ `
      query User(
        $test: ID # This does not have a default, so it will be non-optional (given the config)
        $testWithDefault: ID = "100" # This has a default, so it will be optional (given the config)
        $input: UserInput # This does not have a default, so it will be non-optional (given the config)
        $inputWithDefault: UserInput = { id: "200" } # This has a default, so it will be optional (given the config)
      ) {
        user {
          id
          name
          nickname
        }
      }
    `);

    const result = mergeOutputs([
      await plugin(
        schema,
        [{ document }],
        {
          avoidOptionals: {
            variableValue: true,
            defaultValue: false,
          },
        },
        { outputFile: '' }
      ),
    ]);

    expect(result).toMatchInlineSnapshot(`
      "type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
      export type UserInput = {
        id: string | number;
        legacyId?: string | number | null | undefined;
      };

      export type UserQueryVariables = Exact<{
        test: string | null | undefined;
        testWithDefault?: string | null | undefined;
        input: UserInput | null | undefined;
        inputWithDefault?: UserInput | null | undefined;
      }>;


      export type UserQuery = { user: { id: string, name: string, nickname: string | null } | null };
      "
    `);

    validateTs(result, undefined, undefined, undefined, undefined, true);
  });
});
