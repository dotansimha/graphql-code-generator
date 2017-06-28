import { GraphQLScalarType } from 'graphql';
import { transformScalar } from '../src/schema/transform-scalar';

describe('transformScalar', () => {
  it('should use the correct value of name', () => {
    const gqlObj = new GraphQLScalarType({
      name: 'name',
      serialize: () => '',
    });

    const result = transformScalar(gqlObj);

    expect(result.name).toBe('name');
    expect(result.description).toBe('');
  });

  it('should use the correct value of description', () => {
    const gqlObj = new GraphQLScalarType({
      name: 'name',
      description: 'MyScalar',
      serialize: () => '',
    });

    const result = transformScalar(gqlObj);

    expect(result.name).toBe('name');
    expect(result.description).toBe('MyScalar');
  });

});
