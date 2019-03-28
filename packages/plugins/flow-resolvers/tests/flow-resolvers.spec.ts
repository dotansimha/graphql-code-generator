import '@graphql-codegen/testing';
import { buildSchema } from 'graphql';
import { plugin } from '../src';
import { schema } from '../../typescript-resolvers/tests/common';

describe('Flow Resolvers Plugin', () => {
  it('Should generate basic type resolvers', () => {
    const result = plugin(schema, [], {}, { outputFile: '' });

    expect(result).toBeSimilarStringTo(`
    export type MyDirectiveDirectiveResolver<Result, Parent, Context = any, Args = {   arg?: ?$ElementType<Scalars, 'Int'>,
      arg2?: ?$ElementType<Scalars, 'String'>, arg3?: ?$ElementType<Scalars, 'Boolean'> }> = DirectiveResolverFn<Result, Parent, Context, Args>;`);

    expect(result).toBeSimilarStringTo(`export type MyOtherTypeResolvers<Context = any, ParentType = $ElementType<ResolversTypes, 'MyOtherType'>> = {
      bar?: Resolver<$ElementType<ResolversTypes, 'String'>, ParentType, Context>,
    }`);

    expect(result).toBeSimilarStringTo(`export type MyScalarScalarConfig = {
      ...GraphQLScalarTypeConfig<$ElementType<ResolversTypes, 'MyScalar'>, any>, 
      name: 'MyScalar'
    };`);

    expect(result).toBeSimilarStringTo(`export type MyTypeResolvers<Context = any, ParentType = $ElementType<ResolversTypes, 'MyType'>> = {
      foo?: Resolver<$ElementType<ResolversTypes, 'String'>, ParentType, Context>,
      otherType?: Resolver<?$ElementType<ResolversTypes, 'MyOtherType'>, ParentType, Context>,
      withArgs?: Resolver<?$ElementType<ResolversTypes, 'String'>, ParentType, Context, MyTypeWithArgsArgs>,
    }`);

    expect(result).toBeSimilarStringTo(`export type MyUnionResolvers<Context = any, ParentType = $ElementType<ResolversTypes, 'MyUnion'>> = {
      __resolveType: TypeResolveFn<'MyType' | 'MyOtherType', ParentType, Context>
    }`);

    expect(result).toBeSimilarStringTo(`export type NodeResolvers<Context = any, ParentType = $ElementType<ResolversTypes, 'Node'>> = {
      __resolveType: TypeResolveFn<'SomeNode', ParentType, Context>,
      id?: Resolver<$ElementType<ResolversTypes, 'ID'>, ParentType, Context>,
    }`);

    expect(result).toBeSimilarStringTo(`export type QueryResolvers<Context = any, ParentType = $ElementType<ResolversTypes, 'Query'>> = {
      something?: Resolver<$ElementType<ResolversTypes, 'MyType'>, ParentType, Context>,
    }`);

    expect(result).toBeSimilarStringTo(`export type SomeNodeResolvers<Context = any, ParentType = $ElementType<ResolversTypes, 'SomeNode'>> = {
      id?: Resolver<$ElementType<ResolversTypes, 'ID'>, ParentType, Context>,
    }`);

    expect(result).toBeSimilarStringTo(`export type SubscriptionResolvers<Context = any, ParentType = $ElementType<ResolversTypes, 'Subscription'>> = {
      somethingChanged?: SubscriptionResolver<?$ElementType<ResolversTypes, 'MyOtherType'>, ParentType, Context>,
    }`);
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

    expect(result).toBeSimilarStringTo(`f?: Resolver<?$ElementType<TResolversTypes, 'String'>, ParentType, Context, TMyTypeFArgs>,`);
  });
});
