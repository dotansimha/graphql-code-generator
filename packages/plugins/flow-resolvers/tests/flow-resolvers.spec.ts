import 'graphql-codegen-testing';
import { makeExecutableSchema } from 'graphql-tools';
import { plugin } from '../src';

describe('Flow Resolvers Plugin', () => {
  const schema = makeExecutableSchema({
    typeDefs: `
      type MyType {
        foo: String!
        otherType: MyOtherType
        withArgs(arg: String, arg2: String!): String
      }

      type MyOtherType {
        bar: String!
      }

      type Query {
        something: MyType!
      }

      type Subscription {
        somethingChanged: MyOtherType
      }

      interface Node {
        id: ID!
      }

      type SomeNode implements Node {
        id: ID!
      }

      union MyUnion = MyType | MyOtherType

      scalar MyScalar

      directive @myDirective(arg: Int!, arg2: String!, arg3: Boolean!) on FIELD
  `
  });

  it('Should generate basic type resolvers', () => {
    const result = plugin(schema, [], {}, { outputFile: '' });

    expect(result).toBeSimilarStringTo(`
    export type MyDirectiveDirectiveResolver<Result, Parent, Context = any, Args = {   arg?: ?number,
      arg2?: ?string, arg3?: ?boolean }> = DirectiveResolverFn<Result, Parent, Context, Args>;

    export interface MyOtherTypeResolvers<Context = any, ParentType = MyOtherType> {
      bar?: Resolver<string, ParentType, Context>,
    }

    export interface MyScalarScalarConfig extends GraphQLScalarTypeConfig<MyScalar, any> {
      name: 'MyScalar'
    }

    export interface MyTypeResolvers<Context = any, ParentType = MyType> {
      foo?: Resolver<string, ParentType, Context>,
      otherType?: Resolver<?MyOtherType, ParentType, Context>,
      withArgs?: Resolver<?string, ParentType, Context, MyTypeWithArgsArgs>,
    }

    export interface MyUnionResolvers<Context = any, ParentType = MyUnion> {
      __resolveType: TypeResolveFn<'MyType' | 'MyOtherType'>
    }

    export interface NodeResolvers<Context = any, ParentType = Node> {
      __resolveType: TypeResolveFn<'SomeNode'>
    }

    export interface QueryResolvers<Context = any, ParentType = Query> {
      something?: Resolver<MyType, ParentType, Context>,
    }

    export interface SomeNodeResolvers<Context = any, ParentType = SomeNode> {
      id?: Resolver<string, ParentType, Context>,
    }

    export interface SubscriptionResolvers<Context = any, ParentType = Subscription> {
      somethingChanged?: SubscriptionResolver<?MyOtherType, ParentType, Context>,
    }
    `);
  });

  it('Should generate the correct imports when schema has scalars', () => {
    const result = plugin(makeExecutableSchema({ typeDefs: `scalar MyScalar` }), [], {}, { outputFile: '' });

    expect(result).toBeSimilarStringTo(
      `import { type GraphQLResolveInfo, type GraphQLScalarTypeConfig } from 'graphql';`
    );
  });

  it('Should generate the correct imports when schema has no scalars', () => {
    const result = plugin(makeExecutableSchema({ typeDefs: `type MyType { f: String }` }), [], {}, { outputFile: '' });

    expect(result).not.toBeSimilarStringTo(
      `import { type GraphQLResolveInfo, type GraphQLScalarTypeConfig } from 'graphql';`
    );
  });

  it('Should generate basic type resolvers with mapping', () => {
    const result = plugin(
      schema,
      [],
      {
        mappers: {
          MyOtherType: 'MyCustomOtherType'
        }
      },
      { outputFile: '' }
    );

    expect(result).toBeSimilarStringTo(`
    export type MyDirectiveDirectiveResolver<Result, Parent, Context = any, Args = {   arg?: ?number,
      arg2?: ?string, arg3?: ?boolean }> = DirectiveResolverFn<Result, Parent, Context, Args>;

    export interface MyOtherTypeResolvers<Context = any, ParentType = MyCustomOtherType> {
      bar?: Resolver<string, ParentType, Context>,
    }

    export interface MyScalarScalarConfig extends GraphQLScalarTypeConfig<MyScalar, any> {
      name: 'MyScalar'
    }

    export interface MyTypeResolvers<Context = any, ParentType = MyType> {
      foo?: Resolver<string, ParentType, Context>,
      otherType?: Resolver<?MyCustomOtherType, ParentType, Context>,
      withArgs?: Resolver<?string, ParentType, Context, MyTypeWithArgsArgs>,
    }

    export interface MyUnionResolvers<Context = any, ParentType = MyUnion> {
      __resolveType: TypeResolveFn<'MyType' | 'MyOtherType'>
    }

    export interface NodeResolvers<Context = any, ParentType = Node> {
      __resolveType: TypeResolveFn<'SomeNode'>
    }

    export interface QueryResolvers<Context = any, ParentType = Query> {
      something?: Resolver<MyType, ParentType, Context>,
    }

    export interface SomeNodeResolvers<Context = any, ParentType = SomeNode> {
      id?: Resolver<string, ParentType, Context>,
    }

    export interface SubscriptionResolvers<Context = any, ParentType = Subscription> {
      somethingChanged?: SubscriptionResolver<?MyCustomOtherType, ParentType, Context>,
    }
    `);
  });

  it('Should generate basic type resolvers with external mapping', () => {
    const result = plugin(
      schema,
      [],
      {
        mappers: {
          MyOtherType: './some-file#MyCustomOtherType'
        }
      },
      { outputFile: '' }
    );

    expect(result).toBeSimilarStringTo(`import { type MyCustomOtherType } from './some-file';`);
    expect(result).toBeSimilarStringTo(`
    export type MyDirectiveDirectiveResolver<Result, Parent, Context = any, Args = {   arg?: ?number,
      arg2?: ?string, arg3?: ?boolean }> = DirectiveResolverFn<Result, Parent, Context, Args>;

    export interface MyOtherTypeResolvers<Context = any, ParentType = MyCustomOtherType> {
      bar?: Resolver<string, ParentType, Context>,
    }

    export interface MyScalarScalarConfig extends GraphQLScalarTypeConfig<MyScalar, any> {
      name: 'MyScalar'
    }

    export interface MyTypeResolvers<Context = any, ParentType = MyType> {
      foo?: Resolver<string, ParentType, Context>,
      otherType?: Resolver<?MyCustomOtherType, ParentType, Context>,
      withArgs?: Resolver<?string, ParentType, Context, MyTypeWithArgsArgs>,
    }

    export interface MyUnionResolvers<Context = any, ParentType = MyUnion> {
      __resolveType: TypeResolveFn<'MyType' | 'MyOtherType'>
    }

    export interface NodeResolvers<Context = any, ParentType = Node> {
      __resolveType: TypeResolveFn<'SomeNode'>
    }

    export interface QueryResolvers<Context = any, ParentType = Query> {
      something?: Resolver<MyType, ParentType, Context>,
    }

    export interface SomeNodeResolvers<Context = any, ParentType = SomeNode> {
      id?: Resolver<string, ParentType, Context>,
    }

    export interface SubscriptionResolvers<Context = any, ParentType = Subscription> {
      somethingChanged?: SubscriptionResolver<?MyCustomOtherType, ParentType, Context>,
    }
    `);
  });
  it('Should generate the correct resolver args type names when typesPrefix is specified', () => {
    const result = plugin(
      makeExecutableSchema({ typeDefs: `type MyType { f(a: String): String }` }),
      [],
      { typesPrefix: 'T' },
      { outputFile: '' }
    );

    expect(result).toBeSimilarStringTo(`f?: Resolver<?string, ParentType, Context, TMyTypeFArgs>,`);
  });
});
