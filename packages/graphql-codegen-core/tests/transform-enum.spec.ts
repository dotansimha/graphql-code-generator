import { GraphQLEnumType } from 'graphql';
import { transformGraphQLEnum } from '../src/schema/transform-enum';

describe('transformGraphQLEnum', () => {
  it('should use the correct value of name', () => {
    const gqlEnum = new GraphQLEnumType({
      name: 'name',
      values: {
        A: {},
      },
    });

    const result = transformGraphQLEnum({} as any, gqlEnum);

    expect(result.name).toBe('name');
    expect(result.description).toBe('');
  });

  it('should use the correct value of description', () => {
    const gqlEnum = new GraphQLEnumType({
      name: 'name',
      description: 'my enum',
      values: {
        A: {},
      },
    });

    const result = transformGraphQLEnum({} as any, gqlEnum);

    expect(result.description).toBe('my enum');
  });

  it('should use the correct value of value mapping', () => {
    const gqlEnum = new GraphQLEnumType({
      name: 'name',
      description: 'my enum',
      values: {
        A: {},
      },
    });

    const result = transformGraphQLEnum({} as any, gqlEnum);

    expect(result.values instanceof Array).toBeTruthy();
    expect(result.values.length).toBe(1);
    expect(result.values[0].description).toBe('');
    expect(result.values[0].name).toBe('A');
    expect(result.values[0].value).toBe('A');
  });

  it('should use the correct value of value mapping with multiple values', () => {
    const gqlEnum = new GraphQLEnumType({
      name: 'name',
      description: 'my enum',
      values: {
        A: {},
        B: {},
        C: {},
      },
    });

    const result = transformGraphQLEnum({} as any, gqlEnum);

    expect(result.values instanceof Array).toBeTruthy();
    expect(result.values.length).toBe(3);
  });
});
