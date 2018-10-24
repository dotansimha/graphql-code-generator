import { buildASTSchema, GraphQLObjectType, parse } from 'graphql';
import { resolveFields } from '../src/schema/transform-fields';

describe('resolveFields', () => {
  function parseAndBuildSchema<T>(str: string, typeName: string): T {
    return (buildASTSchema(
      parse(`
      type Query {
        test: Int
      }
      
      ${str}
    `)
    ).getTypeMap()[typeName] as unknown) as T;
  }

  it('should build the correct fields map when using type with single primitive scalar', () => {
    const parsed = parseAndBuildSchema<GraphQLObjectType>(
      `
      type A {
        f1: String
      }
    `,
      'A'
    );

    const result = resolveFields({} as any, parsed.getFields(), null);

    expect(result.length).toBe(1);
    expect(result[0].name).toBe('f1');
    expect(result[0].description).toBe('');
    expect(result[0].isRequired).toBeFalsy();
    expect(result[0].isArray).toBeFalsy();
    expect(result[0].arguments.length).toBe(0);
    expect(result[0].hasArguments).toBeFalsy();
  });

  it('should build the correct fields map when using type with single primitive scalar and args', () => {
    const parsed = parseAndBuildSchema<GraphQLObjectType>(
      `
      type A {
        f1(t: String): String
      }
    `,
      'A'
    );

    const result = resolveFields({} as any, parsed.getFields(), null);

    expect(result.length).toBe(1);
    expect(result[0].name).toBe('f1');
    expect(result[0].description).toBe('');
    expect(result[0].isRequired).toBeFalsy();
    expect(result[0].isArray).toBeFalsy();
    expect(result[0].arguments.length).toBe(1);
    expect(result[0].hasArguments).toBeTruthy();
  });

  it('should identify the correct number of fields', () => {
    const parsed = parseAndBuildSchema<GraphQLObjectType>(
      `
      type A {
        f1: String
        f2: Int
        f3: Float
        f4: ID
      }
    `,
      'A'
    );

    const result = resolveFields({} as any, parsed.getFields(), null);

    expect(result.length).toBe(4);
    expect(result[0].name).toBe('f1');
    expect(result[1].name).toBe('f2');
    expect(result[2].name).toBe('f3');
    expect(result[3].name).toBe('f4');
  });

  it('should identify Array type', () => {
    const parsed = parseAndBuildSchema<GraphQLObjectType>(
      `
      type A {
        f1: [String]
      }
    `,
      'A'
    );

    const result = resolveFields({} as any, parsed.getFields(), null);

    expect(result.length).toBe(1);
    expect(result[0].name).toBe('f1');
    expect(result[0].type).toBe('String');
    expect(result[0].isArray).toBeTruthy();
    expect(result[0].isRequired).toBeFalsy();
  });

  it('should identify required Array type', () => {
    const parsed = parseAndBuildSchema<GraphQLObjectType>(
      `
      type A {
        f1: [String]!
      }
    `,
      'A'
    );

    const result = resolveFields({} as any, parsed.getFields(), null);

    expect(result.length).toBe(1);
    expect(result[0].name).toBe('f1');
    expect(result[0].type).toBe('String');
    expect(result[0].isArray).toBeTruthy();
    expect(result[0].isRequired).toBeTruthy();
  });

  it('should identify required Array type with inner required', () => {
    const parsed = parseAndBuildSchema<GraphQLObjectType>(
      `
      type A {
        f1: [String!]!
      }
    `,
      'A'
    );

    const result = resolveFields({} as any, parsed.getFields(), null);

    expect(result.length).toBe(1);
    expect(result[0].name).toBe('f1');
    expect(result[0].type).toBe('String');
    expect(result[0].isArray).toBeTruthy();
    expect(result[0].isRequired).toBeTruthy();
  });

  it('should identify required Array type with inner required only', () => {
    const parsed = parseAndBuildSchema<GraphQLObjectType>(
      `
      type A {
        f1: [String!]
      }
    `,
      'A'
    );

    const result = resolveFields({} as any, parsed.getFields(), null);

    expect(result.length).toBe(1);
    expect(result[0].name).toBe('f1');
    expect(result[0].type).toBe('String');
    expect(result[0].isArray).toBeTruthy();
    expect(result[0].isRequired).toBeFalsy();
  });

  it('should identify other custom types', () => {
    const parsed = parseAndBuildSchema<GraphQLObjectType>(
      `
      type A {
        f1: B
      }
      
      type B {
        f: String
      }
    `,
      'A'
    );

    const result = resolveFields({} as any, parsed.getFields(), null);

    expect(result.length).toBe(1);
    expect(result[0].name).toBe('f1');
    expect(result[0].type).toBe('B');
    expect(result[0].isArray).toBeFalsy();
    expect(result[0].isRequired).toBeFalsy();
  });

  it('should identify other custom types with required', () => {
    const parsed = parseAndBuildSchema<GraphQLObjectType>(
      `
      type A {
        f1: B!
      }
      
      type B {
        f: String
      }
    `,
      'A'
    );

    const result = resolveFields({} as any, parsed.getFields(), null);

    expect(result.length).toBe(1);
    expect(result[0].name).toBe('f1');
    expect(result[0].type).toBe('B');
    expect(result[0].isArray).toBeFalsy();
    expect(result[0].isRequired).toBeTruthy();
  });

  it('should identify other custom types with array', () => {
    const parsed = parseAndBuildSchema<GraphQLObjectType>(
      `
      type A {
        f1: [B]
      }
      
      type B {
        f: String
      }
    `,
      'A'
    );

    const result = resolveFields({} as any, parsed.getFields(), null);

    expect(result.length).toBe(1);
    expect(result[0].name).toBe('f1');
    expect(result[0].type).toBe('B');
    expect(result[0].isArray).toBeTruthy();
    expect(result[0].isRequired).toBeFalsy();
  });

  it('should identify other custom types with interfaces', () => {
    const parsed = parseAndBuildSchema<GraphQLObjectType>(
      `
      type A {
        f1: B
      }
      
      interface T {
        f: String
      }
      
      type B implements T {
        f: String
      }
    `,
      'A'
    );

    const result = resolveFields({} as any, parsed.getFields(), null);

    expect(result.length).toBe(1);
    expect(result[0].name).toBe('f1');
    expect(result[0].type).toBe('B');
    expect(result[0].isArray).toBeFalsy();
    expect(result[0].isRequired).toBeFalsy();
  });

  it('should identify other custom types with union', () => {
    const parsed = parseAndBuildSchema<GraphQLObjectType>(
      `
      type A {
        f1: B
      }
      
      union B = C | D
      
      type C {
        t: String
      }
      
      type D {
        t: String
      }
    `,
      'A'
    );

    const result = resolveFields({} as any, parsed.getFields(), null);

    expect(result.length).toBe(1);
    expect(result[0].name).toBe('f1');
    expect(result[0].type).toBe('B');
    expect(result[0].isArray).toBeFalsy();
    expect(result[0].isRequired).toBeFalsy();
  });
  it('should identify other custom types with required union', () => {
    const parsed = parseAndBuildSchema<GraphQLObjectType>(
      `
      type A {
        f1: B!
      }
      
      union B = C | D
      
      type C {
        t: String
      }
      
      type D {
        t: String
      }
    `,
      'A'
    );

    const result = resolveFields({} as any, parsed.getFields(), null);

    expect(result.length).toBe(1);
    expect(result[0].name).toBe('f1');
    expect(result[0].type).toBe('B');
    expect(result[0].isArray).toBeFalsy();
    expect(result[0].isRequired).toBeTruthy();
  });

  it('should identify other custom types with union array', () => {
    const parsed = parseAndBuildSchema<GraphQLObjectType>(
      `
      type A {
        f1: [B]
      }
      
      union B = C | D
      
      type C {
        t: String
      }
      
      type D {
        t: String
      }
    `,
      'A'
    );

    const result = resolveFields({} as any, parsed.getFields(), null);

    expect(result.length).toBe(1);
    expect(result[0].name).toBe('f1');
    expect(result[0].type).toBe('B');
    expect(result[0].isArray).toBeTruthy();
    expect(result[0].isRequired).toBeFalsy();
  });
});
