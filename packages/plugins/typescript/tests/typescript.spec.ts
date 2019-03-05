import 'graphql-codegen-core/dist/testing';
import { buildSchema, parse } from 'graphql';
import { validateTs } from './validate';
import { plugin } from '../src/index';

describe('TypeScript', () => {
  describe('Config', () => {
    it('Should build type correctly when specified with avoidOptionals config', async () => {
      const schema = buildSchema(`
        type MyType {
          foo: String
          bar: String!
        }`);
      const result = await plugin(schema, [], { avoidOptionals: true }, { outputFile: '' });

      expect(result).toBeSimilarStringTo(`
        export type MyType = {
          foo: Maybe<string>,
          bar: string,
        };
      `);
      validateTs(result);
    });

    it('Should build type correctly when specified with immutableTypes config', async () => {
      const schema = buildSchema(`
        type MyType {
          foo: [String!]!
        }`);
      const result = await plugin(schema, [], { immutableTypes: true }, { outputFile: '' });

      expect(result).toBeSimilarStringTo(`
        export type MyType = {
          readonly foo: ReadonlyArray<string>,
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

      expect(result).toBeSimilarStringTo(`
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
      const result = await plugin(schema, [], { enumsAsTypes: true }, { outputFile: '' });

      expect(result).toBeSimilarStringTo(`
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
      const result = await plugin(schema, [], { enumValues: { A: 'BOOP' }, enumsAsTypes: true }, { outputFile: '' });

      expect(result).toBeSimilarStringTo(`
      export type MyEnum = 'BOOP' | 'B';
    `);
      validateTs(result);
    });

    it.only('should handle introspection types (like __TypeKind)', async () => {
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

      const content = await plugin(
        testSchema,
        [{ filePath: '', content: query }],
        {},
        {
          outputFile: 'graphql.ts'
        }
      );

      console['log'](content);

      expect(content).toBeSimilarStringTo(`
        export type __Type = {
      `);
    });
  });

  describe('Object (type)', () => {
    it('Should build type correctly', async () => {
      const schema = buildSchema(`
        type MyType {
          foo: String
          bar: String!
        }`);
      const result = await plugin(schema, [], {}, { outputFile: '' });

      expect(result).toBeSimilarStringTo(`
        export type MyType = {
          foo?: Maybe<string>,
          bar: string,
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
      const result = await plugin(schema, [], {}, { outputFile: '' });

      expect(result).toBeSimilarStringTo(`
        export type MyInterface = {
          foo: string,
        };
      `);
      expect(result).toBeSimilarStringTo(`
        export type MyType = MyInterface & {
          foo: string,
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
      const result = await plugin(schema, [], {}, { outputFile: '' });

      expect(result).toBeSimilarStringTo(`
        export type MyInterface = {
          foo: string,
        };
      `);
      expect(result).toBeSimilarStringTo(`
        export type MyOtherInterface = {
          bar: string,
        };
      `);
      expect(result).toBeSimilarStringTo(`
        export type MyType = MyInterface & MyOtherInterface & {
          foo: string,
          bar: string,
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
      const result = await plugin(schema, [], {}, { outputFile: '' });

      expect(result).toBeSimilarStringTo(`
        export type MyType = {
          foo: MyOtherType,
        };
      `);
      expect(result).toBeSimilarStringTo(`
        export type MyOtherType = {
          bar: string,
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

      expect(result).toBeSimilarStringTo(`
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
      const result = await plugin(schema, [], {}, { outputFile: '' });

      expect(result).toBeSimilarStringTo(`
        export type MyInterface = {
          foo?: Maybe<string>,
          bar: string,
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

      expect(result).not.toContain('simple');
      expect(result).not.toContain('withArguments');
      expect(result).not.toContain('objSimple');
      expect(result).not.toContain('universal');
      validateTs(result);
    });
  });

  describe('Naming Convention & Types Prefix', () => {
    it('Should use custom namingConvention for type name and args typename', async () => {
      const schema = buildSchema(`type MyType { foo(a: String!, b: String, c: [String], d: [Int!]!): String }`);
      const result = await plugin(schema, [], { namingConvention: 'change-case#lowerCase' }, { outputFile: '' });

      expect(result).toBeSimilarStringTo(`
        export type mytypefooargs = {
          a: string,
          b?: Maybe<string>,
          c?: Maybe<Array<Maybe<string>>>,
          d: Array<number>
        };
    `);
      expect(result).toBeSimilarStringTo(`
        export type mytype = {
          foo?: Maybe<string>,
        };
    `);

      validateTs(result);
    });

    it('Should use custom namingConvention and add custom prefix', async () => {
      const schema = buildSchema(`type MyType { foo(a: String!, b: String, c: [String], d: [Int!]!): String }`);
      const result = await plugin(
        schema,
        [],
        { namingConvention: 'change-case#lowerCase', typesPrefix: 'I' },
        { outputFile: '' }
      );

      expect(result).toBeSimilarStringTo(`
        export type Imytypefooargs = {
          a: string,
          b?: Maybe<string>,
          c?: Maybe<Array<Maybe<string>>>,
          d: Array<number>
        };
      `);

      expect(result).toBeSimilarStringTo(`
        export type Imytype = {
          foo?: Maybe<string>,
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
      const result = await plugin(schema, [], { namingConvention: 'change-case#lowerCase' }, { outputFile: '' });

      expect(result).toBeSimilarStringTo(`
        export enum myenum {
          a = 'A',
          b = 'B',
          c = 'C'
        }
        `);
      expect(result).toBeSimilarStringTo(`
        export type mytype = {
          f?: Maybe<string>,
          bar?: Maybe<myenum>,
          b_a_r?: Maybe<string>,
          myOtherField?: Maybe<string>,
        };
        `);
      expect(result).toBeSimilarStringTo(`
        export type my_type = {
          linkTest?: Maybe<mytype>,
        };
        `);
      expect(result).toBeSimilarStringTo(`
        export type myunion = my_type | mytype;
        `);
      expect(result).toBeSimilarStringTo(`
        export type some_interface = {
          id: string,
        };
        `);
      expect(result).toBeSimilarStringTo(`
        export type impl1 = some_interface & {
          id: string,
        };
        `);
      expect(result).toBeSimilarStringTo(`
        export type impl_2 = some_interface & {
          id: string,
        };
        `);
      expect(result).toBeSimilarStringTo(`
        export type impl_3 = some_interface & {
          id: string,
        };
        `);
      expect(result).toBeSimilarStringTo(`
        export type query = {
          something?: Maybe<myunion>,
          use_interface?: Maybe<some_interface>,
        };
      `);

      validateTs(result);
    });

    it('Should generate correct values when using links between types - pascalCase (default)', async () => {
      const result = await plugin(schema, [], {}, { outputFile: '' });

      expect(result).toBeSimilarStringTo(`
      export enum MyEnum {
        A = 'A',
        B = 'B',
        C = 'C'
      }
      `);
      expect(result).toBeSimilarStringTo(`
      export type MyType = {
        f?: Maybe<string>,
        bar?: Maybe<MyEnum>,
        b_a_r?: Maybe<string>,
        myOtherField?: Maybe<string>,
      };
      `);
      expect(result).toBeSimilarStringTo(`
      export type My_Type = {
        linkTest?: Maybe<MyType>,
      };
      `);
      expect(result).toBeSimilarStringTo(`
      export type MyUnion = My_Type | MyType;
      `);
      expect(result).toBeSimilarStringTo(`
      export type Some_Interface = {
        id: string,
      };
      `);
      expect(result).toBeSimilarStringTo(`
      export type Impl1 = Some_Interface & {
        id: string,
      };
      `);
      expect(result).toBeSimilarStringTo(`
      export type Impl_2 = Some_Interface & {
        id: string,
      };
      `);
      expect(result).toBeSimilarStringTo(`
      export type Impl_3 = Some_Interface & {
        id: string,
      };
      `);
      expect(result).toBeSimilarStringTo(`
      export type Query = {
        something?: Maybe<MyUnion>,
        use_interface?: Maybe<Some_Interface>,
      };
      `);

      validateTs(result);
    });

    it('Should generate correct values when using links between types - pascalCase (default) with custom prefix', async () => {
      const result = await plugin(schema, [], { typesPrefix: 'I' }, { outputFile: '' });

      expect(result).toBeSimilarStringTo(`
      export enum IMyEnum {
        IA = 'A',
        IB = 'B',
        IC = 'C'
      };`);

      expect(result).toBeSimilarStringTo(`
      export type IMyType = {
        f?: Maybe<string>,
        bar?: Maybe<IMyEnum>,
        b_a_r?: Maybe<string>,
        myOtherField?: Maybe<string>,
      };`);
      expect(result).toBeSimilarStringTo(`
      export type IMy_Type = {
        linkTest?: Maybe<IMyType>,
      };
  `);
      expect(result).toBeSimilarStringTo(`export type IMyUnion = IMy_Type | IMyType;`);
      expect(result).toBeSimilarStringTo(`
      export type ISome_Interface = {
        id: string,
      };
      `);
      expect(result).toBeSimilarStringTo(`
      export type IImpl1 = ISome_Interface & {
        id: string,
      };
      `);
      expect(result).toBeSimilarStringTo(`
      export type IImpl_2 = ISome_Interface & {
        id: string,
      };
      `);
      expect(result).toBeSimilarStringTo(`
      export type IImpl_3 = ISome_Interface & {
        id: string,
      };
      `);
      expect(result).toBeSimilarStringTo(`
      export type IQuery = {
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

      const result = await plugin(schema, [], {}, { outputFile: '' });

      expect(result).toBeSimilarStringTo(`
        export type MyTypeFooArgs = {
          a: string,
          b?: Maybe<string>,
          c?: Maybe<Array<Maybe<string>>>,
          d: Array<number>
        };
    `);

      validateTs(result);
    });

    it('Should generate correctly types for field arguments - with default value', async () => {
      const schema = buildSchema(
        `type MyType { foo(a: String = "default", b: String! = "default", c: String): String }`
      );
      const result = await plugin(schema, [], {}, { outputFile: '' });

      expect(result).toBeSimilarStringTo(`
        export type MyTypeFooArgs = {
          a: string,
          b: string,
          c?: Maybe<string>
        };
    `);

      validateTs(result);
    });

    it('Should generate correctly types for field arguments - with input type', async () => {
      const schema = buildSchema(
        `input MyInput { f: String } type MyType { foo(a: MyInput, b: MyInput!, c: [MyInput], d: [MyInput]!, e: [MyInput!]!): String }`
      );
      const result = await plugin(schema, [], {}, { outputFile: '' });

      expect(result).toBeSimilarStringTo(`
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
      const schema = buildSchema(
        `input Input { name: String } type Mutation { foo(id: String, input: Input): String }`
      );
      const result = await plugin(schema, [], { typesPrefix: 'T' }, { outputFile: '' });

      expect(result).toBeSimilarStringTo(`
        export type TInput = {
          name: Maybe<string>,
        };
      `);

      expect(result).toBeSimilarStringTo(`
        export type TMutation = {
          foo?: Maybe<string>,
        };

        export type TMutationFooArgs = {
          id?: Maybe<string>,
          input?: Maybe<TInput>
        };
      `);

      validateTs(result);
    });
  });

  describe('Enum', () => {
    it('Should build basic enum correctly', async () => {
      const schema = buildSchema(`enum MyEnum { A, B, C }`);
      const result = await plugin(schema, [], {}, { outputFile: '' });

      expect(result).toBeSimilarStringTo(`
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
      const result = await plugin(schema, [], { enumValues: { A: 'SomeValue', B: 'TEST' } }, { outputFile: '' });

      expect(result).toBeSimilarStringTo(`
        export enum MyEnum {
          A = 'SomeValue',
          B = 'TEST',
          C = 'C'
        }
      `);

      validateTs(result);
    });
  });
});
