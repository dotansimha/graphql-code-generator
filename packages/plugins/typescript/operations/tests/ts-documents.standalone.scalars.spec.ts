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
      export type UserInput = {
        nonNullableDate: unknown;
        nullableDate?: unknown;
        dateArray1?: Array<unknown> | null | undefined;
        dateArray2: Array<unknown>;
        dateArray3?: Array<unknown> | null | undefined;
        dateArray4: Array<unknown>;
      };

      export type UserQueryVariables = Exact<{
        nonNullableDate: unknown;
        nullableDate?: unknown;
        dateArray1?: Array<unknown> | unknown | null | undefined;
        dateArray2: Array<unknown> | unknown;
        dateArray3?: Array<unknown> | unknown | null | undefined;
        dateArray4: Array<unknown> | unknown;
        input: UserInput;
      }>;


      export type UserQuery = { user: { id: string, nonNullableDate: unknown, nullableDate: unknown } | null };
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
      export type UserInput = {
        nonNullableDate: any;
        nullableDate?: any;
        dateArray1?: Array<any> | null | undefined;
        dateArray2: Array<any>;
        dateArray3?: Array<any> | null | undefined;
        dateArray4: Array<any>;
      };

      export type UserQueryVariables = Exact<{
        nonNullableDate: any;
        nullableDate?: any;
        dateArray1?: Array<any> | any | null | undefined;
        dateArray2: Array<any> | any;
        dateArray3?: Array<any> | any | null | undefined;
        dateArray4: Array<any> | any;
        input: UserInput;
      }>;


      export type UserQuery = { user: { id: string, nonNullableDate: any, nullableDate: any } | null };
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
      export type UserInput = {
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

describe('TypeScript Operations Plugin - Custom Scalars', () => {
  it('imports external custom scalar correctly when used in Result SelectionSet', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type Query {
        user(id: ID!): User
      }

      type User {
        id: ID!
        scalar1: Scalar1
        scalar2: Scalar2
        scalar3: Scalar3
        scalar4: Scalar4
        scalar5: Scalar5
        scalar6: Scalar6
        scalar7: Scalar7
        unusedScalar: UnusedScalar
      }

      scalar Scalar1
      scalar Scalar2
      scalar Scalar3
      scalar Scalar4
      scalar Scalar5
      scalar Scalar6
      scalar Scalar7
      scalar UnusedScalar
    `);
    const document = parse(/* GraphQL */ `
      query User {
        user(id: "1") {
          id
          scalar1
          scalar2
          scalar3
          scalar4
          scalar5
          scalar6
          scalar7
        }
      }
    `);

    const result = mergeOutputs([
      await plugin(
        schema,
        [{ document }],
        {
          scalars: {
            Scalar1: '../../scalars#default',
            Scalar2: '../../scalars#MyScalar2',
            Scalar3: '../../scalars#MyScalar3 as AliasedScalar3',
            Scalar4: '@org/scalars#default',
            Scalar5: '@org/scalars#MyScalar5',
            Scalar6: '@org/scalars#MyScalar6 as AliasedScalar6',
            Scalar7: {
              input: '@org/input-output#Scalar7Input',
              output: '@org/input-output#Scalar7Output',
            },
            UnusedScalar: 'scalars#UnusedScalar',
          },
        },
        { outputFile: '' }
      ),
    ]);

    expect(result).toMatchInlineSnapshot(`
      "import Scalar1 from '../../scalars';
      import { MyScalar2, MyScalar3 as AliasedScalar3 } from '../../scalars';
      import Scalar4 from '@org/scalars';
      import { MyScalar5, MyScalar6 as AliasedScalar6 } from '@org/scalars';
      import { Scalar7Output } from '@org/input-output';
      type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
      export type UserQueryVariables = Exact<{ [key: string]: never; }>;


      export type UserQuery = { user: { id: string, scalar1: Scalar1 | null, scalar2: MyScalar2 | null, scalar3: AliasedScalar3 | null, scalar4: Scalar4 | null, scalar5: MyScalar5 | null, scalar6: AliasedScalar6 | null, scalar7: Scalar7Output | null } | null };
      "
    `);

    validateTs(result, undefined, undefined, undefined, undefined, true);
  });

  it('imports external custom scalar correctly when used in Input and Variables', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type Query {
        user(input: UserInput): User
      }

      type User {
        id: ID!
      }

      input UserInput {
        scalar1: Scalar1
        scalar2: Scalar2
        scalar3: Scalar3
      }

      scalar Scalar1
      scalar Scalar2
      scalar Scalar3
      scalar Scalar4
      scalar Scalar5
      scalar Scalar6
      scalar Scalar7
      scalar UnusedScalar
    `);
    const document = parse(/* GraphQL */ `
      query User($userInput: UserInput, $scalar4: Scalar4, $scalar5: Scalar5, $scalar6: Scalar6, $scalar7: Scalar7) {
        user {
          id
        }
      }
    `);

    const result = mergeOutputs([
      await plugin(
        schema,
        [{ document }],
        {
          scalars: {
            Scalar1: '../../scalars#default',
            Scalar2: '../../scalars#MyScalar2',
            Scalar3: '../../scalars#MyScalar3 as AliasedScalar3',
            Scalar4: '@org/scalars#default',
            Scalar5: '@org/scalars#MyScalar5',
            Scalar6: '@org/scalars#MyScalar6 as AliasedScalar6',
            Scalar7: {
              input: '@org/input-output#Scalar7Input',
              output: '@org/input-output#Scalar7Output',
            },
            UnusedScalar: 'scalars#UnusedScalar',
          },
        },
        { outputFile: '' }
      ),
    ]);

    expect(result).toMatchInlineSnapshot(`
      "import Scalar1 from '../../scalars';
      import { MyScalar2, MyScalar3 as AliasedScalar3 } from '../../scalars';
      import Scalar4 from '@org/scalars';
      import { MyScalar5, MyScalar6 as AliasedScalar6 } from '@org/scalars';
      import { Scalar7Input } from '@org/input-output';
      type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
      export type UserInput = {
        scalar1?: Scalar1 | null | undefined;
        scalar2?: MyScalar2 | null | undefined;
        scalar3?: AliasedScalar3 | null | undefined;
      };

      export type UserQueryVariables = Exact<{
        userInput?: UserInput | null | undefined;
        scalar4?: Scalar4 | null | undefined;
        scalar5?: MyScalar5 | null | undefined;
        scalar6?: AliasedScalar6 | null | undefined;
        scalar7?: Scalar7Input | null | undefined;
      }>;


      export type UserQuery = { user: { id: string } | null };
      "
    `);

    validateTs(result, undefined, undefined, undefined, undefined, true);
  });

  it('imports multiple default imports and named imports correctly by default', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type Query {
        user(id: ID!): User
      }

      type User {
        id: ID!
        scalar11: Scalar11
      }

      scalar Scalar1
      scalar Scalar2
      scalar Scalar3
      scalar Scalar4
      scalar Scalar5
      scalar Scalar6
      scalar Scalar7
      scalar Scalar8
      scalar Scalar9
      scalar Scalar10
      scalar Scalar11
      scalar Scalar12
      scalar UnusedScalar
    `);
    const document = parse(/* GraphQL */ `
      query User(
        # relative imports
        $scalar1: Scalar1
        $scalar1a: Scalar1 # Should only import once
        $scalar2: Scalar2
        $scalar3: Scalar3
        $scalar3a: Scalar3 # Should only import once
        $scalar4: Scalar4
        # module imports
        $scalar5: Scalar5
        $scalar6: Scalar6
        $scalar7: Scalar7
        $scalar8: Scalar8
        $scalar9: Scalar9
        $scalar10: Scalar10
        # mix of input/output
        $scalar11: Scalar11
        $scalar12: Scalar12
      ) {
        user {
          id
          scalar11
        }
      }
    `);

    const result = mergeOutputs([
      await plugin(
        schema,
        [{ document }],
        {
          scalars: {
            Scalar1: '../../scalars#default',
            Scalar2: '../../scalars#default as DefaultScalar2',
            Scalar3: '../../scalars#default as DefaultScalar3',
            Scalar4: '../../scalars#Scalar4',
            Scalar5: '../../scalars#Scalar5 as MyScalar5',
            Scalar6: '@org/scalars#default',
            Scalar7: '@org/scalars#default as DefaultScalar7',
            Scalar8: '@org/scalars#default as DefaultScalar8',
            Scalar9: '@org/scalars#Scalar9',
            Scalar10: '@org/scalars#Scalar10 as MyScalar10',
            Scalar11: {
              input: '@org/input-output#Scalar11 as Scalar11Input',
              output: '@org/input-output#Scalar11 as Scalar11Output',
            },
            Scalar12: {
              input: '@org/input-output#Scalar12',
              output: '@org/input-output#Scalar12',
            },
            UnusedScalar: 'scalars#UnusedScalar',
          },
        },
        { outputFile: '' }
      ),
    ]);

    expect(result).toMatchInlineSnapshot(`
      "import Scalar1 from '../../scalars';
      import DefaultScalar2 from '../../scalars';
      import DefaultScalar3 from '../../scalars';
      import { Scalar4, Scalar5 as MyScalar5 } from '../../scalars';
      import Scalar6 from '@org/scalars';
      import DefaultScalar7 from '@org/scalars';
      import DefaultScalar8 from '@org/scalars';
      import { Scalar9, Scalar10 as MyScalar10 } from '@org/scalars';
      import { Scalar11 as Scalar11Input, Scalar11 as Scalar11Output, Scalar12 } from '@org/input-output';
      type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
      export type UserQueryVariables = Exact<{
        scalar1?: Scalar1 | null | undefined;
        scalar1a?: Scalar1 | null | undefined;
        scalar2?: DefaultScalar2 | null | undefined;
        scalar3?: DefaultScalar3 | null | undefined;
        scalar3a?: DefaultScalar3 | null | undefined;
        scalar4?: Scalar4 | null | undefined;
        scalar5?: MyScalar5 | null | undefined;
        scalar6?: Scalar6 | null | undefined;
        scalar7?: DefaultScalar7 | null | undefined;
        scalar8?: DefaultScalar8 | null | undefined;
        scalar9?: Scalar9 | null | undefined;
        scalar10?: MyScalar10 | null | undefined;
        scalar11?: Scalar11Input | null | undefined;
        scalar12?: Scalar12 | null | undefined;
      }>;


      export type UserQuery = { user: { id: string, scalar11: Scalar11Output | null } | null };
      "
    `);

    validateTs(result, undefined, undefined, undefined, undefined, true);
  });

  it('imports multiple default imports and named imports correctly with useTypeImports:true', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type Query {
        user(id: ID!): User
      }

      type User {
        id: ID!
        scalar11: Scalar11
      }

      scalar Scalar1
      scalar Scalar2
      scalar Scalar3
      scalar Scalar4
      scalar Scalar5
      scalar Scalar6
      scalar Scalar7
      scalar Scalar8
      scalar Scalar9
      scalar Scalar10
      scalar Scalar11
      scalar Scalar12
      scalar UnusedScalar
    `);
    const document = parse(/* GraphQL */ `
      query User(
        # relative imports
        $scalar1: Scalar1
        $scalar1a: Scalar1 # Should only import once
        $scalar2: Scalar2
        $scalar3: Scalar3
        $scalar3a: Scalar3 # Should only import once
        $scalar4: Scalar4
        # module imports
        $scalar5: Scalar5
        $scalar6: Scalar6
        $scalar7: Scalar7
        $scalar8: Scalar8
        $scalar9: Scalar9
        $scalar10: Scalar10
        # mix of input/output
        $scalar11: Scalar11
        $scalar12: Scalar12
      ) {
        user {
          id
          scalar11
        }
      }
    `);

    const result = mergeOutputs([
      await plugin(
        schema,
        [{ document }],
        {
          useTypeImports: true,
          scalars: {
            Scalar1: '../../scalars#default',
            Scalar2: '../../scalars#default as DefaultScalar2',
            Scalar3: '../../scalars#default as DefaultScalar3',
            Scalar4: '../../scalars#Scalar4',
            Scalar5: '../../scalars#Scalar5 as MyScalar5',
            Scalar6: '@org/scalars#default',
            Scalar7: '@org/scalars#default as DefaultScalar7',
            Scalar8: '@org/scalars#default as DefaultScalar8',
            Scalar9: '@org/scalars#Scalar9',
            Scalar10: '@org/scalars#Scalar10 as MyScalar10',
            Scalar11: {
              input: '@org/input-output#Scalar11 as Scalar11Input',
              output: '@org/input-output#Scalar11 as Scalar11Output',
            },
            Scalar12: {
              input: '@org/input-output#Scalar12',
              output: '@org/input-output#Scalar12',
            },
            UnusedScalar: 'scalars#UnusedScalar',
          },
        },
        { outputFile: '' }
      ),
    ]);

    expect(result).toMatchInlineSnapshot(`
      "import type { default as Scalar1 } from '../../scalars';
      import type { default as DefaultScalar2 } from '../../scalars';
      import type { default as DefaultScalar3 } from '../../scalars';
      import type { Scalar4, Scalar5 as MyScalar5 } from '../../scalars';
      import type { default as Scalar6 } from '@org/scalars';
      import type { default as DefaultScalar7 } from '@org/scalars';
      import type { default as DefaultScalar8 } from '@org/scalars';
      import type { Scalar9, Scalar10 as MyScalar10 } from '@org/scalars';
      import type { Scalar11 as Scalar11Input, Scalar11 as Scalar11Output, Scalar12 } from '@org/input-output';
      type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
      export type UserQueryVariables = Exact<{
        scalar1?: Scalar1 | null | undefined;
        scalar1a?: Scalar1 | null | undefined;
        scalar2?: DefaultScalar2 | null | undefined;
        scalar3?: DefaultScalar3 | null | undefined;
        scalar3a?: DefaultScalar3 | null | undefined;
        scalar4?: Scalar4 | null | undefined;
        scalar5?: MyScalar5 | null | undefined;
        scalar6?: Scalar6 | null | undefined;
        scalar7?: DefaultScalar7 | null | undefined;
        scalar8?: DefaultScalar8 | null | undefined;
        scalar9?: Scalar9 | null | undefined;
        scalar10?: MyScalar10 | null | undefined;
        scalar11?: Scalar11Input | null | undefined;
        scalar12?: Scalar12 | null | undefined;
      }>;


      export type UserQuery = { user: { id: string, scalar11: Scalar11Output | null } | null };
      "
    `);

    validateTs(result, undefined, undefined, undefined, undefined, true);
  });
});
