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

  it('Default values of args and compatibility with typescript plugin', async () => {
    const testSchema = buildSchema(/* GraphQL */ `
      type Query {
        something(arg: String = "default_value"): String
      }
    `);

    const config: any = { noSchemaStitching: true };
    const result = (await plugin(testSchema, [], config, { outputFile: '' })) as Types.ComplexPluginOutput;

    expect(result.prepend).toContain(`export type $RequireFields<Origin, Keys> = $Diff<Args, Keys> & $ObjMapi<Keys, <Key>(k: Key) => $NonMaybeType<$ElementType<Origin, Key>>>;`);
    expect(result.content).toContain(`something?: Resolver<?$ElementType<ResolversTypes, 'String'>, ParentType, ContextType, $RequireFields<QuerySomethingArgs, { arg: * }>>,`);
  });

  it('Should generate ResolversParentTypes', () => {
    const result = plugin(schema, [], {}, { outputFile: '' }) as Types.ComplexPluginOutput;

    expect(result.content).toBeSimilarStringTo(`
      /** Mapping between all available schema types and the resolvers parents */
      export type ResolversParentTypes = {
        Query: {},
        MyType: MyType,
        String: $ElementType<Scalars, 'String'>,
        MyOtherType: MyOtherType,
        Subscription: {},
        Boolean: $ElementType<Scalars, 'Boolean'>,
        Node: Node,
        ID: $ElementType<Scalars, 'ID'>,
        SomeNode: SomeNode,
        MyUnion: $ElementType<ResolversTypes, 'MyType'> | $ElementType<ResolversTypes, 'MyOtherType'>,
        MyScalar: $ElementType<Scalars, 'MyScalar'>,
        Int: $ElementType<Scalars, 'Int'>,
      };
    `);
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

  it('should use MaybePromise in ResolverTypeWrapper', async () => {
    const testSchema = buildSchema(/* GraphQL */ `
      type MyQuery {
        posts: [Post]
      }

      type Post {
        author: String
        comment: String
      }

      schema {
        query: MyQuery
      }
    `);
    const content = (await plugin(
      testSchema,
      [],
      {
        rootValueType: 'MyRoot',
        asyncResolverTypes: true,
      } as any,
      { outputFile: 'graphql.ts' }
    )) as Types.ComplexPluginOutput;

    expect(content.content).toBeSimilarStringTo(`
      export type ResolverTypeWrapper<T> = Promise<T> | T;
    `);
  });
});
