import '@graphql-codegen/testing';
import { buildSchema } from 'graphql';
import { plugin } from '../src/index';
import { validateFlow } from './validate-flow';
import { Types } from '@graphql-codegen/plugin-helpers';

describe('Flow Plugin', () => {
  describe('description to comment', () => {
    it('Test for issue #1508', async () => {
      const schema = buildSchema(/* GraphQL */ `
        """
        New user account input fields
        """
        input SignUpDetails {
          """
          First name
          """
          firstName: String!

          """
          Last name
          """
          lastName: String!

          """
          Email address
          """
          email: String!

          """
          User role
          """
          role: String!

          """
          A legit and secure password
          """
          password: String!

          """
          Repeat password
          """
          passwordRepeat: String!

          """
          Language
          """
          language: String = "en-US"

          """
          Timezone
          """
          timezone: String = "UTC"

          """
          CAPTCHA verification code
          """
          captcha: String
        }
      `);
      const result = (await plugin(schema, [], {}, { outputFile: '' })) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
      /** New user account input fields */
      export type SignUpDetails = {
        /** First name */
        firstName: $ElementType<Scalars, 'String'>,
        /** Last name */
        lastName: $ElementType<Scalars, 'String'>,
        /** Email address */
        email: $ElementType<Scalars, 'String'>,
        /** User role */
        role: $ElementType<Scalars, 'String'>,
        /** A legit and secure password */
        password: $ElementType<Scalars, 'String'>,
        /** Repeat password */
        passwordRepeat: $ElementType<Scalars, 'String'>,
        /** Language */
        language?: ?$ElementType<Scalars, 'String'>,
        /** Timezone */
        timezone?: ?$ElementType<Scalars, 'String'>,
        /** CAPTCHA verification code */
        captcha?: ?$ElementType<Scalars, 'String'>,
      };
      `);
    });
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

      validateFlow(result);
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
          f: $ElementType<Scalars, 'String'>,
        }`);

      validateFlow(result);
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

      validateFlow(result);
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

      validateFlow(result);
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

      validateFlow(result);
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
        id?: ?$ElementType<Scalars, 'ID'>,
      };`);

      validateFlow(result);
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
        __typename?: 'Node',
        /** the id */
        id: $ElementType<Scalars, 'ID'>,
      };`);

      validateFlow(result);
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
      export const MyEnumValues = Object.freeze({
        /** this is a */
        A: 'A', 
        /** this is b */
        B: 'B'
      });
      
      
      /** custom enum */
      export type MyEnum = $Values<typeof MyEnumValues>;`);

      validateFlow(result);
    });
  });

  describe('Output options', () => {
    it('Should produce valid flow code when used with useFlowExactObjects in enums', async () => {
      const schema = buildSchema(`
      enum MyEnum {
        A
        B
      }
        `);
      const result = (await plugin(schema, [], { useFlowExactObjects: true }, { outputFile: '' })) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
      export const MyEnumValues = Object.freeze({
        A: 'A', 
        B: 'B'
      });`);
      validateFlow(result);
    });

    it('Should respect flow option useFlowExactObjects', async () => {
      const schema = buildSchema(`
        interface MyInterface {
          foo: String
          bar: String!
        }`);
      const result = (await plugin(schema, [], { useFlowExactObjects: true }, { outputFile: '' })) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
        export type MyInterface = {|
          __typename?: 'MyInterface',
          foo?: ?$ElementType<Scalars, 'String'>,
          bar: $ElementType<Scalars, 'String'>,
        |};
      `);
      validateFlow(result);
    });

    it('Should respect flow option useFlowReadOnlyTypes', async () => {
      const schema = buildSchema(/* GraphQL */ `
        interface MyInterface {
          foo: String
          bar: String!
        }

        enum MyEnum {
          A
          B
          C
        }
      `);
      const result = (await plugin(schema, [], { useFlowReadOnlyTypes: true }, { outputFile: '' })) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
        export type MyInterface = {
          __typename?: 'MyInterface',
          +foo?: ?$ElementType<Scalars, 'String'>,
          +bar: $ElementType<Scalars, 'String'>,
        };
      `);
      expect(result.content).toBeSimilarStringTo(`
        export const MyEnumValues = Object.freeze({
          A: 'A',
          B: 'B',
          C: 'C'
        });
        export type MyEnum = $Values<typeof MyEnumValues>;
      `);

      validateFlow(result);
    });
  });

  describe('Naming Convention & Types Prefix', () => {
    it('Should use custom namingConvention for type name and args typename', async () => {
      const schema = buildSchema(`type MyType { foo(a: String!, b: String, c: [String], d: [Int!]!): String }`);
      const result = (await plugin(schema, [], { namingConvention: 'change-case#lowerCase' }, { outputFile: '' })) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
        export type mytypefooargs = {
          a: $ElementType<Scalars, 'String'>,
          b?: ?$ElementType<Scalars, 'String'>,
          c?: ?Array<?$ElementType<Scalars, 'String'>>,
          d: Array<$ElementType<Scalars, 'Int'>>
        };
    `);
      expect(result.content).toBeSimilarStringTo(`
        export type mytype = {
          __typename?: 'MyType',
          foo?: ?$ElementType<Scalars, 'String'>,
        };
    `);

      validateFlow(result);
    });

    it('Should remove underscore from enum values', async () => {
      const schema = buildSchema(/* GraphQL */ `
        enum MyEnum {
          My_Value
          _MyOtherValue
        }
      `);
      const result = (await plugin(schema, [], {}, { outputFile: '' })) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
      export const MyEnumValues = Object.freeze({
        MyValue: 'My_Value', 
        MyOtherValue: '_MyOtherValue'
      });
      
      
      export type MyEnum = $Values<typeof MyEnumValues>;`);

      validateFlow(result);
    });

    it('Should use custom namingConvention and add custom prefix', async () => {
      const schema = buildSchema(`type MyType { foo(a: String!, b: String, c: [String], d: [Int!]!): String }`);
      const result = (await plugin(schema, [], { namingConvention: 'change-case#lowerCase', typesPrefix: 'I' }, { outputFile: '' })) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
        export type Imytypefooargs = {
          a: $ElementType<Scalars, 'String'>,
          b?: ?$ElementType<Scalars, 'String'>,
          c?: ?Array<?$ElementType<Scalars, 'String'>>,
          d: Array<$ElementType<Scalars, 'Int'>>
        };
      `);

      expect(result.content).toBeSimilarStringTo(`
        export type Imytype = {
          __typename?: 'MyType',
          foo?: ?$ElementType<Scalars, 'String'>,
        };
      `);

      validateFlow(result);
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
        export const myenumvalues = Object.freeze({
          a: 'A',
          b: 'B',
          c: 'C'
        });`);

      expect(result.content).toBeSimilarStringTo(`export type myenum = $Values<typeof myenumvalues>;`);

      expect(result.content).toBeSimilarStringTo(`export type mytype = {
          __typename?: 'MyType',
          f?: ?$ElementType<Scalars, 'String'>,
          bar?: ?myenum,
          b_a_r?: ?$ElementType<Scalars, 'String'>,
          myOtherField?: ?$ElementType<Scalars, 'String'>,
        };`);

      expect(result.content).toBeSimilarStringTo(`export type my_type = {
          __typename?: 'My_Type',
          linkTest?: ?mytype,
        };`);

      expect(result.content).toBeSimilarStringTo(`export type myunion = my_type | mytype;`);

      expect(result.content).toBeSimilarStringTo(`export type some_interface = {
          __typename?: 'Some_Interface',
          id: $ElementType<Scalars, 'ID'>,
        };`);

      expect(result.content).toBeSimilarStringTo(`export type impl1 = some_interface & {
          __typename?: 'Impl1',
          id: $ElementType<Scalars, 'ID'>,
        };`);

      expect(result.content).toBeSimilarStringTo(`export type impl_2 = some_interface & {
          __typename?: 'Impl_2',
          id: $ElementType<Scalars, 'ID'>,
        };`);

      expect(result.content).toBeSimilarStringTo(`export type impl_3 = some_interface & {
          __typename?: 'impl_3',
          id: $ElementType<Scalars, 'ID'>,
        };`);

      expect(result.content).toBeSimilarStringTo(`export type query = {
          __typename?: 'Query',
          something?: ?myunion,
          use_interface?: ?some_interface,
        };`);

      validateFlow(result);
    });

    it('Should generate correct values when using links between types - pascalCase (default)', async () => {
      const result = (await plugin(schema, [], {}, { outputFile: '' })) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
      export const MyEnumValues = Object.freeze({
        A: 'A',
        B: 'B',
        C: 'C'
      });`);

      expect(result.content).toBeSimilarStringTo(`export type MyEnum = $Values<typeof MyEnumValues>;`);

      expect(result.content).toBeSimilarStringTo(`export type MyType = {
        __typename?: 'MyType',
        f?: ?$ElementType<Scalars, 'String'>,
        bar?: ?MyEnum,
        b_a_r?: ?$ElementType<Scalars, 'String'>,
        myOtherField?: ?$ElementType<Scalars, 'String'>,
      };`);

      expect(result.content).toBeSimilarStringTo(`export type My_Type = {
        __typename?: 'My_Type',
        linkTest?: ?MyType,
      };`);

      expect(result.content).toBeSimilarStringTo(`export type MyUnion = My_Type | MyType;`);

      expect(result.content).toBeSimilarStringTo(`export type Some_Interface = {
        __typename?: 'Some_Interface',
        id: $ElementType<Scalars, 'ID'>,
      };`);

      expect(result.content).toBeSimilarStringTo(`export type Impl1 = Some_Interface & {
        __typename?: 'Impl1',
        id: $ElementType<Scalars, 'ID'>,
      };`);

      expect(result.content).toBeSimilarStringTo(`export type Impl_2 = Some_Interface & {
        __typename?: 'Impl_2',
        id: $ElementType<Scalars, 'ID'>,
      };`);

      expect(result.content).toBeSimilarStringTo(`export type Impl_3 = Some_Interface & {
        __typename?: 'impl_3',
        id: $ElementType<Scalars, 'ID'>,
      };`);

      expect(result.content).toBeSimilarStringTo(`export type Query = {
        __typename?: 'Query',
        something?: ?MyUnion,
        use_interface?: ?Some_Interface,
      };`);

      validateFlow(result);
    });

    it('Should generate correct values when using links between types - pascalCase (default) with custom prefix', async () => {
      const result = (await plugin(schema, [], { typesPrefix: 'I' }, { outputFile: '' })) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
      export const IMyEnumValues = Object.freeze({
        A: 'A',
        B: 'B',
        C: 'C'
      });`);
      expect(result.content).toBeSimilarStringTo(`export type IMyEnum = $Values<typeof IMyEnumValues>;`);

      expect(result.content).toBeSimilarStringTo(`export type IMyType = {
        __typename?: 'MyType',
        f?: ?$ElementType<Scalars, 'String'>,
        bar?: ?IMyEnum,
        b_a_r?: ?$ElementType<Scalars, 'String'>,
        myOtherField?: ?$ElementType<Scalars, 'String'>,
      };`);

      expect(result.content).toBeSimilarStringTo(`export type IMy_Type = {
        __typename?: 'My_Type',
        linkTest?: ?IMyType,
      };`);

      expect(result.content).toBeSimilarStringTo(`export type IMyUnion = IMy_Type | IMyType;`);

      expect(result.content).toBeSimilarStringTo(`export type ISome_Interface = {
        __typename?: 'Some_Interface',
        id: $ElementType<Scalars, 'ID'>,
      };`);

      expect(result.content).toBeSimilarStringTo(`export type IImpl1 = ISome_Interface & {
        __typename?: 'Impl1',
        id: $ElementType<Scalars, 'ID'>,
      };`);

      expect(result.content).toBeSimilarStringTo(`export type IImpl_2 = ISome_Interface & {
        __typename?: 'Impl_2',
        id: $ElementType<Scalars, 'ID'>,
      };`);

      expect(result.content).toBeSimilarStringTo(`export type IImpl_3 = ISome_Interface & {
        __typename?: 'impl_3',
        id: $ElementType<Scalars, 'ID'>,
      };`);

      expect(result.content).toBeSimilarStringTo(`export type IQuery = {
        __typename?: 'Query',
        something?: ?IMyUnion,
        use_interface?: ?ISome_Interface,
      };`);

      validateFlow(result);
    });
  });

  describe('Arguments', () => {
    it('Should generate correctly types for field arguments - with basic fields', async () => {
      const schema = buildSchema(`type MyType { foo(a: String!, b: String, c: [String], d: [Int!]!): String }`);
      const result = (await plugin(schema, [], {}, { outputFile: '' })) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
        export type MyTypeFooArgs = {
          a: $ElementType<Scalars, 'String'>,
          b?: ?$ElementType<Scalars, 'String'>,
          c?: ?Array<?$ElementType<Scalars, 'String'>>,
          d: Array<$ElementType<Scalars, 'Int'>>
        };
    `);

      validateFlow(result);
    });

    it('Should generate correctly types for field arguments - with default value', async () => {
      const schema = buildSchema(`type MyType { foo(a: String = "default", b: String! = "default", c: String): String }`);
      const result = (await plugin(schema, [], {}, { outputFile: '' })) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
        export type MyTypeFooArgs = {
          a: $ElementType<Scalars, 'String'>,
          b: $ElementType<Scalars, 'String'>,
          c?: ?$ElementType<Scalars, 'String'>
        };
    `);

      validateFlow(result);
    });

    it('Should generate correctly types for field arguments - with input type', async () => {
      const schema = buildSchema(`input MyInput { f: String } type MyType { foo(a: MyInput, b: MyInput!, c: [MyInput], d: [MyInput]!, e: [MyInput!]!): String }`);
      const result = (await plugin(schema, [], {}, { outputFile: '' })) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
        export type MyTypeFooArgs = {
          a?: ?MyInput,
          b: MyInput,
          c?: ?Array<?MyInput>,
          d: Array<?MyInput>,
          e: Array<MyInput>
        };
    `);

      validateFlow(result);
    });

    it('Should add custom prefix for mutation arguments', async () => {
      const schema = buildSchema(`input Input { name: String } type Mutation { foo(id: String, input: Input): String }`);
      const result = (await plugin(schema, [], { typesPrefix: 'T' }, { outputFile: '' })) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
        export type TInput = {
          name?: ?$ElementType<Scalars, 'String'>,
        };
      `);

      expect(result.content).toBeSimilarStringTo(`
        export type TMutation = {
          __typename?: 'Mutation',
          foo?: ?$ElementType<Scalars, 'String'>,
        };


        export type TMutationFooArgs = {
          id?: ?$ElementType<Scalars, 'String'>,
          input?: ?TInput
        };
      `);

      validateFlow(result);
    });
  });

  describe('Enum', () => {
    it('Should build basic enum correctly', async () => {
      const schema = buildSchema(`enum MyEnum { A, B, C }`);
      const result = (await plugin(schema, [], {}, { outputFile: '' })) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
        export const MyEnumValues = Object.freeze({
          A: 'A',
          B: 'B',
          C: 'C'
        });

        export type MyEnum = $Values<typeof MyEnumValues>;
      `);

      validateFlow(result);
    });

    it('Should build enum correctly with custom values', async () => {
      const schema = buildSchema(`enum MyEnum { A, B, C }`);
      const result = (await plugin(schema, [], { enumValues: { MyEnum: { A: 'SomeValue', B: 'TEST' } } }, { outputFile: '' })) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
        export const MyEnumValues = Object.freeze({
          A: 'SomeValue',
          B: 'TEST',
          C: 'C'
        });

        export type MyEnum = $Values<typeof MyEnumValues>;
      `);

      validateFlow(result);
    });

    it('Should build enum correctly with custom values and map to external enum', async () => {
      const schema = buildSchema(`enum MyEnum { A, B, C }`);
      const result = (await plugin(schema, [], { enumValues: { MyEnum: './my-file#MyEnum' } }, { outputFile: '' })) as Types.ComplexPluginOutput;

      expect(result.content).not.toContain(`export type MyEnum`);
      expect(result.prepend).toContain(`import { type MyEnum } from './my-file';`);

      validateFlow(result);
    });

    it('Should build enum correctly with custom values and map to external enum with different identifier', async () => {
      const schema = buildSchema(`enum MyEnum { A, B, C }`);
      const result = (await plugin(schema, [], { enumValues: { MyEnum: './my-file#MyCustomEnum' } }, { outputFile: '' })) as Types.ComplexPluginOutput;

      expect(result.content).not.toContain(`export type MyEnum`);
      expect(result.prepend).toContain(`import { type MyCustomEnum as MyEnum } from './my-file';`);

      validateFlow(result);
    });
  });

  describe('Scalars', () => {
    it('Should build basic scalar correctly as any', async () => {
      const schema = buildSchema(`scalar A`);
      const result = (await plugin(schema, [], {}, { outputFile: '' })) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
   export type Scalars = {
      ID: string,
      String: string,
      Boolean: boolean,
      Int: number,
      Float: number,
      A: any,
    };
      `);

      expect(result).not.toContain('export type A = any;');

      validateFlow(result);
    });

    it('Should build enum correctly with custom values', async () => {
      const schema = buildSchema(`scalar A`);
      const result = (await plugin(schema, [], { scalars: { A: 'MyCustomType' } }, { outputFile: '' })) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
   export type Scalars = {
      ID: string,
      String: string,
      Boolean: boolean,
      Int: number,
      Float: number,
      A: MyCustomType,
    };
      `);

      validateFlow(result);
    });
  });

  describe('Input Object', () => {
    it('Should build input types correctly, also with array, mutlti-dimensional arrays, non-null and custom types', async () => {
      const schema = buildSchema(`
        type MyType {
          foo: String
        }

        input MyInput {
          a: String!
          b: Int
          c: MyType
          d: MyType!
          e: [String]
          f: [String]!
          g: [String!]!
          h: [String!]
          i: [[String]]
          j: [[[String]]]
          k: [[String]]!
          l: [[String!]!]!
        }`);
      const result = (await plugin(schema, [], {}, { outputFile: '' })) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`
        export type MyInput = {
          a: $ElementType<Scalars, 'String'>,
          b?: ?$ElementType<Scalars, 'Int'>,
          c?: ?MyType,
          d: MyType,
          e?: ?Array<?$ElementType<Scalars, 'String'>>,
          f: Array<?$ElementType<Scalars, 'String'>>,
          g: Array<$ElementType<Scalars, 'String'>>,
          h?: ?Array<$ElementType<Scalars, 'String'>>,
          i?: ?Array<?Array<?$ElementType<Scalars, 'String'>>>,
          j?: ?Array<?Array<?Array<?$ElementType<Scalars, 'String'>>>>,
          k: Array<?Array<?$ElementType<Scalars, 'String'>>>,
          l: Array<Array<$ElementType<Scalars, 'String'>>>,
        };
      `);

      validateFlow(result);
    });
  });

  describe('Object', () => {
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
          foo?: ?$ElementType<Scalars, 'String'>,
          bar: $ElementType<Scalars, 'String'>,
        };
      `);
      validateFlow(result);
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
          __typename?: 'MyInterface',
          foo: $ElementType<Scalars, 'String'>,
        };
      `);
      expect(result.content).toBeSimilarStringTo(`
        export type MyType = MyInterface & {
          __typename?: 'MyType',
          foo: $ElementType<Scalars, 'String'>,
        };
      `);
      validateFlow(result);
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
          __typename?: 'MyInterface',
          foo: $ElementType<Scalars, 'String'>,
        };
      `);
      expect(result.content).toBeSimilarStringTo(`
        export type MyOtherInterface = {
          __typename?: 'MyOtherInterface',
          bar: $ElementType<Scalars, 'String'>,
        };
      `);
      expect(result.content).toBeSimilarStringTo(`
        export type MyType = MyInterface & MyOtherInterface & {
          __typename?: 'MyType',
          foo: $ElementType<Scalars, 'String'>,
          bar: $ElementType<Scalars, 'String'>,
        };
      `);
      validateFlow(result);
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
          bar: $ElementType<Scalars, 'String'>,
        };
      `);
      validateFlow(result);
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

      validateFlow(result);
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
          __typename?: 'MyInterface',
          foo?: ?$ElementType<Scalars, 'String'>,
          bar: $ElementType<Scalars, 'String'>,
        };
      `);
      validateFlow(result);
    });
  });

  describe('Directives', () => {
    it('Should handle directive declarations correctly by clearing it', async () => {
      const schema = buildSchema(`
        directive @simple on FIELD_DEFINITION
        directive @withArgument(arg: Int!) on FIELD_DEFINITION
        directive @objSimple on OBJECT
        directive @universal on OBJECT | FIELD_DEFINITION | ENUM_VALUE
      `);

      const result = (await plugin(schema, [], {}, { outputFile: '' })) as Types.ComplexPluginOutput;

      validateFlow(result);
    });
  });

  describe('Issues', () => {
    it('Issue #1645 - Input type fields does not have optional sign', async () => {
      const schema = buildSchema(/* GraphQL */ `
        schema {
          mutation: Mutation
        }

        type Mutation {
          updateUser(userId: ID!, update: UpdateUser): User!
        }

        type User {
          id: ID!
          username: String!
          email: String!
        }

        input UpdateUser {
          username: String
          email: String
        }
      `);

      const result = (await plugin(schema, [], {}, { outputFile: '' })) as Types.ComplexPluginOutput;

      expect(result.content).toBeSimilarStringTo(`export type UpdateUser = {
          username?: ?$ElementType<Scalars, 'String'>,
          email?: ?$ElementType<Scalars, 'String'>,
        };`);

      validateFlow(result);
    });
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

    const content = (await plugin(schema, [], { skipTypename: true }, { outputFile: '' })) as Types.ComplexPluginOutput;
    expect(content).not.toContain('__typename');

    validateFlow(content);
  });
});
