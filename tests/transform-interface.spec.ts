import { GraphQLInterfaceType, GraphQLString } from 'graphql';
import { transformInterface } from '../src/schema/transform-interface';

describe('transformInterface', () => {
  it('should use the correct value of name', () => {
    const gqlInterface = new GraphQLInterfaceType({
      name: 'name',
      fields: {
        test: {
          type: GraphQLString,
        }
      }
    });

    const result = transformInterface(gqlInterface);

    expect(result.name).toBe('name');
    expect(result.description).toBe('');
  });

  it('should use the correct value of description', () => {
    const gqlInterface = new GraphQLInterfaceType({
      name: 'name',
      description: 'Test',
      fields: {
        test: {
          type: GraphQLString,
        }
      }
    });

    const result = transformInterface(gqlInterface);

    expect(result.description).toBe('Test');
  });

  it('should use the correct value of fields', () => {
    const gqlInterface = new GraphQLInterfaceType({
      name: 'name',
      fields: {
        test: {
          description: 'Test',
          type: GraphQLString,
        }
      }
    });

    const result = transformInterface(gqlInterface);

    expect(result.fields.length).toBe(1);
    expect(result.fields[0].name).toBe('test');
    expect(result.fields[0].description).toBe('Test');
    expect(result.fields[0].type).toBe('String');
    expect(result.fields[0].isArray).toBeFalsy();
    expect(result.fields[0].isRequired).toBeFalsy();
  });
});
