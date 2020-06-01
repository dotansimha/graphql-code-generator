import '@graphql-codegen/testing';
import { buildSchema } from 'graphql';
import { plugin } from '../src';

const SCALARS = `from typing import Optional, List
from enum import Enum`;

describe('Python', () => {
  it('should output a simple class', async () => {
    const schema = buildSchema(`type SimpleClass {
      attr: String!
    }`);
    const result = await plugin(schema, [], {}, {});
    expect(result.content).toBeSimilarStringTo(`
      ${SCALARS}
    
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
      ${SCALARS}
      
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
      Uncle Bob would be disappointed with the lack of self-documentation
      """
      type SimpleClass {
        attr: String!
      }`);

    const result = await plugin(schema, [], {}, {});
    expect(result.content).toBeSimilarStringTo(`
      ${SCALARS}
      
      """
      So, so many comments on this class!
      Uncle Bob would be disappointed with the lack of self-documentation
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
        ${SCALARS}
      
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
      ${SCALARS}
      
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
    ${SCALARS}
    
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
${SCALARS}

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
${SCALARS}

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
${SCALARS}

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
      ${SCALARS}
    
      class SimpleInput:
        attr: str
    `);
  });
});
