import { validateTs } from '@graphql-codegen/testing';
import { Types, mergeOutputs } from '@graphql-codegen/plugin-helpers';
import { buildSchema, parse, GraphQLSchema, GraphQLObjectType, GraphQLEnumType } from 'graphql';
import { plugin } from '../src/index';

describe('TypeScript', () => {
  it('should expose Maybe', async () => {
    const schema = buildSchema(/* GraphQL */ `
      scalar A
    `);
    const result = (await plugin(schema, [], {}, { outputFile: '' })) as Types.ComplexPluginOutput;
    expect(result.prepend).toBeSimilarStringTo('export type Maybe<T> =');
  });

  describe('description to comment', () => {
    it('Should include a description for Scalars type', async () => {
      const schema = buildSchema(/* GraphQL */ `
        "My custom scalar"
        scalar A
      `);
      const result = (await plugin(schema, [], {}, { outputFile: '' })) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
      /** All built-in and custom scalars, mapped to their actual values */
      export type Scalars = {
          ID: string;
          String: string;
          Boolean: boolean;
          Int: number;
          Float: number;
          /** My custom scalar */
          A: any;
        };
      `);
    });

    it('Should add description for input types', async () => {
      const schema = buildSchema(/* GraphQL */ `
        "MyInput"
        input MyInput {
          f: String
        }
      `);
      const result = (await plugin(schema, [], {}, { outputFile: '' })) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
        /** MyInput */
        export type MyInput`);
    });

    it('Should add description for input fields', async () => {
      const schema = buildSchema(/* GraphQL */ `
        "MyInput"
        input MyInput {
          "f is something"
          f: String!
        }
      `);
      const result = (await plugin(schema, [], {}, { outputFile: '' })) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
        /** MyInput */
        export type MyInput = {
          /** f is something */
          f: Scalars['String'];
        }`);
    });

    it('Should work with multiline comment', async () => {
      const schema = buildSchema(/* GraphQL */ `
        """
        MyInput
        multiline
        """
        input MyInput {
          f: String!
        }
      `);
      const result = (await plugin(schema, [], {}, { outputFile: '' })) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
        /** 
         * MyInput
         * multiline
         */
        export type MyInput`);
    });

    it('Should work with unions', async () => {
      const schema = buildSchema(/* GraphQL */ `
        "my union"
        union A = B | C

        type B {
          id: ID
        }
        type C {
          id: ID
        }
      `);
      const result = (await plugin(schema, [], {}, { outputFile: '' })) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
        /** my union */
        export type A = `);
    });

    it('Should work with types', async () => {
      const schema = buildSchema(/* GraphQL */ `
        "this is b"
        type B {
          id: ID
        }
        "this is c"
        type C {
          id: ID
        }
      `);
      const result = (await plugin(schema, [], {}, { outputFile: '' })) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
        /** this is b */
        export type B = `);

      expect(result.content).toBeSimilarStringTo(`
        /** this is c */
        export type C = `);
    });

    it('Should work with type fields', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type B {
          "the id"
          id: ID
        }
      `);
      const result = (await plugin(schema, [], {}, { outputFile: '' })) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
      export type B = {
        __typename?: 'B';
        /** the id */
        id?: Maybe<Scalars['ID']>;
      };`);
    });

    it('Should work with inteface and inteface fields', async () => {
      const schema = buildSchema(/* GraphQL */ `
        interface Node {
          "the id"
          id: ID!
        }
      `);
      const result = (await plugin(schema, [], {}, { outputFile: '' })) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
      export type Node = {
        /** the id */
        id: Scalars['ID'];
      };`);
    });

    it('Should work with enum and enum values', async () => {
      const schema = buildSchema(/* GraphQL */ `
        "custom enum"
        enum MyEnum {
          "this is a"
          A
          "this is b"
          B
        }
      `);
      const result = (await plugin(schema, [], {}, { outputFile: '' })) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
      /** custom enum */
      export enum MyEnum {
        /** this is a */
        A = 'A',
        /** this is b */
        B = 'B'
      }`);
    });

    it('Should removed underscore from enum values', async () => {
      const schema = buildSchema(/* GraphQL */ `
        enum MyEnum {
          A_B_C
          X_Y_Z
          _TEST
          My_Value
        }
      `);
      const result = (await plugin(schema, [], {}, { outputFile: '' })) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
      export enum MyEnum {
        ABC = 'A_B_C',
        XYZ = 'X_Y_Z',
        Test = '_TEST',
        MyValue = 'My_Value'
      }`);
    });

    it('Should work with enum and enum values (enumsAsTypes)', async () => {
      const schema = buildSchema(/* GraphQL */ `
        "custom enum"
        enum MyEnum {
          "this is a"
          A
          "this is b"
          B
        }
      `);
      const result = (await plugin(schema, [], { enumsAsTypes: true }, { outputFile: '' })) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
      /** custom enum */
      export type MyEnum =
        /** this is a */
        'A' |
        /** this is b */
        'B';`);
    });
  });

  describe('Issues', () => {
    it('#3137 - numeric enum value', async () => {
      const testSchema = buildSchema(/* GraphQL */ `
        type Query {
          test: Test!
        }

        enum Test {
          A
          B
          C
        }
      `);

      const result = (await plugin(
        testSchema,
        [],
        {
          enumValues: {
            Test: {
              A: 0,
              B: 'test',
              C: '2',
            },
          },
        },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;
      const output = mergeOutputs([result]);
      expect(output).toBeSimilarStringTo(`export enum Test {
        A = 0,
        B = 'test',
        C = 2
      }`);
    });

    it('#2679 - incorrect prefix for enums', async () => {
      const testSchema = buildSchema(/* GraphQL */ `
        enum FilterOption {
          New
          Active
          Closed
        }

        input UpdateFilterOptionInput {
          newOption: FilterOption!
        }

        type Query {
          exampleQuery(i: UpdateFilterOptionInput, t: FilterOption): String
        }
      `);

      const result = (await plugin(
        testSchema,
        [],
        {
          typesPrefix: 'I',
          enumPrefix: false,
        },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;
      const output = mergeOutputs([result]);
      validateTs(output);

      expect(output).toBeSimilarStringTo(`
      export enum FilterOption {
        New = 'New',
        Active = 'Active',
        Closed = 'Closed'
      }`);

      expect(output).toBeSimilarStringTo(`
      export type IUpdateFilterOptionInput = {
        newOption: FilterOption;
      };`);
      expect(output).toBeSimilarStringTo(`   
      export type IQueryExampleQueryArgs = {
        i?: Maybe<IUpdateFilterOptionInput>;
        t?: Maybe<FilterOption>;
      };`);
    });

    it('#3180 - enumValues and named default import', async () => {
      const testSchema = buildSchema(/* GraphQL */ `
        enum MyEnum {
          A
          B
          C
        }

        type Test {
          t: MyEnum
          test(a: MyEnum): String
        }
      `);
      const result = (await plugin(
        testSchema,
        [],
        {
          typesPrefix: 'I',
          namingConvention: { enumValues: 'constant-case#constantCase' },
          enumValues: {
            MyEnum: './files#default as MyEnum',
          },
        },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;

      expect(result.prepend[0]).toBe(`import MyEnum from './files';`);
    });

    it('#2976 - Issues with mapped enumValues and type prefix in args', async () => {
      const testSchema = buildSchema(/* GraphQL */ `
        enum MyEnum {
          A
          B
          C
        }

        type Test {
          t: MyEnum
          test(a: MyEnum): String
        }
      `);
      const result = (await plugin(
        testSchema,
        [],
        {
          typesPrefix: 'I',
          namingConvention: { enumValues: 'constant-case#constantCase' },
          enumValues: {
            MyEnum: './files#MyEnum',
          },
        },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`export type ITest = {
        __typename?: 'Test';
       t?: Maybe<MyEnum>;
       test?: Maybe<Scalars['String']>;
     };`);

      expect(result.content).toBeSimilarStringTo(`export type ITestTestArgs = {
      a?: Maybe<MyEnum>;
    };`);
    });

    it('#2082 - Issues with enumValues and types prefix', async () => {
      const testSchema = buildSchema(/* GraphQL */ `
        enum MyEnum {
          A
          B
          C
        }

        enum OtherEnum {
          V
        }

        type Test {
          a: MyEnum
          b: OtherEnum
        }
      `);
      const result = (await plugin(
        testSchema,
        [],
        {
          typesPrefix: 'GQL_',
          enumValues: {
            MyEnum: './files#MyEnum',
          },
        },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;
      expect(result.prepend).toContain(`import { MyEnum } from './files';`);
      expect(result.content).toContain(`enum GQL_OtherEnum {`);
      expect(result.content).toContain(`a?: Maybe<MyEnum>;`);
      expect(result.content).toContain(`b?: Maybe<GQL_OtherEnum>`);
    });

    it('#1488 - Should generate readonly also in input types when immutableTypes is set', async () => {
      const schema = buildSchema(`
      input MyInput {
        f: String!
      }`);

      const result = (await plugin(schema, [], { immutableTypes: true }, { outputFile: '' })) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
      export type MyInput = {
        readonly f: Scalars['String'];
      };`);
      validateTs(result);
    });

    it('#1462 - Union of scalars and argument of directive', async () => {
      const schema = buildSchema(`
      union Any = String | Int | Float | ID

      directive @default(
        value: Any,
      ) on ENUM_VALUE | FIELD_DEFINITION

      type CardEdge {
        count: Int! @default(value: 1)
      }`);

      const result = (await plugin(schema, [], {}, { outputFile: '' })) as Types.ComplexPluginOutput;
      expect(result.content).toBeSimilarStringTo(`export type Any = Scalars['String'] | Scalars['Int'] | Scalars['Float'] | Scalars['ID'];`);
      expect(result.content).toBeSimilarStringTo(`
      export type CardEdge = {
        __typename?: 'CardEdge';
        count: Scalars['Int'];
      };`);
      validateTs(result);
    });

    it('#1954 - Duplicate type names for args type', async () => {
      const schema = buildSchema(`
      type PullRequest {
        reviewThreads(first: Int!): Int
      }
      
      type PullRequestReview {
          threads(first: Int!, last: Int!): Int
      }`);

      const result = (await plugin(schema, [], { addUnderscoreToArgsType: true }, { outputFile: '' })) as Types.ComplexPluginOutput;

      expect(result.content).toContain('PullRequest_ReviewThreadsArgs');
      expect(result.content).toContain('PullRequestReview_ThreadsArgs');
    });
    it('#1980 Do not put prefix on enums in args when enumPrefix: false', async () => {
      const schema = buildSchema(/* GraphQL */ `
        enum SuggestionType {
          concern
          goal
        }

        type Suggestion {
          id: ID!
          userId: ID!
          suggestionType: SuggestionType!
          text: String!
        }

        type RootQueryType {
          suggestionsForUser(userId: ID!, suggestionType: SuggestionType!): [Suggestion!]
        }
      `);
      const result = (await plugin(schema, [], {
        skipTypename: true,
        declarationKind: 'interface',
        typesPrefix: 'I',
        enumPrefix: false,
        constEnums: true,
        scalars: {
          DateTime: 'string',
          Time: 'string',
          Date: 'string',
        },
      })) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
          export interface ISuggestion {
            id: Scalars['ID'];
            userId: Scalars['ID'];
            suggestionType: SuggestionType;
            text: Scalars['String'];
          }
      `);
      expect(result.content).toBeSimilarStringTo(`
          export const enum SuggestionType {
            Concern = 'concern',
            Goal = 'goal'
          };
      `);

      expect(result.content).toBeSimilarStringTo(`
          export interface IRootQueryType {
            suggestionsForUser?: Maybe<Array<ISuggestion>>;
          }
      `);

      expect(result.content).toBeSimilarStringTo(`
          export interface IRootQueryTypeSuggestionsForUserArgs {
            userId: Scalars['ID'];
            suggestionType: SuggestionType;
          }
      `);
    });
  });

  describe('Config', () => {
    it('Should build type correctly when specified with avoidOptionals config', async () => {
      const schema = buildSchema(`
        type MyType {
          foo: String
          bar: String!
        }
      `);
      const result = (await plugin(schema, [], { avoidOptionals: true }, { outputFile: '' })) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
        export type MyType = {
          __typename?: 'MyType';
          foo: Maybe<Scalars['String']>;
          bar: Scalars['String'];
        };
      `);
      validateTs(result);
    });

    it('Should build input type correctly when specified with avoidInputOptionals config', async () => {
      const schema = buildSchema(`
        input MyInput {
          foo: String
          bar: String!
        }
      `);
      const result = (await plugin(schema, [], { avoidOptionals: { inputValue: true } }, { outputFile: '' })) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
        export type MyInput = {
          foo: Maybe<Scalars['String']>;
          bar: Scalars['String'];
        }
      `);

      validateTs(result);
    });

    it('Should build type correctly when specified with immutableTypes config', async () => {
      const schema = buildSchema(`
        type MyType {
          foo: [String!]!
        }`);
      const result = (await plugin(schema, [], { immutableTypes: true }, { outputFile: '' })) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
        export type MyType = {
          readonly  __typename?: 'MyType';
          readonly foo: ReadonlyArray<Scalars['String']>;
        };
      `);
      validateTs(result);
    });

    it('Should use const enums when constEnums is set', async () => {
      const schema = buildSchema(`
      enum MyEnum {
        A
      }`);
      const result = (await plugin(schema, [], { constEnums: true }, { outputFile: '' })) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
      export const enum MyEnum {
        A = 'A'
      };
    `);
      validateTs(result);
    });

    it('Should use enum as type when enumsAsTypes is set', async () => {
      const schema = buildSchema(`
      enum MyEnum {
        A
        B
      }`);
      const result = (await plugin(schema, [], { enumsAsTypes: true }, { outputFile: '' })) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
      export type MyEnum = 'A' | 'B';
    `);
      validateTs(result);
    });

    it('Should use enum as type when enumsAsTypes is set and also enumValues', async () => {
      const schema = buildSchema(`
      enum MyEnum {
        A
        B
      }`);
      const result = (await plugin(schema, [], { enumValues: { MyEnum: { A: 'BOOP' } }, enumsAsTypes: true }, { outputFile: '' })) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
      export type MyEnum = 'BOOP' | 'B';
    `);
      validateTs(result);
    });

    it('Should use custom namingConvention for enums (keep)', async () => {
      const schema = buildSchema(/* GraphQL */ `
        enum Foo {
          YES
          NO
        }
        type MyType {
          foo(a: String!, b: String, c: [String], d: [Int!]!): Foo
        }
      `);
      const result = (await plugin(
        schema,
        [],
        {
          namingConvention: {
            typeNames: 'lower-case#lowerCase',
            enumValues: 'keep',
          },
        },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
        export enum foo {
          YES = 'YES',
          NO = 'NO'
        }
      `);

      expect(result.content).toBeSimilarStringTo(`
        export type mytypefooargs = {
          a: Scalars['String'];
          b?: Maybe<Scalars['String']>;
          c?: Maybe<Array<Maybe<Scalars['String']>>>;
          d: Array<Scalars['Int']>;
        };
    `);
      expect(result.content).toBeSimilarStringTo(`
        export type mytype = {
          __typename?: 'MyType';
          foo?: Maybe<foo>;
        };
    `);

      validateTs(result);
    });

    it('Should use custom namingConvention for enums values as string, without specifying other type converters', async () => {
      const schema = buildSchema(/* GraphQL */ `
        enum Foo {
          YES
          NO
        }
        type MyType {
          foo(a: String!, b: String, c: [String], d: [Int!]!): Foo
        }
      `);
      const result = (await plugin(
        schema,
        [],
        {
          namingConvention: {
            enumValues: 'lower-case#lowerCase',
          },
        },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
      export enum Foo {
        yes = 'YES',
        no = 'NO'
      }`);
    });

    it('Should use custom namingConvention for enums', async () => {
      const schema = buildSchema(/* GraphQL */ `
        enum Foo {
          YES
          NO
        }
        type MyType {
          foo(a: String!, b: String, c: [String], d: [Int!]!): Foo
        }
      `);
      const result = (await plugin(
        schema,
        [],
        {
          namingConvention: {
            typeNames: 'keep',
            enumValues: 'lower-case#lowerCase',
          },
        },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
        export enum Foo {
          yes = 'YES',
          no = 'NO'
        }
      `);

      expect(result.content).toBeSimilarStringTo(`
        export type MyTypefooArgs = {
          a: Scalars['String'];
          b?: Maybe<Scalars['String']>;
          c?: Maybe<Array<Maybe<Scalars['String']>>>;
          d: Array<Scalars['Int']>;
        };
      `);

      expect(result.content).toBeSimilarStringTo(`
        export type MyType = {
          __typename?: 'MyType';
          foo?: Maybe<Foo>;
        };
      `);

      validateTs(result);
    });

    it('should handle introspection types (like __TypeKind)', async () => {
      const testSchema = buildSchema(/* GraphQL */ `
        type Post {
          title: String
        }
        type Query {
          post: Post!
        }
      `);
      const query = parse(/* GraphQL */ `
        query Info {
          __type(name: "Post") {
            name
            fields {
              name
              type {
                name
                kind
              }
            }
          }
        }
      `);

      const result = (await plugin(
        testSchema,
        [{ location: '', document: query }],
        {},
        {
          outputFile: 'graphql.ts',
        }
      )) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
      /** An enum describing what kind of type a given \`__Type\` is. */
      export enum __TypeKind {
        /** Indicates this type is a scalar. */
        Scalar = 'SCALAR',
        /** Indicates this type is an object. \`fields\` and \`interfaces\` are valid fields. */
        Object = 'OBJECT',
        /** Indicates this type is an interface. \`fields\` and \`possibleTypes\` are valid fields. */
        Interface = 'INTERFACE',
        /** Indicates this type is a union. \`possibleTypes\` is a valid field. */
        Union = 'UNION',
        /** Indicates this type is an enum. \`enumValues\` is a valid field. */
        Enum = 'ENUM',
        /** Indicates this type is an input object. \`inputFields\` is a valid field. */
        InputObject = 'INPUT_OBJECT',
        /** Indicates this type is a list. \`ofType\` is a valid field. */
        List = 'LIST',
        /** Indicates this type is a non-null. \`ofType\` is a valid field. */
        NonNull = 'NON_NULL'
      }
      `);
    });

    it('Should use class correctly when declarationKind: class is set', async () => {
      const schema = buildSchema(`
        input MyInput {
          id: ID!
          displayName: String
        }

        type MyType {
          id: ID!
          displayName: String
        }
      `);
      const result = (await plugin(
        schema,
        [],
        {
          declarationKind: 'class',
        },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
        export class MyInput {
          id: Scalars['ID'];
          displayName?: Maybe<Scalars['String']>;
        }
      `);

      expect(result.content).toBeSimilarStringTo(`
        export class MyType {
          __typename?: 'MyType';
          id: Scalars['ID'];
          displayName?: Maybe<Scalars['String']>;
        }
      `);

      validateTs(result);
    });

    it('Should use interface for type when declarationKind for types is set', async () => {
      const schema = buildSchema(`
        input MyInput {
          id: ID!
          displayName: String
        }

        type MyType {
          id: ID!
          displayName: String
        }
      `);
      const result = (await plugin(
        schema,
        [],
        {
          declarationKind: {
            type: 'interface',
          },
        },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
        export type MyInput = {
          id: Scalars['ID'];
          displayName?: Maybe<Scalars['String']>;
        }
      `);

      expect(result.content).toBeSimilarStringTo(`
        export interface MyType {
          __typename?: 'MyType';
          id: Scalars['ID'];
          displayName?: Maybe<Scalars['String']>;
        }
      `);
      validateTs(result);
    });

    it('Should use interface for input when declarationKind for inputs is set', async () => {
      const schema = buildSchema(`
        input MyInput {
          id: ID!
          displayName: String
        }

        type MyType {
          id: ID!
          displayName: String
        }
      `);
      const result = (await plugin(
        schema,
        [],
        {
          declarationKind: {
            input: 'interface',
          },
        },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
        export interface MyInput {
          id: Scalars['ID'];
          displayName?: Maybe<Scalars['String']>;
        }
      `);

      expect(result.content).toBeSimilarStringTo(`
        export type MyType = {
          __typename?: 'MyType';
          id: Scalars['ID'];
          displayName?: Maybe<Scalars['String']>;
        }
      `);
      validateTs(result);
    });

    it('Should use interface for arguments when declarationKind for arguments is set', async () => {
      const schema = buildSchema(`
        type MyType {
          id: ID!
          displayName: String
          child(id: ID!): MyType
        }
      `);
      const result = (await plugin(
        schema,
        [],
        {
          declarationKind: {
            arguments: 'interface',
          },
        },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
        export type MyType = {
          __typename?: 'MyType';
          id: Scalars['ID'];
          displayName?: Maybe<Scalars['String']>;
          child?: Maybe<MyType>;
        }
      `);

      expect(result.content).toBeSimilarStringTo(`
        export interface MyTypeChildArgs {
          id: Scalars['ID'];
        }
      `);
      validateTs(result);
    });

    it('Should use interface for all objects when declarationKind is interface', async () => {
      const schema = buildSchema(`
        input MyInput {
          id: ID!
          displayName: String
        }

        type MyType {
          id: ID!
          displayName: String
        }
      `);
      const result = (await plugin(
        schema,
        [],
        {
          declarationKind: 'interface',
        },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
        export interface MyInput {
          id: Scalars['ID'];
          displayName?: Maybe<Scalars['String']>;
        }
      `);

      expect(result.content).toBeSimilarStringTo(`
        export interface MyType {
          __typename?: 'MyType';
          id: Scalars['ID'];
          displayName?: Maybe<Scalars['String']>;
        }
      `);
      validateTs(result);
    });

    it('Should correctly render empty interfaces', async () => {
      const schema = buildSchema(`
        input MyInput

        type MyType
      `);
      const result = (await plugin(
        schema,
        [],
        {
          declarationKind: 'interface',
        },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
        export interface MyInput {}
      `);

      expect(result.content).toBeSimilarStringTo(`
        export interface MyType {
          __typename?: 'MyType';
        }
      `);
      validateTs(result);
    });

    it('Should extend one interface from another', async () => {
      const schema = buildSchema(`
        interface MyInterface {
          id: ID!
          displayName: String
        }

        type MyType implements MyInterface {
          id: ID!
          displayName: String
          value: Int
        }
      `);
      const result = (await plugin(
        schema,
        [],
        {
          declarationKind: 'interface',
        },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
        export interface MyInterface {
          id: Scalars['ID'];
          displayName?: Maybe<Scalars['String']>;
        }
      `);

      expect(result.content).toBeSimilarStringTo(`
        export interface MyType extends MyInterface {
          __typename?: 'MyType';
          id: Scalars['ID'];
          displayName?: Maybe<Scalars['String']>;
          value?: Maybe<Scalars['Int']>;
        }
      `);
      validateTs(result);
    });

    it('Should extend mutiple interfaces', async () => {
      const schema = buildSchema(`
        interface MyInterface1 {
          id: ID!
          displayName: String
        }

        interface MyInterface2 {
          value: Int
        }

        type MyType implements MyInterface1 & MyInterface2 {
          id: ID!
          displayName: String
          value: Int
        }
      `);
      const result = (await plugin(
        schema,
        [],
        {
          declarationKind: 'interface',
        },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
        export interface MyInterface1 {
          id: Scalars['ID'];
          displayName?: Maybe<Scalars['String']>;
        }
      `);

      expect(result.content).toBeSimilarStringTo(`
        export interface MyInterface2 {
          value?: Maybe<Scalars['Int']>;
        }
      `);

      expect(result.content).toBeSimilarStringTo(`
        export interface MyType extends MyInterface1, MyInterface2 {
          __typename?: 'MyType';
          id: Scalars['ID'];
          displayName?: Maybe<Scalars['String']>;
          value?: Maybe<Scalars['Int']>;
        }
      `);
      validateTs(result);
    });
  });

  describe('Scalars', () => {
    it('Should generate a scalars mapping correctly for built-in scalars', async () => {
      const schema = buildSchema(`
      type MyType {
        foo: String
        bar: String!
      }`);
      const result = (await plugin(schema, [], {}, { outputFile: '' })) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
      export type Scalars = {
        ID: string;
        String: string;
        Boolean: boolean;
        Int: number;
        Float: number;
      };`);

      expect(result.content).toBeSimilarStringTo(`
      export type MyType = {
        __typename?: 'MyType';
        foo?: Maybe<Scalars['String']>;
        bar: Scalars['String'];
      };`);
      validateTs(result);
    });

    it('Should generate a scalars mapping correctly when using scalars as path', async () => {
      const schema = buildSchema(`
      scalar MyScalar

      type MyType {
        foo: String
        bar: MyScalar!
      }`);
      const result = (await plugin(
        schema,
        [],
        {
          scalars: '../../scalars',
        },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;

      expect(result.prepend).toContain(`import { MyScalar } from '../../scalars';`);
      expect(result.content).toBeSimilarStringTo(`
      export type Scalars = {
        ID: string;
        String: String;
        Boolean: Boolean;
        Int: number;
        Float: number;
        MyScalar: MyScalar;
      };`);

      expect(result.content).toBeSimilarStringTo(`
      export type MyType = {
        __typename?: 'MyType';
        foo?: Maybe<Scalars['String']>;
        bar: Scalars['MyScalar'];
      };`);
      validateTs(result);
    });

    it('Should import a type of a mapped scalar', async () => {
      const schema = buildSchema(`
      scalar MyScalar
      scalar MyOtherScalar
      scalar MyAliasedScalar

      type MyType {
        foo: String
        bar: MyScalar!
        baz: MyOtherScalar!
        qux: MyAliasedScalar!
      }`);
      const result = (await plugin(
        schema,
        [],
        {
          scalars: {
            MyScalar: '../../scalars#default',
            MyOtherScalar: '../../scalars#MyOtherScalar',
            MyAliasedScalar: '../../scalars#MyAliasedScalar as AliasedScalar',
          },
        },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;

      // It seems like we don't group imports...
      expect(result.prepend).toContain(`import MyScalar from '../../scalars';`);
      expect(result.prepend).toContain(`import { MyOtherScalar } from '../../scalars';`);
      expect(result.prepend).toContain(`import { MyAliasedScalar as AliasedScalar } from '../../scalars';`);
      expect(result.content).toBeSimilarStringTo(`
      export type Scalars = {
        ID: string;
        String: string;
        Boolean: boolean;
        Int: number;
        Float: number;
        MyScalar: MyScalar;
        MyOtherScalar: MyOtherScalar;
        MyAliasedScalar: AliasedScalar;
      };`);

      expect(result.content).toBeSimilarStringTo(`
      export type MyType = {
        __typename?: 'MyType';
        foo?: Maybe<Scalars['String']>;
        bar: Scalars['MyScalar'];
        baz: Scalars['MyOtherScalar'];
        qux: Scalars['MyAliasedScalar'];
      };`);
      validateTs(result);
    });

    it('Should generate a scalars mapping correctly for custom scalars', async () => {
      const schema = buildSchema(`
      scalar MyScalar

      type MyType {
        foo: String
        bar: MyScalar!
      }`);
      const result = (await plugin(schema, [], {}, { outputFile: '' })) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
      export type Scalars = {
        ID: string;
        String: string;
        Boolean: boolean;
        Int: number;
        Float: number;
        MyScalar: any;
      };`);

      expect(result.content).toBeSimilarStringTo(`
      export type MyType = {
        __typename?: 'MyType';
        foo?: Maybe<Scalars['String']>;
        bar: Scalars['MyScalar'];
      };`);
      validateTs(result);
    });

    it('Should generate a scalars mapping correctly for custom scalars with mapping', async () => {
      const schema = buildSchema(`
      scalar MyScalar

      type MyType {
        foo: String
        bar: MyScalar!
      }`);
      const result = (await plugin(schema, [], { scalars: { MyScalar: 'Date' } }, { outputFile: '' })) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
      export type Scalars = {
        ID: string;
        String: string;
        Boolean: boolean;
        Int: number;
        Float: number;
        MyScalar: Date;
      };`);

      expect(result.content).toBeSimilarStringTo(`
      export type MyType = {
        __typename?: 'MyType';
        foo?: Maybe<Scalars['String']>;
        bar: Scalars['MyScalar'];
      };`);
      validateTs(result);
    });

    it('Should add FieldWrapper when field definition wrapping is enabled', async () => {
      const schema = buildSchema(`
      scalar A
      `);

      const result = (await plugin(schema, [], { wrapFieldDefinitions: true }, { outputFile: '' })) as Types.ComplexPluginOutput;
      expect(result.prepend).toBeSimilarStringTo('export type FieldWrapper<T> =');
      validateTs(result);
    });

    it('Should allow the FieldWrapper type to be modified', async () => {
      const schema = buildSchema(`
      scalar A
      `);

      const result = (await plugin(schema, [], { fieldWrapperValue: 'T | Promise<T>', wrapFieldDefinitions: true }, { outputFile: '' })) as Types.ComplexPluginOutput;
      expect(result.prepend).toBeSimilarStringTo('export type FieldWrapper<T> = T | Promise<T>');
      validateTs(result);
    });
  });

  describe('Object (type)', () => {
    it('Should build type correctly', async () => {
      const schema = buildSchema(`
        type MyType {
          foo: String
          bar: String!
        }`);
      const result = (await plugin(schema, [], {}, { outputFile: '' })) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
        export type MyType = {
          __typename?: 'MyType';
          foo?: Maybe<Scalars['String']>;
          bar: Scalars['String'];
        };
      `);
      validateTs(result);
    });

    it('Should build type correctly when implementing interface', async () => {
      const schema = buildSchema(`
        interface MyInterface {
          foo: String!
        }

        type MyType implements MyInterface {
          foo: String!
        }
        `);
      const result = (await plugin(schema, [], {}, { outputFile: '' })) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
        export type MyInterface = {
          foo: Scalars['String'];
        };
      `);
      expect(result.content).toBeSimilarStringTo(`
        export type MyType = MyInterface & {
          __typename?: 'MyType';
          foo: Scalars['String'];
        };
      `);
      validateTs(result);
    });

    it('Should build type correctly when implementing multiple interfaces', async () => {
      const schema = buildSchema(`
        interface MyInterface {
          foo: String!
        }

        interface MyOtherInterface {
          bar: String!
        }

        type MyType implements MyInterface & MyOtherInterface {
          foo: String!
          bar: String!
        }
        `);
      const result = (await plugin(schema, [], {}, { outputFile: '' })) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
        export type MyInterface = {
          foo: Scalars['String'];
        };
      `);
      expect(result.content).toBeSimilarStringTo(`
        export type MyOtherInterface = {
          bar: Scalars['String'];
        };
      `);
      expect(result.content).toBeSimilarStringTo(`
        export type MyType = MyInterface & MyOtherInterface & {
          __typename?: 'MyType';
          foo: Scalars['String'];
          bar: Scalars['String'];
        };
      `);
      validateTs(result);
    });

    it('Should build type correctly when implementing interface without adding fields', async () => {
      const schema = buildSchema(`
        interface MyInterface {
          foo: String!
        }

        type MyType implements MyInterface
        `);
      const result = (await plugin(schema, [], {}, { outputFile: '' })) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
        export type MyInterface = {
          foo: Scalars['String'];
        };
      `);
      expect(result.content).toBeSimilarStringTo(`
        export type MyType = MyInterface & {
          __typename?: 'MyType';
        };
      `);
      validateTs(result);
    });

    it('Should build type correctly with links between types', async () => {
      const schema = buildSchema(`
        type MyType {
          foo: MyOtherType!
        }

        type MyOtherType {
          bar: String!
        }
        `);
      const result = (await plugin(schema, [], {}, { outputFile: '' })) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
        export type MyType = {
          __typename?: 'MyType';
          foo: MyOtherType;
        };
      `);
      expect(result.content).toBeSimilarStringTo(`
        export type MyOtherType = {
          __typename?: 'MyOtherType';
          bar: Scalars['String'];
        };
      `);
      validateTs(result);
    });

    it('Should build type correctly when wrapping field definitions', async () => {
      const schema = buildSchema(`
        interface MyInterface {
          foo: String!
        }

        type MyType implements MyInterface {
          foo: String!
        }
        `);
      const result = (await plugin(schema, [], { wrapFieldDefinitions: true }, { outputFile: '' })) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
        export type MyInterface = {
          foo: FieldWrapper<Scalars['String']>;
        };
      `);
      expect(result.content).toBeSimilarStringTo(`
        export type MyType = MyInterface & {
          __typename?: 'MyType';
          foo: FieldWrapper<Scalars['String']>;
        };
      `);
      validateTs(result);
    });

    it('Should not wrap input type fields', async () => {
      const schema = buildSchema(`
        input MyInput {
          foo: String!
        }
        `);
      const result = (await plugin(schema, [], { wrapFieldDefinitions: true }, { outputFile: '' })) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
        export type MyInput = {
          foo: Scalars['String'];
        };
      `);
      validateTs(result);
    });
  });

  describe('Union', () => {
    it('Should build union as type correctly', async () => {
      const schema = buildSchema(`
      type MyType {
        foo: String!
      }

      type MyOtherType {
        bar: String!
      }

      union MyUnion = MyType | MyOtherType
      `);
      const result = (await plugin(schema, [], {}, { outputFile: '' })) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
      export type MyUnion = MyType | MyOtherType;
    `);
      validateTs(result);
    });
  });

  describe('Interface', () => {
    it('Should build interface correctly', async () => {
      const schema = buildSchema(`
        interface MyInterface {
          foo: String
          bar: String!
        }`);
      const result = (await plugin(schema, [], {}, { outputFile: '' })) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
        export type MyInterface = {
          foo?: Maybe<Scalars['String']>;
          bar: Scalars['String'];
        };
      `);
      validateTs(result);
    });
  });

  describe('Directives', () => {
    it('Should handle directive declarations correctly', async () => {
      const schema = buildSchema(`
        directive @simple on FIELD_DEFINITION
        directive @withArgument(arg: Int!) on FIELD_DEFINITION
        directive @objSimple on OBJECT
        directive @universal on OBJECT | FIELD_DEFINITION | ENUM_VALUE
      `);

      const result = (await plugin(schema, [], {}, { outputFile: '' })) as Types.ComplexPluginOutput;

      expect(result.content).not.toContain('simple');
      expect(result.content).not.toContain('withArguments');
      expect(result.content).not.toContain('objSimple');
      expect(result.content).not.toContain('universal');
      validateTs(result);
    });
  });

  describe('Naming Convention & Types Prefix', () => {
    it('Should use custom namingConvention for type name and args typename', async () => {
      const schema = buildSchema(`type MyType { foo(a: String!, b: String, c: [String], d: [Int!]!): String }`);
      const result = (await plugin(schema, [], { namingConvention: 'lower-case#lowerCase' }, { outputFile: '' })) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
        export type mytypefooargs = {
          a: Scalars['String'];
          b?: Maybe<Scalars['String']>;
          c?: Maybe<Array<Maybe<Scalars['String']>>>;
          d: Array<Scalars['Int']>;
        };
    `);
      expect(result.content).toBeSimilarStringTo(`
        export type mytype = {
          __typename?: 'MyType';
          foo?: Maybe<Scalars['String']>;
        };
    `);

      validateTs(result);
    });

    it('Should use custom namingConvention and add custom prefix', async () => {
      const schema = buildSchema(`type MyType { foo(a: String!, b: String, c: [String], d: [Int!]!): String }`);
      const result = (await plugin(schema, [], { namingConvention: 'lower-case#lowerCase', typesPrefix: 'I' }, { outputFile: '' })) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
        export type Imytypefooargs = {
          a: Scalars['String'];
          b?: Maybe<Scalars['String']>;
          c?: Maybe<Array<Maybe<Scalars['String']>>>;
          d: Array<Scalars['Int']>;
        };
      `);

      expect(result.content).toBeSimilarStringTo(`
        export type Imytype = {
          __typename?: 'MyType';
          foo?: Maybe<Scalars['String']>;
        };
      `);

      validateTs(result);
    });

    it('Should allow to disable typesPrefix for enums', async () => {
      const schema = buildSchema(`type T { f: String, e: E } enum E { A }`);
      const result = (await plugin(schema, [], { typesPrefix: 'I', enumPrefix: false }, { outputFile: '' })) as Types.ComplexPluginOutput;

      expect(result.content).toContain(`export enum E {`);
      expect(result.content).toContain(`e?: Maybe<E>;`);

      validateTs(result);
    });

    it('Should enable typesPrefix for enums by default', async () => {
      const schema = buildSchema(`type T { f: String, e: E } enum E { A }`);
      const result = (await plugin(schema, [], { typesPrefix: 'I' }, { outputFile: '' })) as Types.ComplexPluginOutput;

      expect(result.content).toContain(`export enum IE {`);
      expect(result.content).toContain(`e?: Maybe<IE>;`);

      validateTs(result);
    });

    const schema = buildSchema(`
    enum MyEnum {
      A
      B
      C
    }

    type MyType {
      f: String
      bar: MyEnum
      b_a_r: String
      myOtherField: String
    }

    type My_Type {
      linkTest: MyType
    }

    union MyUnion = My_Type | MyType

    interface Some_Interface {
      id: ID!
    }

    type Impl1 implements Some_Interface {
      id: ID!
    }

    type Impl_2 implements Some_Interface {
      id: ID!
    }

    type impl_3 implements Some_Interface {
      id: ID!
    }

    type Query {
      something: MyUnion
      use_interface: Some_Interface
    }
  `);

    it('Should generate correct values when using links between types - lowerCase', async () => {
      const result = (await plugin(schema, [], { namingConvention: 'lower-case#lowerCase' }, { outputFile: '' })) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
        export enum myenum {
          a = 'A',
          b = 'B',
          c = 'C'
        }
        `);
      expect(result.content).toBeSimilarStringTo(`
        export type mytype = {
          __typename?: 'MyType';
          f?: Maybe<Scalars['String']>;
          bar?: Maybe<myenum>;
          b_a_r?: Maybe<Scalars['String']>;
          myOtherField?: Maybe<Scalars['String']>;
        };
        `);
      expect(result.content).toBeSimilarStringTo(`
        export type my_type = {
          __typename?: 'My_Type';
          linkTest?: Maybe<mytype>;
        };
        `);
      expect(result.content).toBeSimilarStringTo(`
        export type myunion = my_type | mytype;
        `);
      expect(result.content).toBeSimilarStringTo(`
        export type some_interface = {
          id: Scalars['ID'];
        };
        `);
      expect(result.content).toBeSimilarStringTo(`
        export type impl1 = some_interface & {
          __typename?: 'Impl1';
          id: Scalars['ID'];
        };
        `);
      expect(result.content).toBeSimilarStringTo(`
        export type impl_2 = some_interface & {
          __typename?: 'Impl_2';
          id: Scalars['ID'];
        };
        `);
      expect(result.content).toBeSimilarStringTo(`
        export type impl_3 = some_interface & {
          __typename?: 'impl_3';
          id: Scalars['ID'];
        };
        `);
      expect(result.content).toBeSimilarStringTo(`
        export type query = {
          __typename?: 'Query';
          something?: Maybe<myunion>;
          use_interface?: Maybe<some_interface>;
        };
      `);

      validateTs(result);
    });

    it('Should generate correct values when using links between types - pascalCase (default)', async () => {
      const result = (await plugin(schema, [], {}, { outputFile: '' })) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
      export enum MyEnum {
        A = 'A',
        B = 'B',
        C = 'C'
      }
      `);
      expect(result.content).toBeSimilarStringTo(`
      export type MyType = {
        __typename?: 'MyType';
        f?: Maybe<Scalars['String']>;
        bar?: Maybe<MyEnum>;
        b_a_r?: Maybe<Scalars['String']>;
        myOtherField?: Maybe<Scalars['String']>;
      };
      `);
      expect(result.content).toBeSimilarStringTo(`
      export type My_Type = {
        __typename?: 'My_Type';
        linkTest?: Maybe<MyType>;
      };
      `);
      expect(result.content).toBeSimilarStringTo(`
      export type MyUnion = My_Type | MyType;
      `);
      expect(result.content).toBeSimilarStringTo(`
      export type Some_Interface = {
        id: Scalars['ID'];
      };
      `);
      expect(result.content).toBeSimilarStringTo(`
      export type Impl1 = Some_Interface & {
        __typename?: 'Impl1';
        id: Scalars['ID'];
      };
      `);
      expect(result.content).toBeSimilarStringTo(`
      export type Impl_2 = Some_Interface & {
        __typename?: 'Impl_2';
        id: Scalars['ID'];
      };
      `);
      expect(result.content).toBeSimilarStringTo(`
      export type Impl_3 = Some_Interface & {
        __typename?: 'impl_3';
        id: Scalars['ID'];
      };
      `);
      expect(result.content).toBeSimilarStringTo(`
      export type Query = {
        __typename?: 'Query';
        something?: Maybe<MyUnion>;
        use_interface?: Maybe<Some_Interface>;
      };
      `);

      validateTs(result);
    });

    it('Should generate correct values when using links between types - pascalCase (default) with custom prefix', async () => {
      const result = (await plugin(schema, [], { typesPrefix: 'I' }, { outputFile: '' })) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
      export enum IMyEnum {
        A = 'A',
        B = 'B',
        C = 'C'
      }`);

      expect(result.content).toBeSimilarStringTo(`
      export type IMyType = {
        __typename?: 'MyType';
        f?: Maybe<Scalars['String']>;
        bar?: Maybe<IMyEnum>;
        b_a_r?: Maybe<Scalars['String']>;
        myOtherField?: Maybe<Scalars['String']>;
      };`);
      expect(result.content).toBeSimilarStringTo(`
      export type IMy_Type = {
        __typename?: 'My_Type';
        linkTest?: Maybe<IMyType>;
      };
  `);
      expect(result.content).toBeSimilarStringTo(`export type IMyUnion = IMy_Type | IMyType;`);
      expect(result.content).toBeSimilarStringTo(`
      export type ISome_Interface = {
        id: Scalars['ID'];
      };
      `);
      expect(result.content).toBeSimilarStringTo(`
      export type IImpl1 = ISome_Interface & {
        __typename?: 'Impl1';
        id: Scalars['ID'];
      };
      `);
      expect(result.content).toBeSimilarStringTo(`
      export type IImpl_2 = ISome_Interface & {
        __typename?: 'Impl_2';
        id: Scalars['ID'];
      };
      `);
      expect(result.content).toBeSimilarStringTo(`
      export type IImpl_3 = ISome_Interface & {
        __typename?: 'impl_3';
        id: Scalars['ID'];
      };
      `);
      expect(result.content).toBeSimilarStringTo(`
      export type IQuery = {
        __typename?: 'Query';
        something?: Maybe<IMyUnion>;
        use_interface?: Maybe<ISome_Interface>;
      };
      `);

      validateTs(result);
    });
  });

  describe('Arguments', () => {
    it('Should generate correctly types for field arguments - with basic fields', async () => {
      const schema = buildSchema(`type MyType { foo(a: String!, b: String, c: [String], d: [Int!]!): String }`);

      const result = (await plugin(schema, [], {}, { outputFile: '' })) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
        export type MyTypeFooArgs = {
          a: Scalars['String'];
          b?: Maybe<Scalars['String']>;
          c?: Maybe<Array<Maybe<Scalars['String']>>>;
          d: Array<Scalars['Int']>;
        };
    `);

      validateTs(result);
    });

    it('Should generate correctly types for field arguments - with default value', async () => {
      const schema = buildSchema(`type MyType { foo(a: String = "default", b: String! = "default", c: String, d: String!): String }`);
      const result = (await plugin(schema, [], {}, { outputFile: '' })) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
        export type MyTypeFooArgs = {
          a?: Maybe<Scalars['String']>;
          b?: Scalars['String'];
          c?: Maybe<Scalars['String']>;
          d: Scalars['String'];
        };
    `);

      validateTs(result);
    });

    it('Should generate correctly types for field arguments - with default value and avoidOptionals option set to true', async () => {
      const schema = buildSchema(`type MyType { foo(a: String = "default", b: String! = "default", c: String, d: String!): String }`);
      const result = (await plugin(schema, [], { avoidOptionals: true }, { outputFile: '' })) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
        export type MyTypeFooArgs = {
          a?: Maybe<Scalars['String']>;
          b?: Scalars['String'];
          c: Maybe<Scalars['String']>;
          d: Scalars['String'];
      };
    `);

      validateTs(result);
    });

    it('Should generate correctly types for field arguments - with input type', async () => {
      const schema = buildSchema(`input MyInput { f: String } type MyType { foo(a: MyInput, b: MyInput!, c: [MyInput], d: [MyInput]!, e: [MyInput!]!): String }`);
      const result = (await plugin(schema, [], {}, { outputFile: '' })) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
        export type MyTypeFooArgs = {
          a?: Maybe<MyInput>;
          b: MyInput;
          c?: Maybe<Array<Maybe<MyInput>>>;
          d: Array<Maybe<MyInput>>;
          e: Array<MyInput>;
        };
    `);

      validateTs(result);
    });

    it('Should add custom prefix for mutation arguments', async () => {
      const schema = buildSchema(`input Input { name: String } type Mutation { foo(id: ID, input: Input): String }`);
      const result = (await plugin(schema, [], { typesPrefix: 'T' }, { outputFile: '' })) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
        export type TInput = {
          name?: Maybe<Scalars['String']>;
        };
      `);

      expect(result.content).toBeSimilarStringTo(`
        export type TMutation = {
          __typename?: 'Mutation';
          foo?: Maybe<Scalars['String']>;
        };

        export type TMutationFooArgs = {
          id?: Maybe<Scalars['ID']>;
          input?: Maybe<TInput>;
        };
      `);

      validateTs(result);
    });

    it('Should generate the correct type for a method with arguments (interface object)', async () => {
      const testSchema = buildSchema(/* GraphQL */ `
        interface Node {
          text(arg1: String!, arg2: String): String
        }

        type Book implements Node {
          id: ID!
          text(arg: String, arg2: String!): String
        }

        type Query {
          books: [Book!]!
        }
      `);
      const result = (await plugin(testSchema, [], {}, { outputFile: '' })) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
        export type NodeTextArgs = {
          arg1: Scalars['String'];
          arg2?: Maybe<Scalars['String']>;
        };
      `);
      await validateTs(result);
    });
  });

  describe('Enum', () => {
    it('Should build basic enum correctly', async () => {
      const schema = buildSchema(`enum MyEnum { A, B, C }`);
      const result = (await plugin(schema, [], {}, { outputFile: '' })) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
        export enum MyEnum {
          A = 'A',
          B = 'B',
          C = 'C'
        }
      `);

      validateTs(result);
    });

    it('Should build enum correctly with custom values', async () => {
      const schema = buildSchema(`enum MyEnum { A, B, C }`);
      const result = (await plugin(schema, [], { enumValues: { MyEnum: { A: 'SomeValue', B: 'TEST' } } }, { outputFile: '' })) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
        export enum MyEnum {
          A = 'SomeValue',
          B = 'TEST',
          C = 'C'
        }
      `);

      validateTs(result);
    });

    it('Should build enum correctly with custom imported enum', async () => {
      const schema = buildSchema(`enum MyEnum { A, B, C }`);
      const result = (await plugin(schema, [], { enumValues: { MyEnum: './my-file#MyEnum' } }, { outputFile: '' })) as Types.ComplexPluginOutput;

      expect(result.content).not.toContain(`export enum MyEnum`);
      expect(result.prepend).toContain(`import { MyEnum } from './my-file';`);

      validateTs(result);
    });

    it('Should build enum correctly with custom imported enum with different name', async () => {
      const schema = buildSchema(`enum MyEnum { A, B, C }`);
      const result = (await plugin(schema, [], { enumValues: { MyEnum: './my-file#MyCustomEnum' } }, { outputFile: '' })) as Types.ComplexPluginOutput;

      expect(result.content).not.toContain(`export enum MyEnum`);
      expect(result.prepend).toContain(`import { MyCustomEnum as MyEnum } from './my-file';`);

      validateTs(result);
    });

    it('Should import all enums from a single file when specified as string', async () => {
      const schema = buildSchema(`enum MyEnum { A, B, C } enum MyEnum2 { X, Y, Z }`);
      const result = (await plugin(schema, [], { enumValues: './my-file' }, { outputFile: '' })) as Types.ComplexPluginOutput;

      expect(result.content).not.toContain(`export enum MyEnum`);
      expect(result.content).not.toContain(`export enum MyEnum2`);
      expect(result.prepend).toContain(`import { MyEnum } from './my-file';`);
      expect(result.prepend).toContain(`import { MyEnum2 } from './my-file';`);

      validateTs(result);
    });

    it('Should re-export external enums', async () => {
      const schema = buildSchema(`enum MyEnum { A, B, C } enum MyEnum2 { X, Y, Z }`);
      const result = (await plugin(schema, [], { enumValues: { MyEnum: './my-file#MyEnum', MyEnum2: './my-file#MyEnum2X' } }, { outputFile: '' })) as Types.ComplexPluginOutput;

      expect(result.content).toContain(`export { MyEnum };`);
      expect(result.content).toContain(`export { MyEnum2 };`);

      validateTs(result);
    });

    it('Should re-export external enums when single file option used', async () => {
      const schema = buildSchema(`enum MyEnum { A, B, C } enum MyEnum2 { X, Y, Z }`);
      const result = (await plugin(schema, [], { enumValues: './my-file' }, { outputFile: '' })) as Types.ComplexPluginOutput;

      expect(result.content).toContain(`export { MyEnum };`);
      expect(result.content).toContain(`export { MyEnum2 };`);

      validateTs(result);
    });
  });

  it('should not have [object Object]', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type User {
        id: Int!
        name: String!
        email: String!
      }

      type QueryRoot {
        allUsers: [User]!
        userById(id: Int!): User

        # Generates a new answer for the guessing game
        answer: [Int!]!
      }

      type SubscriptionRoot {
        newUser: User
      }

      schema {
        query: QueryRoot
        subscription: SubscriptionRoot
      }
    `);

    const content = (await plugin(schema, [], {}, { outputFile: '' })) as Types.ComplexPluginOutput;

    expect(content).not.toContainEqual('[object Object]');

    validateTs(content);
  });

  it('should contain __typename', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type User {
        id: Int!
        name: String!
        email: String!
      }
      type QueryRoot {
        allUsers: [User]!
        userById(id: Int!): User
        # Generates a new answer for the guessing game
        answer: [Int!]!
      }
      type SubscriptionRoot {
        newUser: User
      }
      schema {
        query: QueryRoot
        subscription: SubscriptionRoot
      }
    `);

    const result = (await plugin(schema, [], {}, { outputFile: '' })) as Types.ComplexPluginOutput;
    expect(result.content).toContain('__typename');

    validateTs(result);
  });

  it('should not contain __typename', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type User {
        id: Int!
        name: String!
        email: String!
      }
      type QueryRoot {
        allUsers: [User]!
        userById(id: Int!): User
        # Generates a new answer for the guessing game
        answer: [Int!]!
      }
      type SubscriptionRoot {
        newUser: User
      }
      schema {
        query: QueryRoot
        subscription: SubscriptionRoot
      }
    `);

    const result = (await plugin(schema, [], { skipTypename: true }, { outputFile: '' })) as Types.ComplexPluginOutput;
    expect(result.content).not.toContain('__typename');

    validateTs(result);
  });

  it('should not contain "export" when noExport is set to true', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type User {
        id: Int!
        name: String!
        email: String!
      }
      type QueryRoot {
        allUsers: [User]!
        userById(id: Int!): User
        # Generates a new answer for the guessing game
        answer: [Int!]!
      }
      type SubscriptionRoot {
        newUser: User
      }
      schema {
        query: QueryRoot
        subscription: SubscriptionRoot
      }
    `);

    const result = (await plugin(schema, [], { noExport: true }, { outputFile: '' })) as Types.ComplexPluginOutput;
    expect(result.content).not.toContain('export');

    validateTs(result);
  });

  it('should keep non-optional arguments non-optional - issue #2323', async () => {
    const testSchema = buildSchema(/* GraphQL */ `
      enum OrderBy {
        name
        id
      }

      input Filter {
        contain: String
      }

      type Node {
        id: ID!
        name: String!
      }

      type Connection {
        nodes: [Node]
      }

      type Query {
        list(after: String, orderBy: OrderBy = name, filter: Filter!): Connection!
      }
    `);

    const output = (await plugin(
      testSchema,
      [],
      {
        avoidOptionals: false,
        maybeValue: 'T | undefined',
      } as any,
      { outputFile: 'graphql.ts' }
    )) as Types.ComplexPluginOutput;

    // Filter.contain should be optional
    expect(output.content).toBeSimilarStringTo(`
      export type Filter = {
        contain?: Maybe<Scalars['String']>;
      };
    `);
    // filter should be non-optional
    expect(output.content).toBeSimilarStringTo(`
      export type QueryListArgs = {
        after?: Maybe<Scalars['String']>;
        orderBy?: Maybe<OrderBy>;
        filter: Filter;
      };
    `);
  });

  it('should respect defined enum values', async () => {
    const testSchema = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'Query',
        fields: {
          foo: {
            type: new GraphQLEnumType({
              name: 'Foo',
              values: {
                Bar: {
                  value: 'Qux',
                },
              },
            }),
          },
        },
      }),
    });
    const output = (await plugin(testSchema, [], {}, { outputFile: 'graphql.ts' })) as Types.ComplexPluginOutput;

    expect(output.content).toBeSimilarStringTo(`
      export enum Foo {
        Bar = 'Qux'
      }
    `);
  });
});
