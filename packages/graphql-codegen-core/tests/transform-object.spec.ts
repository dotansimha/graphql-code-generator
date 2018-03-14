import { GraphQLInputObjectType, GraphQLInterfaceType, GraphQLObjectType, GraphQLString } from 'graphql';
import { transformGraphQLObject } from '../src/schema/transform-object';

describe('transformObject', () => {
  it('should use the correct value of name', () => {
    const gqlObj = new GraphQLObjectType({
      name: 'name',
      fields: {
        test: {
          type: GraphQLString
        }
      }
    });

    const result = transformGraphQLObject({} as any, gqlObj);

    expect(result.name).toBe('name');
    expect(result.description).toBe('');
  });

  it('should identify correctly type of Input', () => {
    const gqlObj = new GraphQLInputObjectType({
      name: 'name',
      fields: {
        test: {
          type: GraphQLString
        }
      }
    });

    const result = transformGraphQLObject({} as any, gqlObj);
    expect(result.isInputType).toBeTruthy();
  });

  it('should identify correctly type of regular Type', () => {
    const gqlObj = new GraphQLObjectType({
      name: 'name',
      fields: {
        test: {
          type: GraphQLString
        }
      }
    });

    const result = transformGraphQLObject({} as any, gqlObj);
    expect(result.isInputType).toBeFalsy();
  });

  it('should use the correct value of description', () => {
    const gqlObj = new GraphQLObjectType({
      name: 'name',
      description: 'Test',
      fields: {
        test: {
          type: GraphQLString
        }
      }
    });

    const result = transformGraphQLObject({} as any, gqlObj);

    expect(result.description).toBe('Test');
  });

  it('should use the correct value of fields', () => {
    const gqlInterface = new GraphQLObjectType({
      name: 'name',
      fields: {
        test: {
          description: 'Test',
          type: GraphQLString
        }
      }
    });

    const result = transformGraphQLObject({} as any, gqlInterface);

    expect(result.fields.length).toBe(1);
    expect(result.fields[0].name).toBe('test');
    expect(result.fields[0].description).toBe('Test');
    expect(result.fields[0].type).toBe('String');
    expect(result.fields[0].isArray).toBeFalsy();
    expect(result.fields[0].isRequired).toBeFalsy();
  });

  it('should use the correct value of interfaces', () => {
    const bookType = new GraphQLObjectType({
      name: 'Book',
      fields: {
        author: { type: GraphQLString }
      }
    });

    const interface1 = new GraphQLInterfaceType({
      name: 'MyInterface',
      fields: {
        test: {
          description: 'Test',
          type: bookType
        }
      },
      resolveType: () => bookType
    });

    const gqlInterface = new GraphQLObjectType({
      name: 'name',
      fields: {
        test: {
          description: 'Test',
          type: bookType
        }
      },
      interfaces: [interface1]
    });

    const result = transformGraphQLObject({} as any, gqlInterface);

    expect(result.fields.length).toBe(1);
    expect(result.interfaces.length).toBe(1);
    expect(result.interfaces[0]).toBe('MyInterface');
  });
});
