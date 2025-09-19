import { mergeOutputs, Types } from '@graphql-codegen/plugin-helpers';
import { validateTs } from '@graphql-codegen/testing';
import { buildSchema, GraphQLEnumType, GraphQLObjectType, GraphQLSchema, parse } from 'graphql';
import { plugin } from '../src/index.js';

describe('TypeScript', () => {
  it('should expose Maybe', async () => {
    const schema = buildSchema(/* GraphQL */ `
      scalar A
    `);
    const result = await plugin(schema, [], {}, { outputFile: '' });
    expect(result.prepend).toBeSimilarStringTo('export type Maybe<T> =');
  });

  describe('description to comment', () => {
    it('Should include a description for Scalars type', async () => {
      const schema = buildSchema(/* GraphQL */ `
        "My custom scalar"
        scalar A
      `);
      const result = await plugin(schema, [], {}, { outputFile: '' });

      expect(result.content).toBeSimilarStringTo(`
      /** All built-in and custom scalars, mapped to their actual values */
      export type Scalars = {
          ID: { input: string; output: string; }
          String: { input: string; output: string; }
          Boolean: { input: boolean; output: boolean; }
          Int: { input: number; output: number; }
          Float: { input: number; output: number; }
          /** My custom scalar */
          A: { input: any; output: any; }
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
      const result = await plugin(schema, [], {}, { outputFile: '' });

      expect(result.prepend).toBeSimilarStringTo('export type InputMaybe<T> = Maybe<T>;');
      expect(result.content).toBeSimilarStringTo(`
        /** MyInput */
        export type MyInput = {
          f?: InputMaybe<Scalars['String']['input']>;
        }`);
    });

    it('Should add description for input fields', async () => {
      const schema = buildSchema(/* GraphQL */ `
        "MyInput"
        input MyInput {
          "f is something"
          f: String!
        }
      `);
      const result = await plugin(schema, [], {}, { outputFile: '' });

      expect(result.content).toBeSimilarStringTo(`
        /** MyInput */
        export type MyInput = {
          /** f is something */
          f: Scalars['String']['input'];
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
      const result = await plugin(schema, [], {}, { outputFile: '' });

      expect(result.content).toBeSimilarStringTo(`
        /**
         * MyInput
         * multiline
         */
        export type MyInput = {
          f: Scalars['String']['input'];
        }`);
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
      const result = await plugin(schema, [], {}, { outputFile: '' });

      expect(result.content).toBeSimilarStringTo(`
        /** my union */
        export type A = B | C`);
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
      const result = await plugin(schema, [], {}, { outputFile: '' });

      expect(result.content).toBeSimilarStringTo(`
        /** this is b */
        export type B = {
          __typename?: 'B';
          id?: Maybe<Scalars['ID']['output']>;
        }`);

      expect(result.content).toBeSimilarStringTo(`
        /** this is c */
        export type C = {
          __typename?: 'C';
          id?: Maybe<Scalars['ID']['output']>;
        }`);
    });

    it('Should work with type fields', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type B {
          "the id"
          id: ID
        }
      `);
      const result = await plugin(schema, [], {}, { outputFile: '' });

      expect(result.content).toBeSimilarStringTo(`
      export type B = {
        __typename?: 'B';
        /** the id */
        id?: Maybe<Scalars['ID']['output']>;
      };`);
    });

    it('Should work with inteface and inteface fields', async () => {
      const schema = buildSchema(/* GraphQL */ `
        interface Node {
          "the id"
          id: ID!
        }
      `);
      const result = await plugin(schema, [], {}, { outputFile: '' });

      expect(result.content).toBeSimilarStringTo(`
      export type Node = {
        /** the id */
        id: Scalars['ID']['output'];
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
      const result = await plugin(schema, [], {}, { outputFile: '' });

      expect(result.content).toBeSimilarStringTo(`
      /** custom enum */
      export enum MyEnum {
        /** this is a */
        A = 'A',
        /** this is b */
        B = 'B'
      }`);
    });

    it('Should remove underscore from enum values', async () => {
      const schema = buildSchema(/* GraphQL */ `
        enum MyEnum {
          A_B_C
          X_Y_Z
          _TEST
          My_Value
        }
      `);
      const result = await plugin(schema, [], {}, { outputFile: '' });

      expect(result.content).toBeSimilarStringTo(`
      export enum MyEnum {
        ABC = 'A_B_C',
        XYZ = 'X_Y_Z',
        Test = '_TEST',
        MyValue = 'My_Value'
      }`);
    });

    it('Should leave underscores in enum values when the value is only underscores', async () => {
      const schema = buildSchema(/* GraphQL */ `
        enum MyEnum {
          _
          __
          _TEST
        }
      `);
      const result = await plugin(schema, [], {}, { outputFile: '' });

      expect(result.content).toBeSimilarStringTo(`
      export enum MyEnum {
        _ = '_',
        __ = '__',
        Test = '_TEST'
      }`);
    });

    it('Should work with enum as const', async () => {
      const schema = buildSchema(/* GraphQL */ `
        enum MyEnum {
          A_B_C
          X_Y_Z
          _TEST
          My_Value
          _123
        }
      `);
      const result = (await plugin(
        schema,
        [],
        { enumsAsConst: true },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
      export const MyEnum = {
        ABC: 'A_B_C',
        XYZ: 'X_Y_Z',
        Test: '_TEST',
        MyValue: 'My_Value',
        '123': '_123'
      } as const;
      export type MyEnum = typeof MyEnum[keyof typeof MyEnum];`);
    });

    it('Should work with enum as const combined with enum values', async () => {
      const schema = buildSchema(/* GraphQL */ `
        enum MyEnum {
          A_B_C
          X_Y_Z
          _TEST
          My_Value
        }
      `);
      const result = (await plugin(
        schema,
        [],
        {
          enumsAsConst: true,
          enumValues: {
            MyEnum: {
              A_B_C: 0,
              X_Y_Z: 'Foo',
              _TEST: 'Bar',
              My_Value: 1,
            },
          },
        },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
      export const MyEnum = {
        ABC: 0,
        XYZ: 'Foo',
        Test: 'Bar',
        MyValue: 1
      } as const;
      export type MyEnum = typeof MyEnum[keyof typeof MyEnum];`);
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
      const result = (await plugin(
        schema,
        [],
        { enumsAsTypes: true },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
      /** custom enum */
      export type MyEnum =
        /** this is a */
        | 'A'
        /** this is b */
        | 'B';`);
    });

    it('Should work with directives', async () => {
      const schema = buildSchema(/* GraphQL */ `
        "My custom directive"
        directive @AsNumber on ARGUMENT_DEFINITION | INPUT_FIELD_DEFINITION
      `);
      const result = await plugin(
        schema,
        [],
        { directiveArgumentAndInputFieldMappings: { AsNumber: 'number' } },
        { outputFile: '' }
      );

      expect(result.content).toBeSimilarStringTo(`
      /** Type overrides using directives */
      export type DirectiveArgumentAndInputFieldMappings = {
        /** My custom directive */
        AsNumber: number;
      };
      `);
    });
  });

  describe('disable comment generation', () => {
    it('Should not include a description for Scalars type', async () => {
      const schema = buildSchema(/* GraphQL */ `
        "My custom scalar"
        scalar A
      `);
      const result = await plugin(schema, [], { disableDescriptions: true }, { outputFile: '' });

      expect(result.content).not.toBeSimilarStringTo(`/** My custom scalar */`);
      expect(result.content).toBeSimilarStringTo(`
      export type Scalars = {
          ID: { input: string; output: string;   }
          String: { input: string; output: string;   }
          Boolean: { input: boolean; output: boolean;   }
          Int: { input: number; output: number;   }
          Float: { input: number; output: number;   }
          A: { input: any; output: any;   }
        };
      `);
    });

    it('Should not add description for input types', async () => {
      const schema = buildSchema(/* GraphQL */ `
        "MyInput"
        input MyInput {
          f: String
        }
      `);
      const result = await plugin(schema, [], { disableDescriptions: true }, { outputFile: '' });

      expect(result.content).not.toBeSimilarStringTo('/** MyInput */');
      expect(result.content).toBeSimilarStringTo(`
        export type MyInput = {
          f?: InputMaybe<Scalars['String']['input']>;
        }`);
    });

    it('Should not add description for input fields', async () => {
      const schema = buildSchema(/* GraphQL */ `
        "MyInput"
        input MyInput {
          "f is something"
          f: String!
        }
      `);
      const result = await plugin(schema, [], { disableDescriptions: true }, { outputFile: '' });

      expect(result.content).not.toBeSimilarStringTo('/** MyInput */');
      expect(result.content).not.toBeSimilarStringTo('/** f is something */');
      expect(result.content).toBeSimilarStringTo(`
        export type MyInput = {
          f: Scalars['String']['input'];
        }`);
    });

    it('Should remove multiline comment', async () => {
      const schema = buildSchema(/* GraphQL */ `
        """
        MyInput
        multiline
        """
        input MyInput {
          f: String!
        }
      `);
      const result = await plugin(schema, [], { disableDescriptions: true }, { outputFile: '' });

      expect(result.content).not.toBeSimilarStringTo(`
        /**
         * MyInput
         * multiline
         */
      `);
      expect(result.content).toBeSimilarStringTo(`
        export type MyInput = {
          f: Scalars['String']['input'];
        }`);
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
      const result = await plugin(schema, [], { disableDescriptions: true }, { outputFile: '' });

      expect(result.content).not.toBeSimilarStringTo('/** my union */');
      expect(result.content).toBeSimilarStringTo(`
        export type A = B | C`);
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
      const result = await plugin(schema, [], { disableDescriptions: true }, { outputFile: '' });

      expect(result.content).not.toBeSimilarStringTo('/** this is b */');
      expect(result.content).toBeSimilarStringTo(`
        export type B = {
          __typename?: 'B';
          id?: Maybe<Scalars['ID']['output']>;
        }`);

      expect(result.content).not.toBeSimilarStringTo('/** this is c */');
      expect(result.content).toBeSimilarStringTo(`
        export type C = {
          __typename?: 'C';
          id?: Maybe<Scalars['ID']['output']>;
        }`);
    });

    it('Should work with type fields', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type B {
          "the id"
          id: ID
        }
      `);
      const result = await plugin(schema, [], { disableDescriptions: true }, { outputFile: '' });

      expect(result.content).not.toBeSimilarStringTo('/** the id */');
      expect(result.content).toBeSimilarStringTo(`
      export type B = {
        __typename?: 'B';
        id?: Maybe<Scalars['ID']['output']>;
      };`);
    });

    it('Should work with inteface and inteface fields', async () => {
      const schema = buildSchema(/* GraphQL */ `
        interface Node {
          "the id"
          id: ID!
        }
      `);
      const result = await plugin(schema, [], { disableDescriptions: true }, { outputFile: '' });

      expect(result.content).not.toBeSimilarStringTo('/** the id */');
      expect(result.content).toBeSimilarStringTo(`
      export type Node = {
        id: Scalars['ID']['output'];
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
      const result = await plugin(schema, [], { disableDescriptions: true }, { outputFile: '' });

      expect(result.content).not.toBeSimilarStringTo('/** custom enum */');
      expect(result.content).not.toBeSimilarStringTo('/** this is a */');
      expect(result.content).not.toBeSimilarStringTo('/** this is b */');
      expect(result.content).toBeSimilarStringTo(`
      export enum MyEnum {
        A = 'A',
        B = 'B'
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
      const result = (await plugin(
        schema,
        [],
        { enumsAsTypes: true, disableDescriptions: true },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;

      expect(result.content).not.toBeSimilarStringTo('/** custom enum */');
      expect(result.content).not.toBeSimilarStringTo('/** this is a */');
      expect(result.content).not.toBeSimilarStringTo('/** this is b */');
      expect(result.content).toBeSimilarStringTo(`
      export type MyEnum =
        | 'A'
        | 'B';`);
    });

    it('Should not work when config is false', async () => {
      const schema = buildSchema(/* GraphQL */ `
        "custom enum"
        enum MyEnum {
          "this is a"
          A
          "this is b"
          B
        }
      `);
      const result = (await plugin(
        schema,
        [],
        { enumsAsTypes: true, disableDescriptions: false },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
      /** custom enum */
      export type MyEnum =
        /** this is a */
        | 'A'
        /** this is b */
        | 'B';`);
    });
  });

  describe('Issues', () => {
    it('#6815 - Generate different type for Maybe wrapper based on input variables', async () => {
      const testSchema = buildSchema(/* GraphQL */ `
        type Query {
          test(id: ID): String
          testWithInput(filter: Filter): String
        }

        input Filter {
          a: String
          b: Int
        }
      `);

      const result = (await plugin(
        testSchema,
        [],
        {
          maybeValue: 'T | null',
          inputMaybeValue: 'T | null | undefined',
        },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;

      const output = mergeOutputs([result]);
      expect(output).toContain(`export type InputMaybe<T> = T | null | undefined;`);
      expect(output).toContain(`export type Maybe<T> = T | null;`);
      expect(output).toContain(`test?: Maybe<Scalars['String']['output']>;`);
      expect(output).toContain(`id?: InputMaybe<Scalars['ID']['input']>;`);
      expect(output).toContain(`filter?: InputMaybe<Filter>;`);
      expect(output).toContain(`a?: InputMaybe<Scalars['String']['input']>;`);
      expect(output).toContain(`b?: InputMaybe<Scalars['Int']['input']>;`);
    });

    it('#5643 - Incorrect combinations of declartionKinds leads to syntax error', async () => {
      const testSchema = buildSchema(/* GraphQL */ `
        interface Base {
          id: ID!
        }

        type MyType implements Base {
          id: ID!
        }

        type Query {
          t: MyType!
        }
      `);

      const result = (await plugin(
        testSchema,
        [],
        {
          declarationKind: {
            type: 'class',
            interface: 'interface',
          },
        },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;
      const output = mergeOutputs([result]);
      expect(output).not.toContain(`export class MyType extends Base {`);
      expect(output).toContain(`export class MyType implements Base {`);
    });

    it('#4564 - numeric enum values set on schema level', async () => {
      const testSchema = new GraphQLSchema({
        types: [
          new GraphQLObjectType({
            name: 'Query',
            fields: {
              test: {
                type: new GraphQLEnumType({
                  name: 'MyEnum',
                  values: {
                    missing: {
                      value: 0,
                    },
                  },
                }),
              },
            },
          }),
        ],
      });

      const result = (await plugin(testSchema, [], {}, { outputFile: '' })) as Types.ComplexPluginOutput;
      const output = mergeOutputs([result]);
      expect(output).not.toContain(`Missing = 'missing'`);
      expect(output).toContain(`Missing = 0`);
    });

    it('#4564 - numeric enum values set on schema level - complex numeric', async () => {
      const testSchema = new GraphQLSchema({
        types: [
          new GraphQLObjectType({
            name: 'Query',
            fields: {
              test: {
                type: new GraphQLEnumType({
                  name: 'MyEnum',
                  values: {
                    available: {
                      value: '01',
                    },
                    somethingElse: {
                      value: '99',
                    },
                  },
                }),
              },
            },
          }),
        ],
      });

      const result = (await plugin(testSchema, [], {}, { outputFile: '' })) as Types.ComplexPluginOutput;
      const output = mergeOutputs([result]);
      expect(output).toContain(`Available = '01'`);
      expect(output).toContain(`SomethingElse = '99'`);
    });

    it('#7898 - falsy enum value set on schema with enumsAsTypes set', async () => {
      const testSchema = new GraphQLSchema({
        types: [
          new GraphQLObjectType({
            name: 'Query',
            fields: {
              test: {
                type: new GraphQLEnumType({
                  name: 'MyEnum',
                  values: {
                    EnumValueName: {
                      value: 0,
                    },
                  },
                }),
              },
            },
          }),
        ],
      });

      const result = (await plugin(
        testSchema,
        [],
        { enumsAsTypes: true },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;
      const output = mergeOutputs([result]);
      expect(output).not.toContain('EnumValueName');
      expect(output).toContain('0');
    });

    it('#6532 - numeric enum values with namingConvention', async () => {
      const testSchema = buildSchema(/* GraphQL */ `
        type Query {
          test: Test!
        }

        enum Test {
          Boop
          BIP
          BaP
          TEST_VALUE
        }
      `);

      const result = (await plugin(
        testSchema,
        [],
        {
          numericEnums: true,
        },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;
      const output = mergeOutputs([result]);
      expect(output).toBeSimilarStringTo(`export enum Test {
        Boop = 0,
        Bip = 1,
        BaP = 2,
        TestValue = 3
      }`);
    });

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
        C = '2'
      }`);
    });

    it('#4157 - Should generate numeric values for enums if numericEnums is set to true', async () => {
      const testSchema = buildSchema(/* GraphQl */ `
        enum Status {
            Idle
            Running
            Error
        }
      `);

      const result = (await plugin(
        testSchema,
        [],
        {
          numericEnums: true,
        },
        {
          outputFile: '',
        }
      )) as Types.ComplexPluginOutput;
      const output = mergeOutputs([result]);
      validateTs(output);

      expect(output).toBeSimilarStringTo(`
        export enum Status {
            Idle = 0,
            Running = 1,
            Error = 2
        }
      `);
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
        i?: InputMaybe<IUpdateFilterOptionInput>;
        t?: InputMaybe<FilterOption>;
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
          namingConvention: { enumValues: 'change-case-all#constantCase' },
          enumValues: {
            MyEnum: './files#default as MyEnum',
          },
        },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;

      expect(result.prepend[0]).toBe(`import MyEnum from './files';`);
    });

    it('#4834 - enum members should be quoted if numeric', async () => {
      const testSchema = buildSchema(/* GraphQL */ `
        enum MediaItemSizeEnum {
          AXB
          _1X2
          _3X4
        }
      `);

      const result = (await plugin(testSchema, [], {})) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`export enum MediaItemSizeEnum {
        Axb = 'AXB',
        '1X2' = '_1X2',
        '3X4' = '_3X4'
      }`);
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
          namingConvention: { enumValues: 'change-case-all#constantCase' },
          enumValues: {
            MyEnum: './files#MyEnum',
          },
        },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`export type ITest = {
        __typename?: 'Test';
       t?: Maybe<MyEnum>;
       test?: Maybe<Scalars['String']['output']>;
     };`);

      expect(result.content).toBeSimilarStringTo(`export type ITestTestArgs = {
      a?: InputMaybe<MyEnum>;
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
      const schema = buildSchema(/* GraphQL */ `
        input MyInput {
          f: String!
        }
      `);

      const result = (await plugin(
        schema,
        [],
        { immutableTypes: true },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
      export type MyInput = {
        readonly f: Scalars['String']['input'];
      };`);
      validateTs(result);
    });

    it('#3141 - @deprecated directive support', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type User {
          fullName: String!
          firstName: String! @deprecated(reason: "Field \`fullName\` has been superseded by \`firstName\`.")
        }
      `);

      const result = await plugin(schema, [], {}, { outputFile: '' });
      expect(result.content).toBeSimilarStringTo(`
      export type User = {
        __typename?: 'User';
        fullName: Scalars['String']['output'];
        /** @deprecated Field \`fullName\` has been superseded by \`firstName\`. */
        firstName: Scalars['String']['output'];
      };`);
      validateTs(result);
    });

    it('#7627 - enum value @deprecated directive support', async () => {
      const schema = buildSchema(`
      enum MyEnum {
        A
        B @deprecated(reason: "Enum value \`B\` has been deprecated.")
      }`);

      const result = await plugin(schema, [], {}, { outputFile: '' });
      expect(result.content).toBeSimilarStringTo(`
      export enum MyEnum {
        A = 'A',
        /** @deprecated Enum value \`B\` has been deprecated. */
        B = 'B'
      }`);
      validateTs(result);
    });

    it('#7766 - input value @deprecated directive support', async () => {
      const schema = buildSchema(/* GraphQL */ `
        input MyInput {
          A: Int
          B: Int @deprecated(reason: "input value \`B\` has been deprecated.")
        }
      `);

      const result = await plugin(schema, [], {}, { outputFile: '' });
      expect(result.content).toBeSimilarStringTo(`
      export type MyInput = {
        A?: InputMaybe<Scalars['Int']['input']>;
        /** @deprecated input value \`B\` has been deprecated. */
        B?: InputMaybe<Scalars['Int']['input']>;
      };`);
      validateTs(result);
    });

    it('#1462 - Union of scalars and argument of directive', async () => {
      const schema = buildSchema(/* GraphQL */ `
        union Any = String | Int | Float | ID

        directive @default(value: Any) on ENUM_VALUE | FIELD_DEFINITION

        type CardEdge {
          count: Int! @default(value: 1)
        }
      `);

      const result = await plugin(schema, [], {}, { outputFile: '' });
      expect(result.content).toBeSimilarStringTo(
        `export type Any = Scalars['String']['output'] | Scalars['Int']['output'] | Scalars['Float']['output'] | Scalars['ID']['output'];`
      );
      expect(result.content).toBeSimilarStringTo(`
      export type CardEdge = {
        __typename?: 'CardEdge';
        count: Scalars['Int']['output'];
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

      const result = (await plugin(
        schema,
        [],
        { addUnderscoreToArgsType: true },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;

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
            id: Scalars['ID']['output'];
            userId: Scalars['ID']['output'];
            suggestionType: SuggestionType;
            text: Scalars['String']['output'];
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
            userId: Scalars['ID']['input'];
            suggestionType: SuggestionType;
          }
      `);
    });
  });

  describe('Config', () => {
    it('Should build type correctly when specified with avoidOptionals config', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type MyType {
          foo: String
          bar: String!
        }
      `);
      const result = (await plugin(
        schema,
        [],
        { avoidOptionals: true },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
        export type MyType = {
          __typename?: 'MyType';
          foo: Maybe<Scalars['String']['output']>;
          bar: Scalars['String']['output'];
        };
      `);
      validateTs(result);
    });

    it('Should build input type correctly when specified with avoidInputOptionals config', async () => {
      const schema = buildSchema(/* GraphQL */ `
        input MyInput {
          foo: String
          bar: String!
        }
      `);
      const result = (await plugin(
        schema,
        [],
        { avoidOptionals: { inputValue: true } },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
        export type MyInput = {
          foo: InputMaybe<Scalars['String']['input']>;
          bar: Scalars['String']['input'];
        }
      `);

      validateTs(result);
    });

    it('Should build type correctly when specified with immutableTypes config', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type MyType {
          foo: [String!]!
        }
      `);
      const result = (await plugin(
        schema,
        [],
        { immutableTypes: true },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
        export type MyType = {
          readonly  __typename?: 'MyType';
          readonly foo: ReadonlyArray<Scalars['String']['output']>;
        };
      `);
      validateTs(result);
    });

    it('Should use const enums when constEnums is set', async () => {
      const schema = buildSchema(`
      enum MyEnum {
        A
      }`);
      const result = await plugin(schema, [], { constEnums: true }, { outputFile: '' });

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
      const result = (await plugin(
        schema,
        [],
        { enumsAsTypes: true },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
        export type MyEnum =
          | 'A'
          | 'B';
      `);
      validateTs(result);
    });

    it('Should use enum as type when enumsAsTypes is set and also enumValues', async () => {
      const schema = buildSchema(`
      enum MyEnum {
        A
        B
      }`);
      const result = (await plugin(
        schema,
        [],
        { enumValues: { MyEnum: { A: 'BOOP' } }, enumsAsTypes: true },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
        export type MyEnum =
          | 'BOOP'
          | 'B';
      `);
      validateTs(result);
    });

    it('Should add `%future added value` to enum when futureProofEnums is set and also enumAsTypes', async () => {
      const schema = buildSchema(`
      enum MyEnum {
        A
        B
      }

      type MyType {
        required: MyEnum!
        optional: MyEnum
      }
      `);
      const result = (await plugin(
        schema,
        [],
        { enumsAsTypes: true, futureProofEnums: true },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
      export type MyEnum =
        | 'A'
        | 'B'
        | '%future added value'
    `);
      expect(result.content).toBeSimilarStringTo(`
        export type MyType = {
          __typename?: 'MyType';
          required: MyEnum;
          optional?: Maybe<MyEnum>;
        }
      `);
      validateTs(result);
    });

    it('Should add `%future added value` to enum usage when futureProofEnums is set, but not enumAsTypes', async () => {
      const schema = buildSchema(`
        enum MyEnum {
          A
          B
        }

        type MyType {
          required: MyEnum!
          optional: MyEnum
        }
      `);
      const result = (await plugin(
        schema,
        [],
        { futureProofEnums: true },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
        export enum MyEnum {
          A = 'A',
          B = 'B'
        }
      `);

      expect(result.content).toBeSimilarStringTo(`
        export type MyType = {
          __typename?: 'MyType';
          required: MyEnum | '%future added value';
          optional?: Maybe<MyEnum | '%future added value'>;
        }
      `);
      validateTs(result);
    });

    it('Should add `%future added value` to enum usage when futureProofEnums is set and allowEnumStringTypes is set', async () => {
      const schema = buildSchema(`
        enum MyEnum {
          A
          B
        }

        type MyType {
          required: MyEnum!
          optional: MyEnum
        }
      `);
      const result = (await plugin(
        schema,
        [],
        { futureProofEnums: true, allowEnumStringTypes: true },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
        export enum MyEnum {
          A = 'A',
          B = 'B'
        }
      `);

      expect(result.content).toBeSimilarStringTo(`
        export type MyType = {
          __typename?: 'MyType';
          required: MyEnum | '%future added value' | \`\${MyEnum}\`;
          optional?: Maybe<MyEnum | '%future added value' | \`\${MyEnum}\`>;
        }
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
            typeNames: 'change-case-all#lowerCase',
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
          a: Scalars['String']['input'];
          b?: InputMaybe<Scalars['String']['input']>;
          c?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
          d: Array<Scalars['Int']['input']>;
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
            enumValues: 'change-case-all#lowerCase',
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
            enumValues: 'change-case-all#lowerCase',
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
          a: Scalars['String']['input'];
          b?: InputMaybe<Scalars['String']['input']>;
          c?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
          d: Array<Scalars['Int']['input']>;
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
        /** Indicates this type is an interface. \`fields\`, \`interfaces\`, and \`possibleTypes\` are valid fields. */
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
      const schema = buildSchema(/* GraphQL */ `
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
          id: Scalars['ID']['input'];
          displayName?: InputMaybe<Scalars['String']['input']>;
        }
      `);

      expect(result.content).toBeSimilarStringTo(`
        export class MyType {
          __typename?: 'MyType';
          id: Scalars['ID']['output'];
          displayName?: Maybe<Scalars['String']['output']>;
        }
      `);

      validateTs(result);
    });

    it('Should use interface for type when declarationKind for types is set', async () => {
      const schema = buildSchema(/* GraphQL */ `
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
          id: Scalars['ID']['input'];
          displayName?: InputMaybe<Scalars['String']['input']>;
        }
      `);

      expect(result.content).toBeSimilarStringTo(`
        export interface MyType {
          __typename?: 'MyType';
          id: Scalars['ID']['output'];
          displayName?: Maybe<Scalars['String']['output']>;
        }
      `);
      validateTs(result);
    });

    it('Should use interface for input when declarationKind for inputs is set', async () => {
      const schema = buildSchema(/* GraphQL */ `
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
          id: Scalars['ID']['input'];
          displayName?: InputMaybe<Scalars['String']['input']>;
        }
      `);

      expect(result.content).toBeSimilarStringTo(`
        export type MyType = {
          __typename?: 'MyType';
          id: Scalars['ID']['output'];
          displayName?: Maybe<Scalars['String']['output']>;
        }
      `);
      validateTs(result);
    });

    it('Should use interface for arguments when declarationKind for arguments is set', async () => {
      const schema = buildSchema(/* GraphQL */ `
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
          id: Scalars['ID']['output'];
          displayName?: Maybe<Scalars['String']['output']>;
          child?: Maybe<MyType>;
        }
      `);

      expect(result.content).toBeSimilarStringTo(`
        export interface MyTypeChildArgs {
          id: Scalars['ID']['input'];
        }
      `);
      validateTs(result);
    });

    it('Should use interface for all objects when declarationKind is interface', async () => {
      const schema = buildSchema(/* GraphQL */ `
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
          id: Scalars['ID']['input'];
          displayName?: InputMaybe<Scalars['String']['input']>;
        }
      `);

      expect(result.content).toBeSimilarStringTo(`
        export interface MyType {
          __typename?: 'MyType';
          id: Scalars['ID']['output'];
          displayName?: Maybe<Scalars['String']['output']>;
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
      const schema = buildSchema(/* GraphQL */ `
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
          id: Scalars['ID']['output'];
          displayName?: Maybe<Scalars['String']['output']>;
        }
      `);

      expect(result.content).toBeSimilarStringTo(`
        export interface MyType extends MyInterface {
          __typename?: 'MyType';
          id: Scalars['ID']['output'];
          displayName?: Maybe<Scalars['String']['output']>;
          value?: Maybe<Scalars['Int']['output']>;
        }
      `);
      validateTs(result);
    });

    it('Should extend mutiple interfaces', async () => {
      const schema = buildSchema(/* GraphQL */ `
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
          id: Scalars['ID']['output'];
          displayName?: Maybe<Scalars['String']['output']>;
        }
      `);

      expect(result.content).toBeSimilarStringTo(`
        export interface MyInterface2 {
          value?: Maybe<Scalars['Int']['output']>;
        }
      `);

      expect(result.content).toBeSimilarStringTo(`
        export interface MyType extends MyInterface1, MyInterface2 {
          __typename?: 'MyType';
          id: Scalars['ID']['output'];
          displayName?: Maybe<Scalars['String']['output']>;
          value?: Maybe<Scalars['Int']['output']>;
        }
      `);
      validateTs(result);
    });
  });

  describe('Scalars', () => {
    it('Should generate a scalars mapping correctly for built-in scalars', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type MyType {
          foo: String
          bar: String!
        }
      `);
      const result = await plugin(schema, [], {}, { outputFile: '' });

      expect(result.content).toBeSimilarStringTo(`
      export type Scalars = {
        ID: { input: string; output: string;   }
        String: { input: string; output: string;   }
        Boolean: { input: boolean; output: boolean;   }
        Int: { input: number; output: number;   }
        Float: { input: number; output: number;   }
      };`);

      expect(result.content).toBeSimilarStringTo(`
      export type MyType = {
        __typename?: 'MyType';
        foo?: Maybe<Scalars['String']['output']>;
        bar: Scalars['String']['output'];
      };`);
      validateTs(result);
    });

    it('Should generate a scalars mapping correctly when using scalars as path', async () => {
      const schema = buildSchema(/* GraphQL */ `
        scalar MyScalar
        scalar MyScalarInput

        type MyType {
          foo: String
          bar: MyScalar!
          baz(input: MyScalarInput): MyScalarInput
        }
      `);
      const result = (await plugin(
        schema,
        [],
        {
          scalars: '../../scalars',
        },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;

      expect(result.prepend).toContain(`import { MyScalar } from '../../scalars';`);
      expect(result.prepend).toContain(`import { MyScalarInput } from '../../scalars';`);
      expect(result.prepend).toContain(`import { String } from '../../scalars';`);
      expect(result.prepend).toContain(`import { Boolean } from '../../scalars';`);
      expect(result.content).toBeSimilarStringTo(`
        export type Scalars = {
          ID: { input: string; output: string; }
          String: { input: String['input']; output: String['output']; }
          Boolean: { input: Boolean['input']; output: Boolean['output']; }
          Int: { input: number; output: number; }
          Float: { input: number; output: number; }
          MyScalar: { input: MyScalar['input']; output: MyScalar['output']; }
          MyScalarInput: { input: MyScalarInput['input']; output: MyScalarInput['output']; }
        };`);

      expect(result.content).toBeSimilarStringTo(`
        export type MyType = {
          __typename?: 'MyType';
          foo?: Maybe<Scalars['String']['output']>;
          bar: Scalars['MyScalar']['output'];
          baz?: Maybe<Scalars['MyScalarInput']['output']>;
        };`);
      expect(result.content).toBeSimilarStringTo(`
        export type MyTypeBazArgs = {
          input?: InputMaybe<Scalars['MyScalarInput']['input']>;
        };`);
      validateTs(result);
    });

    it('Should import a type of a mapped scalar', async () => {
      const schema = buildSchema(/* GraphQL */ `
        scalar MyScalar
        scalar MyOtherScalar
        scalar MyAliasedScalar
        scalar OrgScalar
        scalar OrgOtherScalar
        scalar OrgAliasedScalar

        type MyType {
          foo: String
          bar: MyScalar!
          baz: MyOtherScalar!
          qux: MyAliasedScalar!
          tux(in: MyScalar!): MyScalar!
          ay: OrgScalar!
          bee: OrgOtherScalar!
          ce: OrgAliasedScalar!
        }
      `);
      const result = (await plugin(
        schema,
        [],
        {
          scalars: {
            MyScalar: '../../scalars#default',
            MyOtherScalar: '../../scalars#MyOtherScalar',
            MyAliasedScalar: '../../scalars#MyAliasedScalar as AliasedScalar',
            OrgScalar: '@org/scalars#default',
            OrgOtherScalar: '@org/scalars#OrgOtherScalar',
            OrgAliasedScalar: '@org/scalars#OrgOtherScalar as OrgAliasedScalar',
          },
        },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;

      // It seems like we don't group imports...
      expect(result.prepend).toContain(`import MyScalar from '../../scalars';`);
      expect(result.prepend).toContain(`import { MyOtherScalar } from '../../scalars';`);
      expect(result.prepend).toContain(`import { MyAliasedScalar as AliasedScalar } from '../../scalars';`);
      expect(result.prepend).toContain(`import OrgScalar from '@org/scalars';`);
      expect(result.prepend).toContain(`import { OrgOtherScalar } from '@org/scalars';`);
      expect(result.prepend).toContain(`import { OrgOtherScalar as OrgAliasedScalar } from '@org/scalars';`);
      expect(result.content).toBeSimilarStringTo(`
        export type Scalars = {
          ID: { input: string; output: string; }
          String: { input: string; output: string; }
          Boolean: { input: boolean; output: boolean; }
          Int: { input: number; output: number; }
          Float: { input: number; output: number; }
          MyScalar: { input: MyScalar; output: MyScalar; }
          MyOtherScalar: { input: MyOtherScalar; output: MyOtherScalar; }
          MyAliasedScalar: { input: AliasedScalar; output: AliasedScalar; }
          OrgScalar: { input: OrgScalar; output: OrgScalar; }
          OrgOtherScalar: { input: OrgOtherScalar; output: OrgOtherScalar; }
          OrgAliasedScalar: { input: OrgAliasedScalar; output: OrgAliasedScalar; }
        };`);

      expect(result.content).toBeSimilarStringTo(`
        export type MyType = {
          __typename?: 'MyType';
          foo?: Maybe<Scalars['String']['output']>;
          bar: Scalars['MyScalar']['output'];
          baz: Scalars['MyOtherScalar']['output'];
          qux: Scalars['MyAliasedScalar']['output'];
          tux: Scalars['MyScalar']['output'];
          ay: Scalars['OrgScalar']['output'];
          bee: Scalars['OrgOtherScalar']['output'];
          ce: Scalars['OrgAliasedScalar']['output'];
        };`);
      expect(result.content).toBeSimilarStringTo(`
        export type MyTypeTuxArgs = {
          in: Scalars['MyScalar']['input'];
        }`);
      validateTs(result);
    });

    it('Should import a type of a mapped scalar for input/output mapping', async () => {
      const schema = buildSchema(/* GraphQL */ `
        scalar MyScalar
        scalar MyOtherScalar
        scalar MyAliasedScalar
        scalar OrgScalar
        scalar OrgOtherScalar
        scalar OrgAliasedScalar

        type MyType {
          foo: String
          bar: MyScalar!
          baz: MyOtherScalar!
          qux: MyAliasedScalar!
          tux(in: MyScalar!): MyScalar!
          ay: OrgScalar!
          bee: OrgOtherScalar!
          ce: OrgAliasedScalar!
        }
      `);
      const result = (await plugin(
        schema,
        [],
        {
          scalars: {
            MyScalar: {
              input: '../../scalarsInput#default as MyScalarInput',
              output: '../../scalarsOutput#default as MyScalarOutput',
            },
            MyOtherScalar: {
              input: '../../scalars#MyOtherScalarInput',
              output: '../../scalars#MyOtherScalarOutput',
            },
            MyAliasedScalar: {
              input: '../../scalars#MyAliasedScalar as AliasedScalarInput',
              output: '../../scalars#MyAliasedScalar as AliasedScalarOutput',
            },
            OrgScalar: {
              input: '@org/scalars-input#default as OrgScalarInput',
              output: '@org/scalars-output#default as OrgScalarOutput',
            },
            OrgOtherScalar: {
              input: '@org/scalars#OrgOtherScalarInput',
              output: '@org/scalars#OrgOtherScalarOutput',
            },
            OrgAliasedScalar: {
              input: '@org/scalars#OrgOtherScalar as OrgAliasedScalarInput',
              output: '@org/scalars#OrgOtherScalar as OrgAliasedScalarOutput',
            },
          },
        },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;

      expect(result.prepend).toContain(`import MyScalarInput from '../../scalarsInput';`);
      expect(result.prepend).toContain(`import MyScalarOutput from '../../scalarsOutput';`);
      expect(result.prepend).toContain(`import { MyOtherScalarInput } from '../../scalars';`);
      expect(result.prepend).toContain(`import { MyOtherScalarOutput } from '../../scalars';`);
      expect(result.prepend).toContain(`import { MyAliasedScalar as AliasedScalarInput } from '../../scalars';`);
      expect(result.prepend).toContain(`import { MyAliasedScalar as AliasedScalarOutput } from '../../scalars';`);
      expect(result.prepend).toContain(`import OrgScalarInput from '@org/scalars-input';`);
      expect(result.prepend).toContain(`import OrgScalarOutput from '@org/scalars-output';`);
      expect(result.prepend).toContain(`import { OrgOtherScalarInput } from '@org/scalars';`);
      expect(result.prepend).toContain(`import { OrgOtherScalarOutput } from '@org/scalars';`);
      expect(result.prepend).toContain(`import { OrgOtherScalar as OrgAliasedScalarInput } from '@org/scalars';`);
      expect(result.prepend).toContain(`import { OrgOtherScalar as OrgAliasedScalarOutput } from '@org/scalars';`);
      expect(result.content).toBeSimilarStringTo(`
        export type Scalars = {
          ID: { input: string; output: string; }
          String: { input: string; output: string; }
          Boolean: { input: boolean; output: boolean; }
          Int: { input: number; output: number; }
          Float: { input: number; output: number; }
          MyScalar: { input: MyScalarInput; output: MyScalarOutput; }
          MyOtherScalar: { input: MyOtherScalarInput; output: MyOtherScalarOutput; }
          MyAliasedScalar: { input: AliasedScalarInput; output: AliasedScalarOutput; }
          OrgScalar: { input: OrgScalarInput; output: OrgScalarOutput; }
          OrgOtherScalar: { input: OrgOtherScalarInput; output: OrgOtherScalarOutput; }
          OrgAliasedScalar: { input: OrgAliasedScalarInput; output: OrgAliasedScalarOutput; }
        };`);

      expect(result.content).toBeSimilarStringTo(`
        export type MyType = {
          __typename?: 'MyType';
          foo?: Maybe<Scalars['String']['output']>;
          bar: Scalars['MyScalar']['output'];
          baz: Scalars['MyOtherScalar']['output'];
          qux: Scalars['MyAliasedScalar']['output'];
          tux: Scalars['MyScalar']['output'];
          ay: Scalars['OrgScalar']['output'];
          bee: Scalars['OrgOtherScalar']['output'];
          ce: Scalars['OrgAliasedScalar']['output'];
        };`);
      expect(result.content).toBeSimilarStringTo(`
        export type MyTypeTuxArgs = {
          in: Scalars['MyScalar']['input'];
        }`);
      validateTs(result);
    });

    it('Should generate a scalars mapping correctly for custom scalars', async () => {
      const schema = buildSchema(/* GraphQL */ `
        scalar MyScalar

        type MyType {
          foo: String
          bar: MyScalar!
          buz(input: MyScalar!): MyScalar!
        }
      `);
      const result = await plugin(schema, [], {}, { outputFile: '' });

      expect(result.content).toBeSimilarStringTo(`
        export type Scalars = {
          ID: { input: string; output: string; }
          String: { input: string; output: string; }
          Boolean: { input: boolean; output: boolean; }
          Int: { input: number; output: number; }
          Float: { input: number; output: number; }
          MyScalar: { input: any; output: any; }
        };`);

      expect(result.content).toBeSimilarStringTo(`
        export type MyType = {
          __typename?: 'MyType';
          foo?: Maybe<Scalars['String']['output']>;
          bar: Scalars['MyScalar']['output'];
          buz: Scalars['MyScalar']['output'];
        };`);
      expect(result.content).toBeSimilarStringTo(`
        export type MyTypeBuzArgs = {
          input: Scalars['MyScalar']['input'];
        }`);
      validateTs(result);
    });

    it('Should generate a scalars mapping correctly for custom scalars with mapping', async () => {
      const schema = buildSchema(/* GraphQL */ `
        scalar MyScalar

        type MyType {
          foo: String
          bar: MyScalar!
          buz(input: MyScalar!): MyScalar!
        }
      `);
      const result = (await plugin(
        schema,
        [],
        { scalars: { MyScalar: 'Date' } },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
        export type Scalars = {
          ID: { input: string; output: string; }
          String: { input: string; output: string; }
          Boolean: { input: boolean; output: boolean; }
          Int: { input: number; output: number; }
          Float: { input: number; output: number; }
          MyScalar: { input: Date; output: Date; }
        };`);

      expect(result.content).toBeSimilarStringTo(`
        export type MyType = {
          __typename?: 'MyType';
          foo?: Maybe<Scalars['String']['output']>;
          bar: Scalars['MyScalar']['output'];
          buz: Scalars['MyScalar']['output'];
        };`);
      expect(result.content).toBeSimilarStringTo(`
        export type MyTypeBuzArgs = {
          input: Scalars['MyScalar']['input'];
        }`);
      validateTs(result);
    });

    it('Should generate a scalars mapping correctly for custom scalars with input/output mapping', async () => {
      const schema = buildSchema(/* GraphQL */ `
        scalar MyScalar

        type MyType {
          foo: String
          bar: MyScalar!
          buz(input: MyScalar!): MyScalar!
        }
      `);
      const result = (await plugin(
        schema,
        [],
        { scalars: { MyScalar: { input: 'bigint', output: 'number | bigint' } } },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
        export type Scalars = {
          ID: { input: string; output: string; }
          String: { input: string; output: string; }
          Boolean: { input: boolean; output: boolean; }
          Int: { input: number; output: number; }
          Float: { input: number; output: number; }
          MyScalar: { input: bigint; output: number | bigint; }
        };`);

      expect(result.content).toBeSimilarStringTo(`
        export type MyType = {
          __typename?: 'MyType';
          foo?: Maybe<Scalars['String']['output']>;
          bar: Scalars['MyScalar']['output'];
          buz: Scalars['MyScalar']['output'];
        };`);
      expect(result.content).toBeSimilarStringTo(`
        export type MyTypeBuzArgs = {
          input: Scalars['MyScalar']['input'];
        }`);
      validateTs(result);
    });

    it('Should correctly throw an error when an unknown scalar is detected while using `strictScalars`', () => {
      const schema = buildSchema(/* GraphQL */ `
        scalar MyScalar

        type MyType {
          foo: String
          bar: MyScalar!
        }
      `);

      expect(() => {
        plugin(schema, [], { strictScalars: true }, { outputFile: '' });
      }).toThrow('Unknown scalar type MyScalar');
    });

    it('Should allow overriding default scalar type', async () => {
      const schema = buildSchema(/* GraphQL */ `
        scalar MyScalar

        type MyType {
          foo: String
          bar: MyScalar!
          buz(input: MyScalar!): MyScalar!
        }
      `);
      const result = (await plugin(
        schema,
        [],
        { defaultScalarType: 'unknown' },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
        export type Scalars = {
          ID: { input: string; output: string; }
          String: { input: string; output: string; }
          Boolean: { input: boolean; output: boolean; }
          Int: { input: number; output: number; }
          Float: { input: number; output: number; }
          MyScalar: { input: unknown; output: unknown; }
        };`);

      expect(result.content).toBeSimilarStringTo(`
        export type MyType = {
          __typename?: 'MyType';
          foo?: Maybe<Scalars['String']['output']>;
          bar: Scalars['MyScalar']['output'];
          buz: Scalars['MyScalar']['output'];
        };`);
      expect(result.content).toBeSimilarStringTo(`
        export type MyTypeBuzArgs = {
          input: Scalars['MyScalar']['input'];
        }`);
      validateTs(result);
    });

    it('Should add FieldWrapper when field definition wrapping is enabled', async () => {
      const schema = buildSchema(`
      scalar A
      `);

      const result = (await plugin(
        schema,
        [],
        { wrapFieldDefinitions: true },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;
      expect(result.prepend).toBeSimilarStringTo('export type FieldWrapper<T> =');
      validateTs(result);
    });

    it('Should allow the FieldWrapper type to be modified', async () => {
      const schema = buildSchema(`
      scalar A
      `);

      const result = (await plugin(
        schema,
        [],
        { fieldWrapperValue: 'T | Promise<T>', wrapFieldDefinitions: true },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;
      expect(result.prepend).toBeSimilarStringTo('export type FieldWrapper<T> = T | Promise<T>');
      validateTs(result);
    });
  });

  describe('Object (type)', () => {
    it('Should build type correctly', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type MyType {
          foo: String
          bar: String!
        }
      `);
      const result = await plugin(schema, [], {}, { outputFile: '' });

      expect(result.content).toBeSimilarStringTo(`
        export type MyType = {
          __typename?: 'MyType';
          foo?: Maybe<Scalars['String']['output']>;
          bar: Scalars['String']['output'];
        };
      `);
      validateTs(result);
    });

    it('Should build type correctly when implementing interface', async () => {
      const schema = buildSchema(/* GraphQL */ `
        interface MyInterface {
          foo: String!
        }

        type MyType implements MyInterface {
          foo: String!
        }
      `);
      const result = await plugin(schema, [], {}, { outputFile: '' });

      expect(result.content).toBeSimilarStringTo(`
        export type MyInterface = {
          foo: Scalars['String']['output'];
        };
      `);
      expect(result.content).toBeSimilarStringTo(`
        export type MyType = MyInterface & {
          __typename?: 'MyType';
          foo: Scalars['String']['output'];
        };
      `);
      validateTs(result);
    });

    it('Should build type correctly when implementing multiple interfaces', async () => {
      const schema = buildSchema(/* GraphQL */ `
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
      const result = await plugin(schema, [], {}, { outputFile: '' });

      expect(result.content).toBeSimilarStringTo(`
        export type MyInterface = {
          foo: Scalars['String']['output'];
        };
      `);
      expect(result.content).toBeSimilarStringTo(`
        export type MyOtherInterface = {
          bar: Scalars['String']['output'];
        };
      `);
      expect(result.content).toBeSimilarStringTo(`
        export type MyType = MyInterface & MyOtherInterface & {
          __typename?: 'MyType';
          foo: Scalars['String']['output'];
          bar: Scalars['String']['output'];
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
      const result = await plugin(schema, [], {}, { outputFile: '' });

      expect(result.content).toBeSimilarStringTo(`
        export type MyInterface = {
          foo: Scalars['String']['output'];
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
      const schema = buildSchema(/* GraphQL */ `
        type MyType {
          foo: MyOtherType!
        }

        type MyOtherType {
          bar: String!
        }
      `);
      const result = await plugin(schema, [], {}, { outputFile: '' });

      expect(result.content).toBeSimilarStringTo(`
        export type MyType = {
          __typename?: 'MyType';
          foo: MyOtherType;
        };
      `);
      expect(result.content).toBeSimilarStringTo(`
        export type MyOtherType = {
          __typename?: 'MyOtherType';
          bar: Scalars['String']['output'];
        };
      `);
      validateTs(result);
    });

    it('Should build type correctly when wrapping field definitions', async () => {
      const schema = buildSchema(/* GraphQL */ `
        interface MyInterface {
          foo: String!
        }

        type MyType implements MyInterface {
          foo: String!
        }
      `);
      const result = (await plugin(
        schema,
        [],
        { wrapFieldDefinitions: true },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
        export type MyInterface = {
          foo: FieldWrapper<Scalars['String']['output']>;
        };
      `);
      expect(result.content).toBeSimilarStringTo(`
        export type MyType = MyInterface & {
          __typename?: 'MyType';
          foo: FieldWrapper<Scalars['String']['output']>;
        };
      `);
      validateTs(result);
    });

    it('Should build list type correctly when wrapping field definitions', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type ListOfStrings {
          foo: [String!]!
        }

        type ListOfMaybeStrings {
          foo: [String]!
        }
      `);
      const result = (await plugin(
        schema,
        [],
        { wrapFieldDefinitions: true },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
        export type ListOfStrings = {
          __typename?: 'ListOfStrings';
          foo: Array<FieldWrapper<Scalars['String']['output']>>;
        };
      `);

      expect(result.content).toBeSimilarStringTo(`
        export type ListOfMaybeStrings = {
          __typename?: 'ListOfMaybeStrings';
          foo: Array<Maybe<FieldWrapper<Scalars['String']['output']>>>;
        };
      `);

      validateTs(result);
    });

    it('Should build list type correctly when wrapping entire field definitions', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type ListOfStrings {
          foo: [String!]!
        }

        type ListOfMaybeStrings {
          foo: [String]!
        }
      `);
      const result = (await plugin(
        schema,
        [],
        { wrapEntireFieldDefinitions: true },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
        export type ListOfStrings = {
          __typename?: 'ListOfStrings';
          foo: EntireFieldWrapper<Array<Scalars['String']['output']>>;
        };
      `);

      expect(result.content).toBeSimilarStringTo(`
        export type ListOfMaybeStrings = {
          __typename?: 'ListOfMaybeStrings';
          foo: EntireFieldWrapper<Array<Maybe<Scalars['String']['output']>>>;
        };
      `);

      validateTs(result);
    });

    it('Should build list type correctly when wrapping both field definitions and entire field definitions', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type ListOfStrings {
          foo: [String!]!
        }

        type ListOfMaybeStrings {
          foo: [String]!
        }
      `);
      const result = (await plugin(
        schema,
        [],
        { wrapEntireFieldDefinitions: true, wrapFieldDefinitions: true },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
        export type ListOfStrings = {
          __typename?: 'ListOfStrings';
          foo: EntireFieldWrapper<Array<FieldWrapper<Scalars['String']['output']>>>;
        };
      `);

      expect(result.content).toBeSimilarStringTo(`
        export type ListOfMaybeStrings = {
          __typename?: 'ListOfMaybeStrings';
          foo: EntireFieldWrapper<Array<Maybe<FieldWrapper<Scalars['String']['output']>>>>;
        };
      `);

      validateTs(result);
    });

    it('Should not wrap input type fields', async () => {
      const schema = buildSchema(/* GraphQL */ `
        input MyInput {
          foo: String!
        }
      `);
      const result = (await plugin(
        schema,
        [],
        { wrapFieldDefinitions: true },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
        export type MyInput = {
          foo: Scalars['String']['input'];
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
      const result = await plugin(schema, [], {}, { outputFile: '' });
      expect(result.content).toBeSimilarStringTo(`
      export type MyUnion = MyType | MyOtherType;
    `);
      validateTs(result);
    });
    it('Should add `%other` object typename to union when futureProofUnions is set', async () => {
      const schema = buildSchema(`
      type MyType {
        foo: String!
      }

      type MyOtherType {
        bar: String!
      }

      union MyUnion = MyType | MyOtherType
      `);
      const result = await plugin(schema, [], { futureProofUnions: true }, { outputFile: '' });
      expect(result.content).toBeSimilarStringTo(`
      export type MyUnion = MyType | MyOtherType | { __typename?: "%other" };
    `);
      validateTs(result);
    });
    it('Should add `%other` object typename to union when futureProofUnions and immutableTypes is set', async () => {
      const schema = buildSchema(`
      type MyType {
        foo: String!
      }

      type MyOtherType {
        bar: String!
      }

      union MyUnion = MyType | MyOtherType
      `);
      const result = await plugin(schema, [], { futureProofUnions: true, immutableTypes: true }, { outputFile: '' });
      expect(result.content).toBeSimilarStringTo(`
      export type MyUnion = MyType | MyOtherType | { readonly __typename?: "%other" };
    `);
      validateTs(result);
    });
  });

  describe('Interface', () => {
    it('Should build interface correctly', async () => {
      const schema = buildSchema(/* GraphQL */ `
        interface MyInterface {
          foo: String
          bar: String!
        }
      `);
      const result = await plugin(schema, [], {}, { outputFile: '' });

      expect(result.content).toBeSimilarStringTo(`
        export type MyInterface = {
          foo?: Maybe<Scalars['String']['output']>;
          bar: Scalars['String']['output'];
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

      const result = await plugin(schema, [], {}, { outputFile: '' });

      expect(result.content).not.toContain('simple');
      expect(result.content).not.toContain('withArguments');
      expect(result.content).not.toContain('objSimple');
      expect(result.content).not.toContain('universal');
      validateTs(result);
    });

    it('Should handle type override', async () => {
      const schema = buildSchema(/* GraphQL */ `
        directive @AsNumber on ARGUMENT_DEFINITION | INPUT_FIELD_DEFINITION

        input MyInput {
          id: ID! @AsNumber
        }

        type Query {
          myField(id: ID! @AsNumber): Boolean
        }
      `);
      const result = await plugin(
        schema,
        [],
        { directiveArgumentAndInputFieldMappings: { AsNumber: 'number' } },
        { outputFile: '' }
      );

      expect(result.content).toBeSimilarStringTo(`
      export type DirectiveArgumentAndInputFieldMappings = {
        AsNumber: number;
      };
      `);
      expect(result.content).toBeSimilarStringTo(`
      export type MyInput = {
        id: DirectiveArgumentAndInputFieldMappings['AsNumber'];
      };

      export type Query = {
        __typename?: 'Query';
        myField?: Maybe<Scalars['Boolean']['output']>;
      };

      export type QueryMyFieldArgs = {
        id: DirectiveArgumentAndInputFieldMappings['AsNumber'];
      };
      `);
      validateTs(result);
    });

    it('Should allow imported types', async () => {
      const schema = buildSchema(/* GraphQL */ `
        directive @AsNumber on ARGUMENT_DEFINITION | INPUT_FIELD_DEFINITION

        input MyInput {
          id: ID! @AsNumber
        }
      `);
      const result = await plugin(
        schema,
        [],
        {
          directiveArgumentAndInputFieldMappings: { AsNumber: './someModule#MyType' },
          directiveArgumentAndInputFieldMappingTypeSuffix: 'Model',
        },
        { outputFile: '' }
      );

      expect(result.prepend).toContain("import { MyType as MyTypeModel } from './someModule';");
      expect(result.content).toBeSimilarStringTo(`
      export type DirectiveArgumentAndInputFieldMappings = {
        AsNumber: MyTypeModel;
      };
      `);
      expect(result.content).toBeSimilarStringTo(`
      export type MyInput = {
        id: DirectiveArgumentAndInputFieldMappings['AsNumber'];
      };
      `);
      validateTs(result);
    });

    it('Should use last directive override', async () => {
      const schema = buildSchema(/* GraphQL */ `
        directive @AsNumber on ARGUMENT_DEFINITION | INPUT_FIELD_DEFINITION
        directive @AsString on ARGUMENT_DEFINITION | INPUT_FIELD_DEFINITION

        input MyInput {
          id: ID! @AsNumber @AsString
        }
      `);
      const result = await plugin(
        schema,
        [],
        { directiveArgumentAndInputFieldMappings: { AsNumber: 'number', AsString: 'AsString' } },
        { outputFile: '' }
      );

      expect(result.content).toBeSimilarStringTo(`
      export type MyInput = {
        id: DirectiveArgumentAndInputFieldMappings['AsString'];
      };
      `);
      validateTs(result);
    });

    it('Should ignore unmapped directives', async () => {
      const schema = buildSchema(/* GraphQL */ `
        directive @AsNumber on ARGUMENT_DEFINITION | INPUT_FIELD_DEFINITION

        input MyInput {
          id: ID! @AsNumber
        }
      `);
      const result = await plugin(schema, [], { directiveArgumentAndInputFieldMappings: {} }, { outputFile: '' });

      expect(result.content).toBeSimilarStringTo(`
      export type MyInput = {
        id: Scalars['ID']['input'];
      };
      `);
      validateTs(result);
    });

    describe('@oneOf on input types', () => {
      const oneOfDirectiveDefinition = /* GraphQL */ `
        directive @oneOf on INPUT_OBJECT
      `;

      it('correct output for type with single field', async () => {
        const schema = buildSchema(
          /* GraphQL */ `
          input Input @oneOf {
            int: Int
          }

          type Query {
            foo(input: Input!): Boolean!
          }
        `.concat(oneOfDirectiveDefinition)
        );

        const result = await plugin(schema, [], {}, { outputFile: '' });

        expect(result.content).toBeSimilarStringTo(`
          export type Input =
            { int: Scalars['Int']['input']; };
        `);
      });

      it('correct output for type with multiple fields', async () => {
        const schema = buildSchema(
          /* GraphQL */ `
          input Input @oneOf {
            int: Int
            boolean: Boolean
          }

          type Query {
            foo(input: Input!): Boolean!
          }
        `.concat(oneOfDirectiveDefinition)
        );

        const result = await plugin(schema, [], {}, { outputFile: '' });

        expect(result.content).toBeSimilarStringTo(`
          export type Input =
            { int: Scalars['Int']['input']; boolean?: never; }
            | { int?: never; boolean: Scalars['Boolean']['input']; };
        `);
      });

      it('respects configured declaration kind with single field', async () => {
        const schema = buildSchema(
          /* GraphQL */ `
          input Input @oneOf {
            int: Int
          }

          type Query {
            foo(input: Input!): Boolean!
          }
        `.concat(oneOfDirectiveDefinition)
        );

        const result = await plugin(schema, [], { declarationKind: 'interface' }, { outputFile: '' });

        expect(result.content).toBeSimilarStringTo(`
          export interface Input {
            int: Scalars['Int']['input'];
          }
        `);
      });

      it('forces declaration kind of type with multiple fields', async () => {
        const schema = buildSchema(
          /* GraphQL */ `
          input Input @oneOf {
            int: Int
            boolean: Boolean
          }

          type Query {
            foo(input: Input!): Boolean!
          }
        `.concat(oneOfDirectiveDefinition)
        );

        const result = await plugin(schema, [], { declarationKind: 'interface' }, { outputFile: '' });

        expect(result.content).toBeSimilarStringTo(`
          export type Input =
            { int: Scalars['Int']['input']; boolean?: never; }
            | { int?: never; boolean: Scalars['Boolean']['input']; };
        `);
      });

      it('raises exception for type with non-optional fields', async () => {
        const schema = buildSchema(
          /* GraphQL */ `
          input Input @oneOf {
            int: Int!
            boolean: Boolean!
          }

          type Query {
            foo(input: Input!): Boolean!
          }
        `.concat(oneOfDirectiveDefinition)
        );

        try {
          await plugin(schema, [], {}, { outputFile: '' });
          throw new Error('Plugin should have raised an exception.');
        } catch (err) {
          expect(err.message).toEqual(
            'Fields on an input object type can not be non-nullable. It seems like the schema was not validated.'
          );
        }
      });

      it('handles extensions properly', async () => {
        const schema = buildSchema(
          /* GraphQL */ `
          input Input @oneOf {
            int: Int
          }

          extend input Input {
            boolean: Boolean
          }

          type Query {
            foo(input: Input!): Boolean!
          }
        `.concat(oneOfDirectiveDefinition)
        );

        const result = await plugin(schema, [], {}, { outputFile: '' });
        expect(result.content).toBeSimilarStringTo(`
          export type Input =
            { int: Scalars['Int']['input']; boolean?: never; }
            | { int?: never; boolean: Scalars['Boolean']['input']; };
        `);
      });

      it('handles .isOneOf property on input object types properly', async () => {
        const schema = buildSchema(
          /* GraphQL */ `
          input Input {
            int: Int
            boolean: Boolean
          }

          type Query {
            foo(input: Input!): Boolean!
          }
        `.concat(oneOfDirectiveDefinition)
        );

        const inputType: Record<'isOneOf', boolean> = schema.getType('Input') as any;
        inputType.isOneOf = true;

        const result = await plugin(schema, [], {}, { outputFile: '' });
        expect(result.content).toBeSimilarStringTo(`
          export type Input =
            { int: Scalars['Int']['input']; boolean?: never; }
            | { int?: never; boolean: Scalars['Boolean']['input']; };
        `);
      });
    });
  });

  describe('Naming Convention & Types Prefix', () => {
    it('Should use custom namingConvention for type name and args typename', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type MyType {
          foo(a: String!, b: String, c: [String], d: [Int!]!): String
        }
      `);
      const result = (await plugin(
        schema,
        [],
        { namingConvention: 'change-case-all#lowerCase' },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
        export type mytypefooargs = {
          a: Scalars['String']['input'];
          b?: InputMaybe<Scalars['String']['input']>;
          c?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
          d: Array<Scalars['Int']['input']>;
        };
    `);
      expect(result.content).toBeSimilarStringTo(`
        export type mytype = {
          __typename?: 'MyType';
          foo?: Maybe<Scalars['String']['output']>;
        };
    `);

      validateTs(result);
    });

    it('Should use custom namingConvention and add custom prefix', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type MyType {
          foo(a: String!, b: String, c: [String], d: [Int!]!): String
        }
      `);
      const result = (await plugin(
        schema,
        [],
        { namingConvention: 'change-case-all#lowerCase', typesPrefix: 'I' },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
        export type Imytypefooargs = {
          a: Scalars['String']['input'];
          b?: InputMaybe<Scalars['String']['input']>;
          c?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
          d: Array<Scalars['Int']['input']>;
        };
      `);

      expect(result.content).toBeSimilarStringTo(`
        export type Imytype = {
          __typename?: 'MyType';
          foo?: Maybe<Scalars['String']['output']>;
        };
      `);

      validateTs(result);
    });

    it('Should allow to disable typesPrefix for enums', async () => {
      const schema = buildSchema(`type T { f: String, e: E } enum E { A }`);
      const result = (await plugin(
        schema,
        [],
        { typesPrefix: 'I', enumPrefix: false },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;

      expect(result.content).toContain(`export enum E {`);
      expect(result.content).toContain(`e?: Maybe<E>;`);

      validateTs(result);
    });

    it('Should allow to disable typesSuffix for enums', async () => {
      const schema = buildSchema(`type T { f: String, e: E } enum E { A }`);
      const result = (await plugin(
        schema,
        [],
        { typesSuffix: 'I', enumSuffix: false },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;

      expect(result.content).toContain(`export enum E {`);
      expect(result.content).toContain(`e?: Maybe<E>;`);

      validateTs(result);
    });

    it('Should enable typesPrefix for enums by default', async () => {
      const schema = buildSchema(`type T { f: String, e: E } enum E { A }`);
      const result = await plugin(schema, [], { typesPrefix: 'I' }, { outputFile: '' });

      expect(result.content).toContain(`export enum IE {`);
      expect(result.content).toContain(`e?: Maybe<IE>;`);

      validateTs(result);
    });

    const schema = buildSchema(/* GraphQL */ `
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
      const result = (await plugin(
        schema,
        [],
        { namingConvention: 'change-case-all#lowerCase' },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;

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
          f?: Maybe<Scalars['String']['output']>;
          bar?: Maybe<myenum>;
          b_a_r?: Maybe<Scalars['String']['output']>;
          myOtherField?: Maybe<Scalars['String']['output']>;
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
          id: Scalars['ID']['output'];
        };
        `);
      expect(result.content).toBeSimilarStringTo(`
        export type impl1 = some_interface & {
          __typename?: 'Impl1';
          id: Scalars['ID']['output'];
        };
        `);
      expect(result.content).toBeSimilarStringTo(`
        export type impl_2 = some_interface & {
          __typename?: 'Impl_2';
          id: Scalars['ID']['output'];
        };
        `);
      expect(result.content).toBeSimilarStringTo(`
        export type impl_3 = some_interface & {
          __typename?: 'impl_3';
          id: Scalars['ID']['output'];
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
      const result = await plugin(schema, [], {}, { outputFile: '' });

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
        f?: Maybe<Scalars['String']['output']>;
        bar?: Maybe<MyEnum>;
        b_a_r?: Maybe<Scalars['String']['output']>;
        myOtherField?: Maybe<Scalars['String']['output']>;
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
        id: Scalars['ID']['output'];
      };
      `);
      expect(result.content).toBeSimilarStringTo(`
      export type Impl1 = Some_Interface & {
        __typename?: 'Impl1';
        id: Scalars['ID']['output'];
      };
      `);
      expect(result.content).toBeSimilarStringTo(`
      export type Impl_2 = Some_Interface & {
        __typename?: 'Impl_2';
        id: Scalars['ID']['output'];
      };
      `);
      expect(result.content).toBeSimilarStringTo(`
      export type Impl_3 = Some_Interface & {
        __typename?: 'impl_3';
        id: Scalars['ID']['output'];
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
      const result = await plugin(schema, [], { typesPrefix: 'I' }, { outputFile: '' });

      expect(result.content).toBeSimilarStringTo(`
      export enum IMyEnum {
        A = 'A',
        B = 'B',
        C = 'C'
      }`);

      expect(result.content).toBeSimilarStringTo(`
      export type IMyType = {
        __typename?: 'MyType';
        f?: Maybe<Scalars['String']['output']>;
        bar?: Maybe<IMyEnum>;
        b_a_r?: Maybe<Scalars['String']['output']>;
        myOtherField?: Maybe<Scalars['String']['output']>;
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
        id: Scalars['ID']['output'];
      };
      `);
      expect(result.content).toBeSimilarStringTo(`
      export type IImpl1 = ISome_Interface & {
        __typename?: 'Impl1';
        id: Scalars['ID']['output'];
      };
      `);
      expect(result.content).toBeSimilarStringTo(`
      export type IImpl_2 = ISome_Interface & {
        __typename?: 'Impl_2';
        id: Scalars['ID']['output'];
      };
      `);
      expect(result.content).toBeSimilarStringTo(`
      export type IImpl_3 = ISome_Interface & {
        __typename?: 'impl_3';
        id: Scalars['ID']['output'];
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
      const schema = buildSchema(/* GraphQL */ `
        type MyType {
          foo(a: String!, b: String, c: [String], d: [Int!]!): String
        }
      `);

      const result = await plugin(schema, [], {}, { outputFile: '' });

      expect(result.content).toBeSimilarStringTo(`
        export type MyTypeFooArgs = {
          a: Scalars['String']['input'];
          b?: InputMaybe<Scalars['String']['input']>;
          c?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
          d: Array<Scalars['Int']['input']>;
        };
    `);

      validateTs(result);
    });

    it('Should generate correctly types for field arguments - with default value', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type MyType {
          foo(a: String = "default", b: String! = "default", c: String, d: String!): String
        }
      `);
      const result = await plugin(schema, [], {}, { outputFile: '' });

      expect(result.content).toBeSimilarStringTo(`
        export type MyTypeFooArgs = {
          a?: InputMaybe<Scalars['String']['input']>;
          b?: Scalars['String']['input'];
          c?: InputMaybe<Scalars['String']['input']>;
          d: Scalars['String']['input'];
        };
    `);

      validateTs(result);
    });

    it('Should generate correctly types for field arguments - with default value and avoidOptionals option set to true', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type MyType {
          foo(a: String = "default", b: String! = "default", c: String, d: String!): String
        }
      `);
      const result = (await plugin(
        schema,
        [],
        { avoidOptionals: true },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
        export type MyTypeFooArgs = {
          a?: InputMaybe<Scalars['String']['input']>;
          b?: Scalars['String']['input'];
          c: InputMaybe<Scalars['String']['input']>;
          d: Scalars['String']['input'];
      };
    `);

      validateTs(result);
    });

    it('Should generate correctly types for field arguments - with input type', async () => {
      const schema = buildSchema(/* GraphQL */ `
        input MyInput {
          f: String
        }
        type MyType {
          foo(a: MyInput, b: MyInput!, c: [MyInput], d: [MyInput]!, e: [MyInput!]!): String
        }
      `);
      const result = await plugin(schema, [], {}, { outputFile: '' });

      expect(result.content).toBeSimilarStringTo(`
        export type MyTypeFooArgs = {
          a?: InputMaybe<MyInput>;
          b: MyInput;
          c?: InputMaybe<Array<InputMaybe<MyInput>>>;
          d: Array<InputMaybe<MyInput>>;
          e: Array<MyInput>;
        };
    `);

      validateTs(result);
    });

    it('Should add custom prefix for mutation arguments', async () => {
      const schema = buildSchema(/* GraphQL */ `
        input Input {
          name: String
        }
        type Mutation {
          foo(id: ID, input: Input): String
        }
      `);
      const result = await plugin(schema, [], { typesPrefix: 'T' }, { outputFile: '' });

      expect(result.content).toBeSimilarStringTo(`
        export type TInput = {
          name?: InputMaybe<Scalars['String']['input']>;
        };
      `);

      expect(result.content).toBeSimilarStringTo(`
        export type TMutation = {
          __typename?: 'Mutation';
          foo?: Maybe<Scalars['String']['output']>;
        };

        export type TMutationFooArgs = {
          id?: InputMaybe<Scalars['ID']['input']>;
          input?: InputMaybe<TInput>;
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
      const result = await plugin(testSchema, [], {}, { outputFile: '' });

      expect(result.content).toBeSimilarStringTo(`
        export type NodeTextArgs = {
          arg1: Scalars['String']['input'];
          arg2?: InputMaybe<Scalars['String']['input']>;
        };
      `);
      await validateTs(result);
    });

    it('Should generate correctly types for inputs with default value - #4273', async () => {
      const schema = buildSchema(/* GraphQL */ `
        input MyInput {
          a: String = "default"
          b: String! = "default"
          c: String
          d: String!
        }
      `);
      const result = await plugin(schema, [], {}, { outputFile: '' });

      expect(result.content).toBeSimilarStringTo(`
        export type MyInput = {
          a?: InputMaybe<Scalars['String']['input']>;
          b?: Scalars['String']['input'];
          c?: InputMaybe<Scalars['String']['input']>;
          d: Scalars['String']['input'];
        };
    `);

      validateTs(result);
    });

    it('Should generate correctly types for inputs with default value and avoidOptionals.defaultValue set to true - #5112', async () => {
      const schema = buildSchema(/* GraphQL */ `
        input MyInput {
          a: String = "default"
          b: String! = "default"
          c: String
          d: String!
        }
      `);
      const result = await plugin(schema, [], { avoidOptionals: { defaultValue: true } }, { outputFile: '' });

      expect(result.content).toBeSimilarStringTo(`
        export type MyInput = {
          a?: InputMaybe<Scalars['String']['input']>;
          b: Scalars['String']['input'];
          c?: InputMaybe<Scalars['String']['input']>;
          d: Scalars['String']['input'];
        };
    `);

      validateTs(result);
    });

    it('Should generate correctly types for field arguments with default value and avoidOptionals.defaultValue option set to true - #5112', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type MyType {
          foo(a: String = "default", b: String! = "default", c: String, d: String!): String
        }
      `);
      const result = (await plugin(
        schema,
        [],
        { avoidOptionals: { defaultValue: true } },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
        export type MyTypeFooArgs = {
          a?: InputMaybe<Scalars['String']['input']>;
          b: Scalars['String']['input'];
          c?: InputMaybe<Scalars['String']['input']>;
          d: Scalars['String']['input'];
        };
    `);

      validateTs(result);
    });
  });

  describe('Enum', () => {
    it('Should build basic enum correctly', async () => {
      const schema = buildSchema(`enum MyEnum { A, B, C }`);
      const result = await plugin(schema, [], {}, { outputFile: '' });

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
      const result = (await plugin(
        schema,
        [],
        { enumValues: { MyEnum: { A: 'SomeValue', B: 'TEST' } } },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;

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
      const result = (await plugin(
        schema,
        [],
        { enumValues: { MyEnum: './my-file#MyEnum' } },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;

      expect(result.content).not.toContain(`export enum MyEnum`);
      expect(result.prepend).toContain(`import { MyEnum } from './my-file';`);

      validateTs(result);
    });

    it('Should build enum correctly with custom imported enum from namespace with different name', async () => {
      const schema = buildSchema(`enum MyEnum { A, B, C }`);
      const result = (await plugin(
        schema,
        [],
        { enumValues: { MyEnum: './my-file#NS.ETest' } },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;

      expect(result.content).not.toContain(`export enum MyEnum`);
      expect(result.content).toContain(`export { MyEnum }`);
      expect(result.prepend).toContain(`import MyEnum = NS.ETest;`);
      expect(result.prepend).toContain(`import { NS } from './my-file';`);

      validateTs(result);
    });

    it('Should build enum correctly with custom imported enum from namespace with same name', async () => {
      const schema = buildSchema(`enum MyEnum { A, B, C }`);
      const result = (await plugin(
        schema,
        [],
        { enumValues: { MyEnum: './my-file#NS.MyEnum' } },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;

      expect(result.content).not.toContain(`export enum MyEnum`);
      expect(result.content).toContain(`export { MyEnum };`);
      expect(result.prepend).toContain(`import MyEnum = NS.MyEnum;`);
      expect(result.prepend).toContain(`import { NS } from './my-file';`);

      validateTs(result);
    });

    it('Should build enum correctly with custom imported enum with different name', async () => {
      const schema = buildSchema(`enum MyEnum { A, B, C } type Query { t: MyEnum }`);
      const result = (await plugin(
        schema,
        [],
        { enumValues: { MyEnum: './my-file#MyCustomEnum' } },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;

      expect(result.content).not.toContain(`export enum MyEnum`);
      expect(result.prepend).toContain(`import { MyCustomEnum as MyEnum } from './my-file';`);
      expect(result.content).toContain(`export { MyEnum };`);

      validateTs(result);
    });

    it('Should import all enums from a single file when specified as string', async () => {
      const schema = buildSchema(`enum MyEnum { A, B, C } enum MyEnum2 { X, Y, Z }`);
      const result = (await plugin(
        schema,
        [],
        { enumValues: './my-file' },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;

      expect(result.content).not.toContain(`export enum MyEnum`);
      expect(result.content).not.toContain(`export enum MyEnum2`);
      expect(result.prepend).toContain(`import { MyEnum } from './my-file';`);
      expect(result.prepend).toContain(`import { MyEnum2 } from './my-file';`);

      validateTs(result);
    });

    it('Should re-export external enums', async () => {
      const schema = buildSchema(`enum MyEnum { A, B, C } enum MyEnum2 { X, Y, Z }`);
      const result = (await plugin(
        schema,
        [],
        { enumValues: { MyEnum: './my-file#MyEnum', MyEnum2: './my-file#MyEnum2X' } },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;

      expect(result.content).toContain(`export { MyEnum };`);
      expect(result.content).toContain(`export { MyEnum2 };`);
      expect(result.prepend).toContain(`import { MyEnum2X as MyEnum2 } from './my-file';`);

      validateTs(result);
    });

    it('Should re-export external enums when single file option used', async () => {
      const schema = buildSchema(`enum MyEnum { A, B, C } enum MyEnum2 { X, Y, Z }`);
      const result = (await plugin(
        schema,
        [],
        { enumValues: './my-file' },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;

      expect(result.prepend).toContain(`import { MyEnum } from './my-file';`);
      expect(result.prepend).toContain(`import { MyEnum2 } from './my-file';`);
      expect(result.content).toContain(`export { MyEnum };`);
      expect(result.content).toContain(`export { MyEnum2 };`);

      validateTs(result);
    });

    it('allowEnumStringTypes', async () => {
      const schema = buildSchema(/* GraphQL */ `
        enum MyEnum {
          A
          B
          C
        }
        type Query {
          a: MyEnum
        }
      `);
      const result = (await plugin(
        schema,
        [],
        { allowEnumStringTypes: true },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;

      validateTs(result);

      expect(result.content).toBeSimilarStringTo('a?: Maybe<MyEnum | `${MyEnum}`>;');
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

    const content = await plugin(schema, [], {}, { outputFile: '' });

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

    const result = await plugin(schema, [], {}, { outputFile: '' });
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

    const result = await plugin(schema, [], { skipTypename: true }, { outputFile: '' });
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

    const result = await plugin(schema, [], { noExport: true }, { outputFile: '' });
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
        contain?: InputMaybe<Scalars['String']['input']>;
      };
    `);
    // filter should be non-optional
    expect(output.content).toBeSimilarStringTo(`
      export type QueryListArgs = {
        after?: InputMaybe<Scalars['String']['input']>;
        orderBy?: InputMaybe<OrderBy>;
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
    const output = await plugin(testSchema, [], {}, { outputFile: 'graphql.ts' });

    expect(output.content).toBeSimilarStringTo(`
      export enum Foo {
        Bar = 'Qux'
      }
    `);
  });

  it('should use implementing types as node type - issue #5126', async () => {
    const testSchema = buildSchema(/* GraphQL */ `
      type Matrix {
        pills: [Pill!]!
      }

      interface Pill {
        id: ID!
      }

      type RedPill implements Pill {
        red: String!
      }

      type GreenPill implements Pill {
        green: String!
      }

      interface Foo {
        id: ID!
      }

      type Bar implements Foo {
        lol: String!
      }

      type Hello {
        foo: Foo!
      }

      type NoInterface {
        hello: Hello!
      }

      interface NestedInterface implements Foo {
        field: String!
      }

      type NestedType1 implements NestedInterface {
        hi: String!
      }

      type NestedType2 implements NestedInterface {
        ho: String!
      }

      type NestedField {
        nested: NestedInterface!
      }
    `);

    const output = (await plugin(
      testSchema,
      [],
      {
        useImplementingTypes: true,
      } as any,
      { outputFile: 'graphql.ts' }
    )) as Types.ComplexPluginOutput;

    expect(output.content).toMatchSnapshot();

    // Type should be Array<RedPill|GreenPill> and not Pill
    expect(output.content).toBeSimilarStringTo(`
      export type Matrix = {
        __typename?: 'Matrix';
        pills: Array<RedPill | GreenPill>;
      };
    `);
    // Type should be Bar and not Foo
    expect(output.content).toBeSimilarStringTo(`
      export type Hello = {
        __typename?: 'Hello';
        foo: Bar;
      };
    `);
    // Type should be Hello and not empty
    expect(output.content).toBeSimilarStringTo(`
      export type NoInterface = {
        __typename?: 'NoInterface';
        hello: Hello;
      };
    `);
    // Type should be NestedType1|NestedType2
    expect(output.content).toBeSimilarStringTo(`
      export type NestedField = {
        __typename?: 'NestedField';
        nested: NestedType1 | NestedType2;
      };
    `);
  });
});
