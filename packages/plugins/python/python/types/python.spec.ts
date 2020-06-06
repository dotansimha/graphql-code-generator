import '@graphql-codegen/testing';
import { buildSchema } from 'graphql';
import { plugin } from '../src';

describe('Base Requirements', () => {
  it('should import optional, list, and enum types', async () => {
    const schema = buildSchema(`type SimpleClass {
      attr: String!
    }`);
    const result = await plugin(schema, [], {}, {});
    console.log(result.content);
    expect(result.content).toBeSimilarStringTo(`
      from typing import Optional, List
      from enum import Enum
    `);
  });

  it('should output a simple class', async () => {
    const schema = buildSchema(`type SimpleClass {
      attr: String!
    }`);
    const result = await plugin(schema, [], {}, {});
    expect(result.content).toBeSimilarStringTo(`
      class SimpleClass:
        __typename: str
        attr: str
    `);
  });

  it('should add comments to user classes', async () => {
    const schema = buildSchema(`
    "My sad, sad class"
    type SimpleClass {
      attr: String!
    }`);
    const result = await plugin(schema, [], {}, {});
    expect(result.content).toBeSimilarStringTo(`
      # My sad, sad class
      class SimpleClass:
        __typename: str
        attr: str
    `);
  });

  it('should add multi-line comments to user classes', async () => {
    const schema = buildSchema(`
      """
      So, so many comments on this class!
      Not the best self-documentation...
      """
      type SimpleClass {
        attr: String!
      }`);

    const result = await plugin(schema, [], {}, {});
    expect(result.content).toBeSimilarStringTo(`
      """
      So, so many comments on this class!
      Not the best self-documentation...
      """
      class SimpleClass:
        __typename: str
        attr: str
    `);
  });

  it('should handle nullable fields', async () => {
    const schema = buildSchema(`type SimpleClass {
        attr: String
      }`);
    const result = await plugin(schema, [], {}, {});
    expect(result.content).toBeSimilarStringTo(`
        class SimpleClass:
          __typename: str
          attr: Optional[str]
      `);
  });

  it('should handle arrays', async () => {
    const schema = buildSchema(`type SimpleClass {
      attr: [String]
    }`);
    const result = await plugin(schema, [], {}, {});
    expect(result.content).toBeSimilarStringTo(`
      class SimpleClass:
        __typename: str
        attr: Optional[List[Optional[str]]]
    `);
  });

  it('should handle all array-null variants', async () => {
    const schema = buildSchema(`type SimpleClass {
      fullyNullable: [String]
      nullableElements: [String]!
      nullableArray: [String!]
      notNullable: [String!]!
    }`);
    const result = await plugin(schema, [], {}, {});
    expect(result.content).toBeSimilarStringTo(`
      class SimpleClass:
        __typename: str
        fullyNullable: Optional[List[Optional[str]]]
        nullableElements: List[Optional[str]]
        nullableArray: Optional[List[str]]
        notNullable: List[str]
    `);
  });

  it('should create a class with every scalar', async () => {
    const schema = buildSchema(`type SimpleClass {
      attr: String!
      boolean: Boolean
      myFancyNum: Int!
      myLessPreciseButNoLessFancyNum: Float
    }`);
    const result = await plugin(schema, [], {}, {});
    expect(result.content).toBeSimilarStringTo(`
    class SimpleClass:
      __typename: str
      attr: str
      boolean: Optional[bool]
      myFancyNum: int
      myLessPreciseButNoLessFancyNum: Optional[float]
    `);
  });

  it('should reference user defined types', async () => {
    const schema = buildSchema(`
    type SimpleClass {
      attr: String!
    }
    
    type ComplexClass {
      complexAttr: SimpleClass
    }
    `);
    const result = await plugin(schema, [], {}, {});
    expect(result.content).toBeSimilarStringTo(`
    class SimpleClass:
      __typename: str
      attr: str

    class ComplexClass:
      __typename: str
      complexAttr: Optional[SimpleClass]
    `);
  });

  it('should permit enums', async () => {
    const schema = buildSchema(`
    enum Episode {
      NEWHOPE
      EMPIRE
      JEDI
    }
    
    
    type Character {
      appearsIn: [Episode!]!
    }
    `);
    const result = await plugin(schema, [], {}, {});
    expect(result.content).toBeSimilarStringTo(`
class Episode(Enum):
  Newhope = 'NEWHOPE'
  Empire = 'EMPIRE'
  Jedi = 'JEDI'

class Character:
  __typename: str
  appearsIn: List[Episode]
    `);
  });

  it('should convert union to Python union', async () => {
    const schema = buildSchema(`
      union BasicUnion = Int | String

      type BasicType {
        myUnion: BasicUnion!
      }
    `);
    const result = await plugin(schema, [], {}, {});
    expect(result.content).toBeSimilarStringTo(`
BasicUnion = Union[int, str]

class BasicType:
  __typename: str
  myUnion: BasicUnion
`);
  });

  it('should inherit interfaces in class', async () => {
    const schema = buildSchema(`
    interface MyInterface {
      field: String!
    }

    type SubType implements MyInterface {
      field: String!
      otherProp: Boolean!
    }
    `);
    const result = await plugin(schema, [], {}, {});
    expect(result.content).toBeSimilarStringTo(`
class MyInterface:
  field: str

class SubType(MyInterface):
  __typename: str
  field: str
  otherProp: bool
`);
  });

  it('should work for input types', async () => {
    const schema = buildSchema(`input SimpleInput {
      attr: String!
    }`);
    const result = await plugin(schema, [], {}, {});
    expect(result.content).toBeSimilarStringTo(`
      class SimpleInput:
        attr: str
    `);
  });

  it('should support custom scalars', async () => {
    const schema = buildSchema(`
      scalar MyScalar

      type MyType {
        foo: String
        bar: MyScalar!
      }`);
    const result = await plugin(schema, [], { scalars: { MyScalar: 'Date' } }, {});

    expect(result.content).toBeSimilarStringTo(`
      MyScalar = Date

      class MyType:
        __typename: str
        foo: Optional[str]
        bar: MyScalar
      `);
  });

  it('should include a description for Scalars type', async () => {
    const schema = buildSchema(/* GraphQL */ `
      "My custom scalar"
      scalar A
    `);
    const result = await plugin(schema, [], {}, { outputFile: '' });
    expect(result.content).toBeSimilarStringTo(`
      # My custom scalar
      A = any
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

    expect(result.content).toBeSimilarStringTo(`
      # MyInput
      class MyInput:`);
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
      # MyInput
      class MyInput:
        # f is something
        f: str
      `);
  });

  it('should comment type fields', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type SimpleType {
        "the attribute"
        attr: String!
      }
    `);
    const result = await plugin(schema, [], {}, { outputFile: '' });

    expect(result.content).toBeSimilarStringTo(`
    class SimpleType:
      __typename: str
      # the attribute
      attr: str
    `);
  });
});

describe('Config', () => {
  describe('Naming Convention & Types Prefix', async () => {
    it('Should use custom namingConvention for type name and args typename', async () => {
      const schema = buildSchema(`type MyType { foo(a: String!, b: String, c: [String], d: [Int!]!): String }`);
      const result = await plugin(schema, [], { namingConvention: 'lower-case#lowerCase' }, { outputFile: '' });

      expect(result.content).toBeSimilarStringTo(`
        class mytypefooargs:
          a: str
          b: Optional[str]
          c: Optional[List[Optional[str]]]
          d: List[int]
    `);
      expect(result.content).toBeSimilarStringTo(`
        class mytype:
          __typename: str
          foo: Optional[str]
    `);
    });
  });
});
