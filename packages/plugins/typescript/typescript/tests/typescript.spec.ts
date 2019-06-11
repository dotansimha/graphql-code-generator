import { Types } from '@graphql-codegen/plugin-helpers';
import '@graphql-codegen/testing';
import { buildSchema, parse } from 'graphql';
import { validateTs } from './validate';
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
          ID: string,
          String: string,
          Boolean: boolean,
          Int: number,
          Float: number,
          /** My custom scalar */
          A: any,
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
          f: Scalars['String'],
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
        /** MyInput
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
        __typename?: 'B',
        /** the id */
        id?: Maybe<Scalars['ID']>,
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
        id: Scalars['ID'],
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
    it('#1488 - Should generate readonly also in input types when immutableTypes is set', async () => {
      const schema = buildSchema(`
      input MyInput {
        f: String!
      }`);

      const result = (await plugin(schema, [], { immutableTypes: true }, { outputFile: '' })) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
      export type MyInput = {
        readonly f: Scalars['String'],
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
        __typename?: 'CardEdge',
        count: Scalars['Int'],
      };`);
      validateTs(result);
    });
  });

  describe('Config', () => {
    it('Should build type correctly when specified with avoidOptionals config', async () => {
      const schema = buildSchema(`
        type MyType {
          foo: String
          bar: String!
        }`);
      const result = (await plugin(schema, [], { avoidOptionals: true }, { outputFile: '' })) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
        export type MyType = {
          __typename?: 'MyType',
          foo: Maybe<Scalars['String']>,
          bar: Scalars['String'],
        };
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
          __typename?: 'MyType',
          readonly foo: ReadonlyArray<Scalars['String']>,
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
            typeNames: 'change-case#lowerCase',
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
          a: Scalars['String'],
          b?: Maybe<Scalars['String']>,
          c?: Maybe<Array<Maybe<Scalars['String']>>>,
          d: Array<Scalars['Int']>
        };
    `);
      expect(result.content).toBeSimilarStringTo(`
        export type mytype = {
          __typename?: 'MyType',
          foo?: Maybe<foo>,
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
            enumValues: 'change-case#lowerCase',
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
            enumValues: 'change-case#lowerCase',
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
          a: Scalars['String'],
          b?: Maybe<Scalars['String']>,
          c?: Maybe<Array<Maybe<Scalars['String']>>>,
          d: Array<Scalars['Int']>
        };
      `);

      expect(result.content).toBeSimilarStringTo(`
        export type MyType = {
          __typename?: 'MyType',
          foo?: Maybe<Foo>,
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
        [{ filePath: '', content: query }],
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
        ID: string,
        String: string,
        Boolean: boolean,
        Int: number,
        Float: number,
      };`);

      expect(result.content).toBeSimilarStringTo(`
      export type MyType = {
        __typename?: 'MyType',
        foo?: Maybe<Scalars['String']>,
        bar: Scalars['String'],
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
        ID: string,
        String: string,
        Boolean: boolean,
        Int: number,
        Float: number,
        MyScalar: any,
      };`);

      expect(result.content).toBeSimilarStringTo(`
      export type MyType = {
        __typename?: 'MyType',
        foo?: Maybe<Scalars['String']>,
        bar: Scalars['MyScalar'],
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
        ID: string,
        String: string,
        Boolean: boolean,
        Int: number,
        Float: number,
        MyScalar: Date,
      };`);

      expect(result.content).toBeSimilarStringTo(`
      export type MyType = {
        __typename?: 'MyType',
        foo?: Maybe<Scalars['String']>,
        bar: Scalars['MyScalar'],
      };`);
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
          __typename?: 'MyType',
          foo?: Maybe<Scalars['String']>,
          bar: Scalars['String'],
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
          foo: Scalars['String'],
        };
      `);
      expect(result.content).toBeSimilarStringTo(`
        export type MyType = MyInterface & {
          __typename?: 'MyType',
          foo: Scalars['String'],
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
          foo: Scalars['String'],
        };
      `);
      expect(result.content).toBeSimilarStringTo(`
        export type MyOtherInterface = {
          bar: Scalars['String'],
        };
      `);
      expect(result.content).toBeSimilarStringTo(`
        export type MyType = MyInterface & MyOtherInterface & {
          __typename?: 'MyType',
          foo: Scalars['String'],
          bar: Scalars['String'],
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
          foo: Scalars['String'],
        };
      `);
      expect(result.content).toBeSimilarStringTo(`
        export type MyType = MyInterface & {
          __typename?: 'MyType',
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
          __typename?: 'MyType',
          foo: MyOtherType,
        };
      `);
      expect(result.content).toBeSimilarStringTo(`
        export type MyOtherType = {
          __typename?: 'MyOtherType',
          bar: Scalars['String'],
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
          foo?: Maybe<Scalars['String']>,
          bar: Scalars['String'],
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
      const result = (await plugin(schema, [], { namingConvention: 'change-case#lowerCase' }, { outputFile: '' })) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
        export type mytypefooargs = {
          a: Scalars['String'],
          b?: Maybe<Scalars['String']>,
          c?: Maybe<Array<Maybe<Scalars['String']>>>,
          d: Array<Scalars['Int']>
        };
    `);
      expect(result.content).toBeSimilarStringTo(`
        export type mytype = {
          __typename?: 'MyType',
          foo?: Maybe<Scalars['String']>,
        };
    `);

      validateTs(result);
    });

    it('Should use custom namingConvention and add custom prefix', async () => {
      const schema = buildSchema(`type MyType { foo(a: String!, b: String, c: [String], d: [Int!]!): String }`);
      const result = (await plugin(schema, [], { namingConvention: 'change-case#lowerCase', typesPrefix: 'I' }, { outputFile: '' })) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
        export type Imytypefooargs = {
          a: Scalars['String'],
          b?: Maybe<Scalars['String']>,
          c?: Maybe<Array<Maybe<Scalars['String']>>>,
          d: Array<Scalars['Int']>
        };
      `);

      expect(result.content).toBeSimilarStringTo(`
        export type Imytype = {
          __typename?: 'MyType',
          foo?: Maybe<Scalars['String']>,
        };
      `);

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
      const result = (await plugin(schema, [], { namingConvention: 'change-case#lowerCase' }, { outputFile: '' })) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
        export enum myenum {
          a = 'A',
          b = 'B',
          c = 'C'
        }
        `);
      expect(result.content).toBeSimilarStringTo(`
        export type mytype = {
          __typename?: 'MyType',
          f?: Maybe<Scalars['String']>,
          bar?: Maybe<myenum>,
          b_a_r?: Maybe<Scalars['String']>,
          myOtherField?: Maybe<Scalars['String']>,
        };
        `);
      expect(result.content).toBeSimilarStringTo(`
        export type my_type = {
          __typename?: 'My_Type',
          linkTest?: Maybe<mytype>,
        };
        `);
      expect(result.content).toBeSimilarStringTo(`
        export type myunion = my_type | mytype;
        `);
      expect(result.content).toBeSimilarStringTo(`
        export type some_interface = {
          id: Scalars['ID'],
        };
        `);
      expect(result.content).toBeSimilarStringTo(`
        export type impl1 = some_interface & {
          __typename?: 'Impl1',
          id: Scalars['ID'],
        };
        `);
      expect(result.content).toBeSimilarStringTo(`
        export type impl_2 = some_interface & {
          __typename?: 'Impl_2',
          id: Scalars['ID'],
        };
        `);
      expect(result.content).toBeSimilarStringTo(`
        export type impl_3 = some_interface & {
          __typename?: 'impl_3',
          id: Scalars['ID'],
        };
        `);
      expect(result.content).toBeSimilarStringTo(`
        export type query = {
          __typename?: 'Query',
          something?: Maybe<myunion>,
          use_interface?: Maybe<some_interface>,
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
        __typename?: 'MyType',
        f?: Maybe<Scalars['String']>,
        bar?: Maybe<MyEnum>,
        b_a_r?: Maybe<Scalars['String']>,
        myOtherField?: Maybe<Scalars['String']>,
      };
      `);
      expect(result.content).toBeSimilarStringTo(`
      export type My_Type = {
        __typename?: 'My_Type',
        linkTest?: Maybe<MyType>,
      };
      `);
      expect(result.content).toBeSimilarStringTo(`
      export type MyUnion = My_Type | MyType;
      `);
      expect(result.content).toBeSimilarStringTo(`
      export type Some_Interface = {
        id: Scalars['ID'],
      };
      `);
      expect(result.content).toBeSimilarStringTo(`
      export type Impl1 = Some_Interface & {
        __typename?: 'Impl1',
        id: Scalars['ID'],
      };
      `);
      expect(result.content).toBeSimilarStringTo(`
      export type Impl_2 = Some_Interface & {
        __typename?: 'Impl_2',
        id: Scalars['ID'],
      };
      `);
      expect(result.content).toBeSimilarStringTo(`
      export type Impl_3 = Some_Interface & {
        __typename?: 'impl_3',
        id: Scalars['ID'],
      };
      `);
      expect(result.content).toBeSimilarStringTo(`
      export type Query = {
        __typename?: 'Query',
        something?: Maybe<MyUnion>,
        use_interface?: Maybe<Some_Interface>,
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
        __typename?: 'MyType',
        f?: Maybe<Scalars['String']>,
        bar?: Maybe<IMyEnum>,
        b_a_r?: Maybe<Scalars['String']>,
        myOtherField?: Maybe<Scalars['String']>,
      };`);
      expect(result.content).toBeSimilarStringTo(`
      export type IMy_Type = {
        __typename?: 'My_Type',
        linkTest?: Maybe<IMyType>,
      };
  `);
      expect(result.content).toBeSimilarStringTo(`export type IMyUnion = IMy_Type | IMyType;`);
      expect(result.content).toBeSimilarStringTo(`
      export type ISome_Interface = {
        id: Scalars['ID'],
      };
      `);
      expect(result.content).toBeSimilarStringTo(`
      export type IImpl1 = ISome_Interface & {
        __typename?: 'Impl1',
        id: Scalars['ID'],
      };
      `);
      expect(result.content).toBeSimilarStringTo(`
      export type IImpl_2 = ISome_Interface & {
        __typename?: 'Impl_2',
        id: Scalars['ID'],
      };
      `);
      expect(result.content).toBeSimilarStringTo(`
      export type IImpl_3 = ISome_Interface & {
        __typename?: 'impl_3',
        id: Scalars['ID'],
      };
      `);
      expect(result.content).toBeSimilarStringTo(`
      export type IQuery = {
        __typename?: 'Query',
        something?: Maybe<IMyUnion>,
        use_interface?: Maybe<ISome_Interface>,
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
          a: Scalars['String'],
          b?: Maybe<Scalars['String']>,
          c?: Maybe<Array<Maybe<Scalars['String']>>>,
          d: Array<Scalars['Int']>
        };
    `);

      validateTs(result);
    });

    it('Should generate correctly types for field arguments - with default value', async () => {
      const schema = buildSchema(`type MyType { foo(a: String = "default", b: String! = "default", c: String): String }`);
      const result = (await plugin(schema, [], {}, { outputFile: '' })) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
        export type MyTypeFooArgs = {
          a: Scalars['String'],
          b: Scalars['String'],
          c?: Maybe<Scalars['String']>
        };
    `);

      validateTs(result);
    });

    it('Should generate correctly types for field arguments - with input type', async () => {
      const schema = buildSchema(`input MyInput { f: String } type MyType { foo(a: MyInput, b: MyInput!, c: [MyInput], d: [MyInput]!, e: [MyInput!]!): String }`);
      const result = (await plugin(schema, [], {}, { outputFile: '' })) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
        export type MyTypeFooArgs = {
          a?: Maybe<MyInput>,
          b: MyInput,
          c?: Maybe<Array<Maybe<MyInput>>>,
          d: Array<Maybe<MyInput>>,
          e: Array<MyInput>
        };
    `);

      validateTs(result);
    });

    it('Should add custom prefix for mutation arguments', async () => {
      const schema = buildSchema(`input Input { name: String } type Mutation { foo(id: ID, input: Input): String }`);
      const result = (await plugin(schema, [], { typesPrefix: 'T' }, { outputFile: '' })) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
        export type TInput = {
          name?: Maybe<Scalars['String']>,
        };
      `);

      expect(result.content).toBeSimilarStringTo(`
        export type TMutation = {
          __typename?: 'Mutation',
          foo?: Maybe<Scalars['String']>,
        };

        export type TMutationFooArgs = {
          id?: Maybe<Scalars['ID']>,
          input?: Maybe<TInput>
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
          arg1: Scalars['String'],
          arg2?: Maybe<Scalars['String']>
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
});
