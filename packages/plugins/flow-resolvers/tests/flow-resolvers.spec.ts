import '@graphql-codegen/testing';
import { buildSchema } from 'graphql';
import { plugin } from '../src';

describe('Flow Resolvers Plugin', () => {
  const schema = buildSchema(/* GraphQL */ `
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
  `);

  it('Should generate basic type resolvers', () => {
    const result = plugin(schema, [], {}, { outputFile: '' });

    expect(result).toBeSimilarStringTo(`
    export type MyDirectiveDirectiveResolver<Result, Parent, Context = any, Args = {   arg?: ?$ElementType<Scalars, 'Int'>,
      arg2?: ?$ElementType<Scalars, 'String'>, arg3?: ?$ElementType<Scalars, 'Boolean'> }> = DirectiveResolverFn<Result, Parent, Context, Args>;`);

    expect(result).toBeSimilarStringTo(`export type MyOtherTypeResolvers<Context = any, ParentType = MyOtherType> = {
      bar?: Resolver<$ElementType<Scalars, 'String'>, ParentType, Context>,
    }`);

    expect(result).toBeSimilarStringTo(`export interface MyScalarScalarConfig extends GraphQLScalarTypeConfig<$ElementType<Scalars, 'MyScalar'>, any> {
      name: 'MyScalar'
    }`);

    expect(result).toBeSimilarStringTo(`export type MyTypeResolvers<Context = any, ParentType = MyType> = {
      foo?: Resolver<$ElementType<Scalars, 'String'>, ParentType, Context>,
      otherType?: Resolver<?MyOtherType, ParentType, Context>,
      withArgs?: Resolver<?$ElementType<Scalars, 'String'>, ParentType, Context, MyTypeWithArgsArgs>,
    }`);

    expect(result).toBeSimilarStringTo(`export type MyUnionResolvers<Context = any, ParentType = MyUnion> = {
      __resolveType: TypeResolveFn<'MyType' | 'MyOtherType'>
    }`);

    expect(result).toBeSimilarStringTo(`export type NodeResolvers<Context = any, ParentType = Node> = {
      __resolveType: TypeResolveFn<'SomeNode'>,
      id?: Resolver<$ElementType<Scalars, 'ID'>, ParentType, Context>,
    }`);

    expect(result).toBeSimilarStringTo(`export type QueryResolvers<Context = any, ParentType = Query> = {
      something?: Resolver<MyType, ParentType, Context>,
    }`);

    expect(result).toBeSimilarStringTo(`export type SomeNodeResolvers<Context = any, ParentType = SomeNode> = {
      id?: Resolver<$ElementType<Scalars, 'ID'>, ParentType, Context>,
    }`);

    expect(result).toBeSimilarStringTo(`export type SubscriptionResolvers<Context = any, ParentType = Subscription> = {
      somethingChanged?: SubscriptionResolver<?MyOtherType, ParentType, Context>,
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

  it('Should generate basic type resolvers with mapping', () => {
    const result = plugin(
      schema,
      [],
      {
        mappers: {
          MyOtherType: 'MyCustomOtherType',
        },
      },
      { outputFile: '' }
    );

    expect(result).toBeSimilarStringTo(`
      export type MyDirectiveDirectiveResolver<Result, Parent, Context = any, Args = {   arg?: ?$ElementType<Scalars, 'Int'>,
        arg2?: ?$ElementType<Scalars, 'String'>, arg3?: ?$ElementType<Scalars, 'Boolean'> }> = DirectiveResolverFn<Result, Parent, Context, Args>;
    `);
    expect(result).toBeSimilarStringTo(`
      export type MyOtherTypeResolvers<Context = any, ParentType = MyCustomOtherType> = {
        bar?: Resolver<$ElementType<Scalars, 'String'>, ParentType, Context>,
      }
    `);
    expect(result).toBeSimilarStringTo(`
      export interface MyScalarScalarConfig extends GraphQLScalarTypeConfig<$ElementType<Scalars, 'MyScalar'>, any> {
        name: 'MyScalar'
      }
    `);
    expect(result).toBeSimilarStringTo(`
      export type MyTypeResolvers<Context = any, ParentType = MyType> = {
        foo?: Resolver<$ElementType<Scalars, 'String'>, ParentType, Context>,
        otherType?: Resolver<?MyCustomOtherType, ParentType, Context>,
        withArgs?: Resolver<?$ElementType<Scalars, 'String'>, ParentType, Context, MyTypeWithArgsArgs>,
      }
    `);
    expect(result).toBeSimilarStringTo(`
      export type MyUnionResolvers<Context = any, ParentType = MyUnion> = {
        __resolveType: TypeResolveFn<'MyType' | 'MyOtherType'>
      }
    `);
    expect(result).toBeSimilarStringTo(`
      export type NodeResolvers<Context = any, ParentType = Node> = {
        __resolveType: TypeResolveFn<'SomeNode'>,
        id?: Resolver<$ElementType<Scalars, 'ID'>, ParentType, Context>,
      }
    `);
    expect(result).toBeSimilarStringTo(`
      export type QueryResolvers<Context = any, ParentType = Query> = {
        something?: Resolver<MyType, ParentType, Context>,
      }
    `);
    expect(result).toBeSimilarStringTo(`
      export type SomeNodeResolvers<Context = any, ParentType = SomeNode> = {
        id?: Resolver<$ElementType<Scalars, 'ID'>, ParentType, Context>,
      }
    `);
    expect(result).toBeSimilarStringTo(`
      export type SubscriptionResolvers<Context = any, ParentType = Subscription> = {
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
          MyOtherType: './some-file#MyCustomOtherType',
        },
      },
      { outputFile: '' }
    );

    expect(result).toBeSimilarStringTo(`import { type MyCustomOtherType } from './some-file';`);
    expect(result).toBeSimilarStringTo(`
      export type MyDirectiveDirectiveResolver<Result, Parent, Context = any, Args = {   arg?: ?$ElementType<Scalars, 'Int'>,
        arg2?: ?$ElementType<Scalars, 'String'>, arg3?: ?$ElementType<Scalars, 'Boolean'> }> = DirectiveResolverFn<Result, Parent, Context, Args>;
    `);
    expect(result).toBeSimilarStringTo(`
      export type MyOtherTypeResolvers<Context = any, ParentType = MyCustomOtherType> = {
        bar?: Resolver<$ElementType<Scalars, 'String'>, ParentType, Context>,
      }
    `);
    expect(result).toBeSimilarStringTo(`
      export interface MyScalarScalarConfig extends GraphQLScalarTypeConfig<$ElementType<Scalars, 'MyScalar'>, any> {
        name: 'MyScalar'
      }
    `);
    expect(result).toBeSimilarStringTo(`
      export type MyTypeResolvers<Context = any, ParentType = MyType> = {
        foo?: Resolver<$ElementType<Scalars, 'String'>, ParentType, Context>,
        otherType?: Resolver<?MyCustomOtherType, ParentType, Context>,
        withArgs?: Resolver<?$ElementType<Scalars, 'String'>, ParentType, Context, MyTypeWithArgsArgs>,
      }
    `);
    expect(result).toBeSimilarStringTo(`
      export type MyUnionResolvers<Context = any, ParentType = MyUnion> = {
        __resolveType: TypeResolveFn<'MyType' | 'MyOtherType'>
      }
    `);
    expect(result).toBeSimilarStringTo(`
      export type NodeResolvers<Context = any, ParentType = Node> = {
        __resolveType: TypeResolveFn<'SomeNode'>,
        id?: Resolver<$ElementType<Scalars, 'ID'>, ParentType, Context>,
      }
    `);
    expect(result).toBeSimilarStringTo(`
      export type QueryResolvers<Context = any, ParentType = Query> = {
        something?: Resolver<MyType, ParentType, Context>,
      }
    `);
    expect(result).toBeSimilarStringTo(`
      export type SomeNodeResolvers<Context = any, ParentType = SomeNode> = {
        id?: Resolver<$ElementType<Scalars, 'ID'>, ParentType, Context>,
      }
    `);
    expect(result).toBeSimilarStringTo(`
      export type SubscriptionResolvers<Context = any, ParentType = Subscription> = {
        somethingChanged?: SubscriptionResolver<?MyCustomOtherType, ParentType, Context>,
      }
    `);
  });
  it('Should generate the correct resolver args type names when typesPrefix is specified', () => {
    const result = plugin(buildSchema(`type MyType { f(a: String): String }`), [], { typesPrefix: 'T' }, { outputFile: '' });

    expect(result).toBeSimilarStringTo(`f?: Resolver<?$ElementType<Scalars, 'String'>, ParentType, Context, TMyTypeFArgs>,`);
  });
});
