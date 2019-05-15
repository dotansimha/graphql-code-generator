import '@graphql-codegen/testing';
import { buildSchema } from 'graphql';
import { plugin } from '../src';
import { schema } from '../../../typescript/resolvers/tests/common';
import { Types } from '@graphql-codegen/plugin-helpers';

describe('Flow Resolvers Plugin', () => {
  it('Should generate basic type resolvers', () => {
    const result = plugin(schema, [], {}, { outputFile: '' });

    expect(result).toMatchSnapshot();
  });

  it('Should generate the correct imports when schema has scalars', () => {
    const result = plugin(buildSchema(`scalar MyScalar`), [], {}, { outputFile: '' }) as Types.ComplexPluginOutput;

    expect(result.prepend).toContain(`import { type GraphQLResolveInfo, type GraphQLScalarTypeConfig } from 'graphql';`);
  });

  it('Should generate the correct imports when schema has no scalars', () => {
    const result = plugin(buildSchema(`type MyType { f: String }`), [], {}, { outputFile: '' }) as Types.ComplexPluginOutput;

    expect(result.prepend).not.toContain(`import { type GraphQLResolveInfo, type GraphQLScalarTypeConfig } from 'graphql';`);
  });

  it('Should generate the correct resolver args type names when typesPrefix is specified', () => {
    const result = plugin(buildSchema(`type MyType { f(a: String): String }`), [], { typesPrefix: 'T' }, { outputFile: '' }) as Types.ComplexPluginOutput;

    expect(result.content).toBeSimilarStringTo(`f?: Resolver<?$ElementType<TResolversTypes, 'String'>, ParentType, ContextType, TMyTypeFArgs>,`);
  });
});
