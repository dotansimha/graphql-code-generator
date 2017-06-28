import { GraphQLObjectType, GraphQLString, GraphQLUnionType } from 'graphql';
import { transformUnion } from '../src/schema/transform-union';

describe('transformUnion', () => {
  it('should use the correct value of name', () => {
    const bookType = new GraphQLObjectType({
      name : 'Book',
      fields : {
        author : { type : GraphQLString }
      }
    });
    const gqlObj = new GraphQLUnionType({
      name: 'MyUnion',
      types: [ bookType ],
      resolveType: () => null,
    });

    const result = transformUnion(gqlObj);

    expect(result.name).toBe('MyUnion');
    expect(result.description).toBe('');
  });

  it('should use the correct value of description', () => {
    const bookType = new GraphQLObjectType({
      name : 'Book',
      fields : {
        author : { type : GraphQLString }
      }
    });
    const gqlObj = new GraphQLUnionType({
      name: 'MyUnion',
      description: 'test',
      types: [ bookType ],
      resolveType: () => null,
    });

    const result = transformUnion(gqlObj);

    expect(result.description).toBe('test');
  });

  it('should identify the correct available types for the union', () => {
    const bookType = new GraphQLObjectType({
      name : 'Book',
      fields : {
        author : { type : GraphQLString }
      }
    });
    const gqlObj = new GraphQLUnionType({
      name: 'MyUnion',
      description: 'test',
      types: [ bookType ],
      resolveType: () => null,
    });

    const result = transformUnion(gqlObj);

    expect(result.possibleTypes.length).toBe(1);
    expect(result.possibleTypes[0]).toBe('Book');
  });
});
