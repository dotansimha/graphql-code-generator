import { mergeOutputs } from '@graphql-codegen/plugin-helpers';
import { validateTs } from '@graphql-codegen/testing';
import { buildSchema, parse } from 'graphql';
import { plugin } from '../src/index.js';

describe('TypeScript Operations Plugin - Default Scalar types', () => {
  it('generates `unknown` as the default custom defaultScalarType', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type Query {
        user(
          id: ID!
          nonNullableDate: DateTime!
          nullableDate: DateTime
          dateArray1: [DateTime]
          dateArray2: [DateTime]!
          dateArray3: [DateTime!]
          dateArray4: [DateTime!]!
          input: UserInput!
        ): User
      }

      input UserInput {
        nonNullableDate: DateTime!
        nullableDate: DateTime
        dateArray1: [DateTime]
        dateArray2: [DateTime]!
        dateArray3: [DateTime!]
        dateArray4: [DateTime!]!
      }

      type User {
        id: ID!
        nonNullableDate: DateTime!
        nullableDate: DateTime
      }

      scalar DateTime
    `);
    const document = parse(/* GraphQL */ `
      query User(
        $nonNullableDate: DateTime!
        $nullableDate: DateTime
        $dateArray1: [DateTime]
        $dateArray2: [DateTime]!
        $dateArray3: [DateTime!]
        $dateArray4: [DateTime!]!
        $input: UserInput!
      ) {
        user(
          id: "1"
          nonNullableDate: $nonNullableDate
          nullableDate: $nullableDate
          dateArray1: $dateArray1
          dateArray2: $dateArray2
          dateArray3: $dateArray3
          dateArray4: $dateArray4
          input: $input
        ) {
          id
          nonNullableDate
          nullableDate
        }
      }
    `);

    const result = mergeOutputs([await plugin(schema, [{ document }], {}, { outputFile: '' })]);

    expect(result).toMatchInlineSnapshot(`
      "type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
      type UserInput = {
        nonNullableDate: unknown;
        nullableDate?: unknown | null | undefined;
        dateArray1?: Array<unknown | null | undefined> | null | undefined;
        dateArray2: Array<unknown | null | undefined>;
        dateArray3?: Array<unknown> | null | undefined;
        dateArray4: Array<unknown>;
      };

      export type UserQueryVariables = Exact<{
        nonNullableDate: unknown;
        nullableDate?: unknown | null | undefined;
        dateArray1?: Array<unknown | null | undefined> | unknown | null | undefined;
        dateArray2: Array<unknown | null | undefined> | unknown;
        dateArray3?: Array<unknown> | unknown | null | undefined;
        dateArray4: Array<unknown> | unknown;
        input: UserInput;
      }>;


      export type UserQuery = { user: { id: string, nonNullableDate: unknown, nullableDate: unknown | null } | null };
      "
    `);

    validateTs(result, undefined, undefined, undefined, undefined, true);
  });

  it("generates `any` when defaultScalarType:'any'", async () => {
    const schema = buildSchema(/* GraphQL */ `
      type Query {
        user(
          id: ID!
          nonNullableDate: DateTime!
          nullableDate: DateTime
          dateArray1: [DateTime]
          dateArray2: [DateTime]!
          dateArray3: [DateTime!]
          dateArray4: [DateTime!]!
          input: UserInput!
        ): User
      }

      input UserInput {
        nonNullableDate: DateTime!
        nullableDate: DateTime
        dateArray1: [DateTime]
        dateArray2: [DateTime]!
        dateArray3: [DateTime!]
        dateArray4: [DateTime!]!
      }

      type User {
        id: ID!
        nonNullableDate: DateTime!
        nullableDate: DateTime
      }

      scalar DateTime
    `);
    const document = parse(/* GraphQL */ `
      query User(
        $nonNullableDate: DateTime!
        $nullableDate: DateTime
        $dateArray1: [DateTime]
        $dateArray2: [DateTime]!
        $dateArray3: [DateTime!]
        $dateArray4: [DateTime!]!
        $input: UserInput!
      ) {
        user(
          id: "1"
          nonNullableDate: $nonNullableDate
          nullableDate: $nullableDate
          dateArray1: $dateArray1
          dateArray2: $dateArray2
          dateArray3: $dateArray3
          dateArray4: $dateArray4
          input: $input
        ) {
          id
          nonNullableDate
          nullableDate
        }
      }
    `);

    const result = mergeOutputs([
      await plugin(schema, [{ document }], { defaultScalarType: 'any' }, { outputFile: '' }),
    ]);

    expect(result).toMatchInlineSnapshot(`
      "type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
      type UserInput = {
        nonNullableDate: any;
        nullableDate?: any | null | undefined;
        dateArray1?: Array<any | null | undefined> | null | undefined;
        dateArray2: Array<any | null | undefined>;
        dateArray3?: Array<any> | null | undefined;
        dateArray4: Array<any>;
      };

      export type UserQueryVariables = Exact<{
        nonNullableDate: any;
        nullableDate?: any | null | undefined;
        dateArray1?: Array<any | null | undefined> | any | null | undefined;
        dateArray2: Array<any | null | undefined> | any;
        dateArray3?: Array<any> | any | null | undefined;
        dateArray4: Array<any> | any;
        input: UserInput;
      }>;


      export type UserQuery = { user: { id: string, nonNullableDate: any, nullableDate: any | null } | null };
      "
    `);

    validateTs(result, undefined, undefined, undefined, undefined, true);
  });

  it('generates correct types when defaultScalarType is set to said types', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type Query {
        user(
          id: ID!
          nonNullableDate: DateTime!
          nullableDate: DateTime
          dateArray1: [DateTime]
          dateArray2: [DateTime]!
          dateArray3: [DateTime!]
          dateArray4: [DateTime!]!
          input: UserInput!
        ): User
      }

      input UserInput {
        nonNullableDate: DateTime!
        nullableDate: DateTime
        dateArray1: [DateTime]
        dateArray2: [DateTime]!
        dateArray3: [DateTime!]
        dateArray4: [DateTime!]!
      }

      type User {
        id: ID!
        nonNullableDate: DateTime!
        nullableDate: DateTime
      }

      scalar DateTime
    `);
    const document = parse(/* GraphQL */ `
      query User(
        $nonNullableDate: DateTime!
        $nullableDate: DateTime
        $dateArray1: [DateTime]
        $dateArray2: [DateTime]!
        $dateArray3: [DateTime!]
        $dateArray4: [DateTime!]!
        $input: UserInput!
      ) {
        user(
          id: "1"
          nonNullableDate: $nonNullableDate
          nullableDate: $nullableDate
          dateArray1: $dateArray1
          dateArray2: $dateArray2
          dateArray3: $dateArray3
          dateArray4: $dateArray4
          input: $input
        ) {
          id
          nonNullableDate
          nullableDate
        }
      }
    `);

    const result = mergeOutputs([
      await plugin(schema, [{ document }], { defaultScalarType: 'Date' }, { outputFile: '' }),
    ]);

    expect(result).toMatchInlineSnapshot(`
      "type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
      type UserInput = {
        nonNullableDate: Date;
        nullableDate?: Date | null | undefined;
        dateArray1?: Array<Date | null | undefined> | null | undefined;
        dateArray2: Array<Date | null | undefined>;
        dateArray3?: Array<Date> | null | undefined;
        dateArray4: Array<Date>;
      };

      export type UserQueryVariables = Exact<{
        nonNullableDate: Date;
        nullableDate?: Date | null | undefined;
        dateArray1?: Array<Date | null | undefined> | Date | null | undefined;
        dateArray2: Array<Date | null | undefined> | Date;
        dateArray3?: Array<Date> | Date | null | undefined;
        dateArray4: Array<Date> | Date;
        input: UserInput;
      }>;


      export type UserQuery = { user: { id: string, nonNullableDate: Date, nullableDate: Date | null } | null };
      "
    `);

    validateTs(result, undefined, undefined, undefined, undefined, true);
  });
});
