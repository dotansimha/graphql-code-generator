import 'graphql-codegen-core/dist/testing';
import { makeExecutableSchema } from 'graphql-tools';
import { plugin } from '../src';
import { plugin as tsPlugin } from '../../typescript/src/index';
import { validateTs } from '../../typescript/tests/validate';

describe('TypeScript Resolvers Plugin', () => {
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

  const validate = async (content: string, config: any = {}, pluginSchema = schema) => {
    const mergedContent = (await tsPlugin(pluginSchema, [], config, { outputFile: '' })) + '\n' + content;

    validateTs(mergedContent);
  };

  it('Should generate basic type resolvers', async () => {
    const result = await plugin(schema, [], {}, { outputFile: '' });

    expect(result).toBeSimilarStringTo(`
    export type MyDirectiveDirectiveResolver<Result, Parent, Context = any, Args = {   arg?: Maybe<number>,
      arg2?: Maybe<string>, arg3?: Maybe<boolean> }> = DirectiveResolverFn<Result, Parent, Context, Args>;

    export interface MyOtherTypeResolvers<Context = any, ParentType = MyOtherType> {
      bar?: Resolver<string, ParentType, Context>,
    }

    export interface MyScalarScalarConfig extends GraphQLScalarTypeConfig<MyScalar, any> {
      name: 'MyScalar'
    }

    export interface MyTypeResolvers<Context = any, ParentType = MyType> {
      foo?: Resolver<string, ParentType, Context>,
      otherType?: Resolver<Maybe<MyOtherType>, ParentType, Context>,
      withArgs?: Resolver<Maybe<string>, ParentType, Context, MyTypeWithArgsArgs>,
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
      somethingChanged?: SubscriptionResolver<Maybe<MyOtherType>, ParentType, Context>,
    }
    `);

    await validate(result);
  });

  it('Should generate the correct imports when schema has scalars', async () => {
    const testSchema = makeExecutableSchema({ typeDefs: `scalar MyScalar` });
    const result = await plugin(testSchema, [], {}, { outputFile: '' });

    expect(result).toBeSimilarStringTo(
      `import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';`
    );
    await validate(result, {}, schema);
  });

  it('Should generate the correct imports when schema has no scalars', async () => {
    const testSchema = makeExecutableSchema({ typeDefs: `type MyType { f: String }` });
    const result = await plugin(testSchema, [], {}, { outputFile: '' });

    expect(result).not.toBeSimilarStringTo(`import { GraphQLResolveInfo, GraphQLScalarTypeConfig } from 'graphql';`);
    await validate(result, {}, testSchema);
  });

  it('Should generate basic type resolvers with mapping', async () => {
    const result = await plugin(
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
    export type MyDirectiveDirectiveResolver<Result, Parent, Context = any, Args = {   arg?: Maybe<number>,
      arg2?: Maybe<string>, arg3?: Maybe<boolean> }> = DirectiveResolverFn<Result, Parent, Context, Args>;

    export interface MyOtherTypeResolvers<Context = any, ParentType = MyCustomOtherType> {
      bar?: Resolver<string, ParentType, Context>,
    }

    export interface MyScalarScalarConfig extends GraphQLScalarTypeConfig<MyScalar, any> {
      name: 'MyScalar'
    }

    export interface MyTypeResolvers<Context = any, ParentType = MyType> {
      foo?: Resolver<string, ParentType, Context>,
      otherType?: Resolver<Maybe<MyCustomOtherType>, ParentType, Context>,
      withArgs?: Resolver<Maybe<string>, ParentType, Context, MyTypeWithArgsArgs>,
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
      somethingChanged?: SubscriptionResolver<Maybe<MyCustomOtherType>, ParentType, Context>,
    }
    `);
    await validate(`type MyCustomOtherType = {}\n${result}`);
  });

  it('Should generate basic type resolvers with external mappers', async () => {
    const result = await plugin(
      schema,
      [],
      {
        mappers: {
          MyOtherType: './my-file#MyCustomOtherType'
        }
      },
      { outputFile: '' }
    );

    expect(result).toBeSimilarStringTo(`import { MyCustomOtherType } from './my-file';`);
    expect(result).toBeSimilarStringTo(`
    export type MyDirectiveDirectiveResolver<Result, Parent, Context = any, Args = {   arg?: Maybe<number>,
      arg2?: Maybe<string>, arg3?: Maybe<boolean> }> = DirectiveResolverFn<Result, Parent, Context, Args>;

    export interface MyOtherTypeResolvers<Context = any, ParentType = MyCustomOtherType> {
      bar?: Resolver<string, ParentType, Context>,
    }

    export interface MyScalarScalarConfig extends GraphQLScalarTypeConfig<MyScalar, any> {
      name: 'MyScalar'
    }

    export interface MyTypeResolvers<Context = any, ParentType = MyType> {
      foo?: Resolver<string, ParentType, Context>,
      otherType?: Resolver<Maybe<MyCustomOtherType>, ParentType, Context>,
      withArgs?: Resolver<Maybe<string>, ParentType, Context, MyTypeWithArgsArgs>,
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
      somethingChanged?: SubscriptionResolver<Maybe<MyCustomOtherType>, ParentType, Context>,
    }
    `);
    await validate(result);
  });

  it('Should generate the correct resolver args type names when typesPrefix is specified', async () => {
    const testSchema = makeExecutableSchema({ typeDefs: `type MyType { f(a: String): String }` });
    const config = { typesPrefix: 'T' };
    const result = await plugin(testSchema, [], config, { outputFile: '' });

    expect(result).toBeSimilarStringTo(`f?: Resolver<Maybe<string>, ParentType, Context, TMyTypeFArgs>,`);
    await validate(result, config, testSchema);
  });
  it('should generate Resolvers interface', async () => {
    const testSchema = makeExecutableSchema({
      typeDefs: `
        directive @modify(limit: Int) on FIELD_DEFINITION
        scalar Date
        type Query {
          post: Post
          entity: PostOrUser
        }
        interface Node {
          id: String
        }
        union PostOrUser = Post | User
        type Post implements Node {
          author: User
        }
        type User implements Node {
          id: String
          name: String
        }
        schema {
          query: Query
        }
      `
    });

    const content = await plugin(
      testSchema,
      [],
      { scalars: { Date: 'Date' } },
      {
        outputFile: 'graphql.ts'
      }
    );

    expect(content).toBeSimilarStringTo(`
    export type IResolvers<Context = any> = {
           Date?: GraphQLScalarType,
           Node?: NodeResolvers,
           Post?: PostResolvers<Context>,
           PostOrUser?: PostOrUserResolvers,
           Query?: QueryResolvers<Context>,
           User?: UserResolvers<Context>,
         } & { [typeName: string] : { [ fieldName: string ]: ( Resolver<any, any, Context, any> | SubscriptionResolver<any, any, Context, any> ) } };
    `);

    expect(content).toBeSimilarStringTo(`
      export type IDirectiveResolvers<Context = any> = {
        modify?: ModifyDirectiveResolver<any, any, Context>,
      } & { [directiveName: string]: DirectiveResolverFn<any, any, Context, any> };
    `);
  });
});
