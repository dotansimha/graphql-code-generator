import '@graphql-codegen/testing';
import { buildSchema } from 'graphql';
import { plugin } from '../src';
import { schema } from '../../typescript-resolvers/tests/common';

describe('Flow Resolvers Plugin', () => {
  it('Should generate basic type resolvers', () => {
    const result = plugin(schema, [], {}, { outputFile: '' });

    expect(result).toMatchSnapshot();
  });

  it('Should generate the correct imports when schema has scalars', () => {
    const result = plugin(buildSchema(`scalar MyScalar`), [], {}, { outputFile: '' });

    expect(result).toBeSimilarStringTo(`import { type GraphQLResolveInfo, type GraphQLScalarTypeConfig } from 'graphql';`);
  });

  it('Should generate the correct imports when schema has no scalars', () => {
    const result = plugin(buildSchema(`type MyType { f: String }`), [], {}, { outputFile: '' });

    expect(result).not.toBeSimilarStringTo(`import { type GraphQLResolveInfo, type GraphQLScalarTypeConfig } from 'graphql';`);
  });

  it('Should generate the correct resolver args type names when typesPrefix is specified', () => {
    const result = plugin(buildSchema(`type MyType { f(a: String): String }`), [], { typesPrefix: 'T' }, { outputFile: '' });

    expect(result).toBeSimilarStringTo(`f?: Resolver<?$ElementType<TResolversTypes, 'String'>, ParentType, ContextType, TMyTypeFArgs>,`);
  });
});
