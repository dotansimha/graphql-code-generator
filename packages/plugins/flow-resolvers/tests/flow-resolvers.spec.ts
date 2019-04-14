import '@graphql-codegen/testing';
import { buildSchema } from 'graphql';
import { plugin } from '../src';
import { schema } from '../../typescript-resolvers/tests/common';

describe('Flow Resolvers Plugin', () => {
  it('Should generate basic type resolvers', () => {
    const result = plugin(schema, [], {}, { outputFile: '' });

    expect(result).toBeSimilarStringTo(`
    export type MyDirectiveDirectiveResolver<Result, Parent, ContextType = any, Args = {   arg?: ?$ElementType<Scalars, 'Int'>,
      arg2?: ?$ElementType<Scalars, 'String'>, arg3?: ?$ElementType<Scalars, 'Boolean'> }> = DirectiveResolverFn<Result, Parent, ContextType, Args>;`);

    expect(result).toBeSimilarStringTo(`export type MyOtherTypeResolvers<ContextType = any, ParentType = $ElementType<ResolversTypes, 'MyOtherType'>> = {
      bar?: Resolver<$ElementType<ResolversTypes, 'String'>, ParentType, ContextType>,
    }`);

    expect(result).toBeSimilarStringTo(`export type MyScalarScalarConfig = {
      ...GraphQLScalarTypeConfig<$ElementType<ResolversTypes, 'MyScalar'>, any>, 
      name: 'MyScalar'
    };`);

    expect(result).toBeSimilarStringTo(`export type MyTypeResolvers<ContextType = any, ParentType = $ElementType<ResolversTypes, 'MyType'>> = {
      foo?: Resolver<$ElementType<ResolversTypes, 'String'>, ParentType, ContextType>,
      otherType?: Resolver<?$ElementType<ResolversTypes, 'MyOtherType'>, ParentType, ContextType>,
      withArgs?: Resolver<?$ElementType<ResolversTypes, 'String'>, ParentType, ContextType, MyTypeWithArgsArgs>,
    }`);

    expect(result).toBeSimilarStringTo(`export type MyUnionResolvers<ContextType = any, ParentType = $ElementType<ResolversTypes, 'MyUnion'>> = {
      __resolveType: TypeResolveFn<'MyType' | 'MyOtherType', ParentType, ContextType>
    }`);

    expect(result).toBeSimilarStringTo(`export type NodeResolvers<ContextType = any, ParentType = $ElementType<ResolversTypes, 'Node'>> = {
      __resolveType: TypeResolveFn<'SomeNode', ParentType, ContextType>,
      id?: Resolver<$ElementType<ResolversTypes, 'ID'>, ParentType, ContextType>,
    }`);

    expect(result).toBeSimilarStringTo(`export type QueryResolvers<ContextType = any, ParentType = $ElementType<ResolversTypes, 'Query'>> = {
      something?: Resolver<$ElementType<ResolversTypes, 'MyType'>, ParentType, ContextType>,
    }`);

    expect(result).toBeSimilarStringTo(`export type SomeNodeResolvers<ContextType = any, ParentType = $ElementType<ResolversTypes, 'SomeNode'>> = {
      id?: Resolver<$ElementType<ResolversTypes, 'ID'>, ParentType, ContextType>,
    }`);

    expect(result).toBeSimilarStringTo(`export type SubscriptionResolvers<ContextType = any, ParentType = $ElementType<ResolversTypes, 'Subscription'>> = {
      somethingChanged?: SubscriptionResolver<?$ElementType<ResolversTypes, 'MyOtherType'>, ParentType, ContextType>,
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

    expect(result).toBeSimilarStringTo(`f?: Resolver<?$ElementType<TResolversTypes, 'String'>, ParentType, ContextType, TMyTypeFArgs>,`);
  });
});
