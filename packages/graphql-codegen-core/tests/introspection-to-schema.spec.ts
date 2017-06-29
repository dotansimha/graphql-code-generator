import { introspectionToGraphQLSchema } from '../src/utils/introspection-to-schema';
import * as validSchema from '../../graphql-codegen-generators/dev-test/githunt/schema.json';
import { GraphQLSchema } from 'graphql';

describe('introspectionToGraphQLSchema', () => {
  it('should throw when introspection object is not valid', () => {
    expect(() => introspectionToGraphQLSchema({} as any)).toThrow();
  });

  it('should return a GraphQLSchema object when passing a valid introspection', () => {
    const schema = introspectionToGraphQLSchema(validSchema);
    expect(schema instanceof GraphQLSchema).toBeTruthy();
  });
});
