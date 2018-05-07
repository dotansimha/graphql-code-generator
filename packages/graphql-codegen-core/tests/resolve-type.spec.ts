import { buildASTSchema, parse } from 'graphql';
import { resolveType } from '../src/schema/resolve-type';

describe('Resolve Type', function() {
  function parseAndBuildSchema<T = any>(str: string, typeName: string): T {
    const schema = buildASTSchema(
      parse(`
      type Query {
        test: Int
      }
      
      ${str}
    `)
    );

    return (schema.getTypeMap()[typeName] as any) as T;
  }

  it('should return the correct booleans when the type is optional', () => {
    const type = parseAndBuildSchema(
      `
    type A {
      f: String
    }`,
      'A'
    );

    const field = type.getFields()['f'].type;
    const result = resolveType(field);

    expect(result.raw).toBe('String');
    expect(result.isArray).toBeFalsy();
    expect(result.isRequired).toBeFalsy();
    expect(result.isNullableArray).toBeFalsy();
  });

  it('should return the correct type name', () => {
    const type = parseAndBuildSchema(
      `
    type A {
      f: String
    }`,
      'A'
    );

    const field = type.getFields()['f'].type;
    const result = resolveType(field);

    expect(result.raw).toBe('String');
    expect(result.name).toBe('String');
  });

  it('should return the correct booleans when the type is required', () => {
    const type = parseAndBuildSchema(
      `
    type A {
      f: String!
    }`,
      'A'
    );

    const field = type.getFields()['f'].type;
    const result = resolveType(field);

    expect(result.raw).toBe('String!');
    expect(result.isArray).toBeFalsy();
    expect(result.isRequired).toBeTruthy();
    expect(result.isNullableArray).toBeFalsy();
  });

  it('should return the correct booleans when the type is required and array', () => {
    const type = parseAndBuildSchema(
      `
    type A {
      f: [String]!
    }`,
      'A'
    );

    const field = type.getFields()['f'].type;
    const result = resolveType(field);

    expect(result.raw).toBe('[String]!');
    expect(result.isArray).toBeTruthy();
    expect(result.isRequired).toBeTruthy();
    expect(result.isNullableArray).toBeTruthy();
  });

  it('should return the correct booleans when the type is not required and array', () => {
    const type = parseAndBuildSchema(
      `
    type A {
      f: [String]
    }`,
      'A'
    );

    const field = type.getFields()['f'].type;
    const result = resolveType(field);

    expect(result.raw).toBe('[String]');
    expect(result.isArray).toBeTruthy();
    expect(result.isRequired).toBeFalsy();
    expect(result.isNullableArray).toBeTruthy();
  });

  it('should return the correct booleans when the type is required and array with no nullables', () => {
    const type = parseAndBuildSchema(
      `
    type A {
      f: [String!]!
    }`,
      'A'
    );

    const field = type.getFields()['f'].type;
    const result = resolveType(field);

    expect(result.raw).toBe('[String!]!');
    expect(result.isArray).toBeTruthy();
    expect(result.isRequired).toBeTruthy();
    expect(result.isNullableArray).toBeFalsy();
  });
});
