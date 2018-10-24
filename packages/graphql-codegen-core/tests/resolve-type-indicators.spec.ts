import { buildASTSchema, parse } from 'graphql';
import { resolveTypeIndicators } from '../src/schema/resolve-type-indicators';

describe('resolveTypeIndicators', () => {
  function parseAndBuildSchema<T>(str: string, typeName: string): T {
    const schema = buildASTSchema(
      parse(`
      type Query {
        test: Int
      }
      
      ${str}
    `)
    );

    return (schema.getTypeMap()[typeName] as unknown) as T;
  }

  it('should return the correct indicators when using interface', () => {
    const type = parseAndBuildSchema(
      `
    interface A {
      f: String
    }`,
      'A'
    ) as any;

    const indicators = resolveTypeIndicators(type);

    expect(indicators.isEnum).toBeFalsy();
    expect(indicators.isType).toBeFalsy();
    expect(indicators.isUnion).toBeFalsy();
    expect(indicators.isScalar).toBeFalsy();
    expect(indicators.isInputType).toBeFalsy();
    expect(indicators.isInterface).toBeTruthy();
  });

  it('should return the correct indicators when using scalar', () => {
    const type = parseAndBuildSchema(
      `
    scalar A
    `,
      'A'
    ) as any;

    const indicators = resolveTypeIndicators(type);

    expect(indicators.isEnum).toBeFalsy();
    expect(indicators.isType).toBeFalsy();
    expect(indicators.isUnion).toBeFalsy();
    expect(indicators.isInputType).toBeFalsy();
    expect(indicators.isInterface).toBeFalsy();

    expect(indicators.isScalar).toBeTruthy();
  });

  it('should return the correct indicators when using enum', () => {
    const type = parseAndBuildSchema(
      `
    enum A {
      V1,
      V2
    }
    `,
      'A'
    ) as any;

    const indicators = resolveTypeIndicators(type);

    expect(indicators.isScalar).toBeFalsy();
    expect(indicators.isType).toBeFalsy();
    expect(indicators.isUnion).toBeFalsy();
    expect(indicators.isInputType).toBeFalsy();
    expect(indicators.isInterface).toBeFalsy();

    expect(indicators.isEnum).toBeTruthy();
  });

  it('should return the correct indicators when using input', () => {
    const type = parseAndBuildSchema(
      `
    input A {
      f: String
    }
    `,
      'A'
    ) as any;

    const indicators = resolveTypeIndicators(type);

    expect(indicators.isScalar).toBeFalsy();
    expect(indicators.isType).toBeFalsy();
    expect(indicators.isUnion).toBeFalsy();
    expect(indicators.isEnum).toBeFalsy();
    expect(indicators.isInterface).toBeFalsy();

    expect(indicators.isInputType).toBeTruthy();
  });

  it('should return the correct indicators when using type', () => {
    const type = parseAndBuildSchema(
      `
    type A {
      f: String
    }
    `,
      'A'
    ) as any;

    const indicators = resolveTypeIndicators(type);

    expect(indicators.isScalar).toBeFalsy();
    expect(indicators.isInputType).toBeFalsy();
    expect(indicators.isUnion).toBeFalsy();
    expect(indicators.isEnum).toBeFalsy();
    expect(indicators.isInterface).toBeFalsy();

    expect(indicators.isType).toBeTruthy();
  });

  it('should return the correct indicators when using union', () => {
    const type = parseAndBuildSchema(
      `
    type B {
      f: String
    }
    
    type C {
      f: String
    }
    
    union A = B | C
    `,
      'A'
    ) as any;

    const indicators = resolveTypeIndicators(type);

    expect(indicators.isScalar).toBeFalsy();
    expect(indicators.isInputType).toBeFalsy();
    expect(indicators.isType).toBeFalsy();
    expect(indicators.isEnum).toBeFalsy();
    expect(indicators.isInterface).toBeFalsy();

    expect(indicators.isUnion).toBeTruthy();
  });
});
