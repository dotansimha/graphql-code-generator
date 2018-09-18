import { GraphQLEnumType } from 'graphql';
import { transformGraphQLEnum } from '../src/schema/transform-enum';
import { makeExecutableSchema } from 'graphql-tools';

describe('transformGraphQLEnum', () => {
  it('should use the correct value of name', () => {
    const gqlEnum = new GraphQLEnumType({
      name: 'name',
      values: {
        A: {}
      }
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
        A: {}
      }
    });

    const result = transformGraphQLEnum({} as any, gqlEnum);

    expect(result.description).toBe('my enum');
  });

  it('should use the correct value of value mapping', () => {
    const gqlEnum = new GraphQLEnumType({
      name: 'name',
      description: 'my enum',
      values: {
        A: {}
      }
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
        C: {}
      }
    });

    const result = transformGraphQLEnum({} as any, gqlEnum);

    expect(result.values instanceof Array).toBeTruthy();
    expect(result.values.length).toBe(3);
  });

  it('should expose the correct directives and indicators for enum and enum values', () => {
    const schema = makeExecutableSchema({
      typeDefs: `
          directive @lookup on ENUM
          directive @lookupItem(id:Int! ,name: String!) on ENUM_VALUE
          
          enum Color @lookup {
              RED @lookupItem(id:1 ,name: "Red")
              GREEN @lookupItem(id:2 ,name: "Green")
          }
          
          type Query {
            dummy: String
          }
      `,
      allowUndefinedInResolve: true
    });

    const enumType = schema.getType('Color') as GraphQLEnumType;
    const result = transformGraphQLEnum(schema, enumType);

    expect(result.values instanceof Array).toBeTruthy();
    expect(result.values.length).toBe(2);

    // Enum
    expect(result.directives).toBeDefined();
    expect(result.usesDirectives).toBeTruthy();
    expect(result.directives['lookup']).toBeDefined();

    // values
    expect(result.values[0].usesDirectives).toBeTruthy();
    expect(result.values[1].usesDirectives).toBeTruthy();

    expect(result.values[0].directives['lookupItem']).toBeDefined();
    expect(result.values[1].directives['lookupItem']).toBeDefined();

    expect(result.values[0].directives['lookupItem'].id).toBe(1);
    expect(result.values[1].directives['lookupItem'].id).toBe(2);

    expect(result.values[0].directives['lookupItem'].name).toBe('Red');
    expect(result.values[1].directives['lookupItem'].name).toBe('Green');
  });
});
