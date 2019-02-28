import { buildASTSchema, GraphQLObjectType, parse } from 'graphql';
import { resolveArguments } from '../src/schema/resolve-arguments';

describe('resolveArguments', () => {
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

  it('should resolve correctly when there is one arguments', () => {
    const parsed = parseAndBuildSchema<GraphQLObjectType>(
      `
      type A {
        f1(arg: String): String
      }
    `,
      'A'
    );

    const args = parsed.getFields()['f1'].args;
    const result = resolveArguments({} as any, args);

    expect(result.length).toBe(1);
  });

  it('should resolve correctly when there are more then one arguments', () => {
    const parsed = parseAndBuildSchema<GraphQLObjectType>(
      `
      type A {
        f1(arg: String, arg2: Int): String
      }
    `,
      'A'
    );

    const args = parsed.getFields()['f1'].args;
    const result = resolveArguments({} as any, args);

    expect(result.length).toBe(2);
  });

  it('should resolve correctly when there are no arguments', () => {
    const parsed = parseAndBuildSchema<GraphQLObjectType>(
      `
      type A {
        f1: String
      }
    `,
      'A'
    );

    const args = parsed.getFields()['f1'].args;
    const result = resolveArguments({} as any, args);

    expect(result.length).toBe(0);
  });

  it('should resolve correctly when using argument of primitive scalar', () => {
    const parsed = parseAndBuildSchema<GraphQLObjectType>(
      `
      type A {
        f1(arg: String): String
      }
    `,
      'A'
    );

    const args = parsed.getFields()['f1'].args;
    const result = resolveArguments({} as any, args);

    expect(result.length).toBe(1);
    expect(result[0].name).toBe('arg');
    expect(result[0].type).toBe('String');
    expect(result[0].description).toBe('');
    expect(result[0].isArray).toBeFalsy();
    expect(result[0].isRequired).toBeFalsy();
  });

  it('should resolve correctly when using argument of array primitive scalar', () => {
    const parsed = parseAndBuildSchema<GraphQLObjectType>(
      `
      type A {
        f1(arg: [String]): String
      }
    `,
      'A'
    );

    const args = parsed.getFields()['f1'].args;
    const result = resolveArguments({} as any, args);

    expect(result.length).toBe(1);
    expect(result[0].name).toBe('arg');
    expect(result[0].type).toBe('String');
    expect(result[0].description).toBe('');
    expect(result[0].isArray).toBeTruthy();
    expect(result[0].isRequired).toBeFalsy();
  });

  it('should resolve correctly when using argument of required primitive scalar', () => {
    const parsed = parseAndBuildSchema<GraphQLObjectType>(
      `
      type A {
        f1(arg: String!): String
      }
    `,
      'A'
    );

    const args = parsed.getFields()['f1'].args;
    const result = resolveArguments({} as any, args);

    expect(result.length).toBe(1);
    expect(result[0].name).toBe('arg');
    expect(result[0].type).toBe('String');
    expect(result[0].description).toBe('');
    expect(result[0].isArray).toBeFalsy();
    expect(result[0].isRequired).toBeTruthy();
  });

  it('should resolve correctly when using argument of required array primitive scalar', () => {
    const parsed = parseAndBuildSchema<GraphQLObjectType>(
      `
      type A {
        f1(arg: [String]!): String
      }
    `,
      'A'
    );

    const args = parsed.getFields()['f1'].args;
    const result = resolveArguments({} as any, args);

    expect(result.length).toBe(1);
    expect(result[0].name).toBe('arg');
    expect(result[0].type).toBe('String');
    expect(result[0].description).toBe('');
    expect(result[0].isArray).toBeTruthy();
    expect(result[0].isRequired).toBeTruthy();
  });

  it('should resolve correctly when using argument of input type', () => {
    const parsed = parseAndBuildSchema<GraphQLObjectType>(
      `
      type A {
        f1(arg: T): String
      }
      
      input T {
        t1: String
        t2: String
      }
    `,
      'A'
    );

    const args = parsed.getFields()['f1'].args;
    const result = resolveArguments({} as any, args);

    expect(result.length).toBe(1);
    expect(result[0].name).toBe('arg');
    expect(result[0].type).toBe('T');
    expect(result[0].description).toBe('');
    expect(result[0].isArray).toBeFalsy();
    expect(result[0].isRequired).toBeFalsy();
  });

  it('should resolve correctly when using arguments with default values', () => {
    const parsed = parseAndBuildSchema<GraphQLObjectType>(
      `
      type A {
        f1(offset: Int = 0, limit: Int = 50): String
      }
    `,
      'A'
    );

    const args = parsed.getFields()['f1'].args;
    const result = resolveArguments({} as any, args);

    expect(result.length).toBe(2);

    expect(result[0].name).toBe('offset');
    expect(result[0].type).toBe('Int');
    expect(result[0].hasDefaultValue).toBe(true);
    expect(result[0].defaultValue).toBe(0);

    expect(result[1].name).toBe('limit');
    expect(result[1].type).toBe('Int');
    expect(result[1].hasDefaultValue).toBe(true);
    expect(result[1].defaultValue).toBe(50);
  });
});
