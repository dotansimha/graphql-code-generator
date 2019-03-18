import 'graphql-codegen-testing';
import { buildSchema } from 'graphql';
import { plugin } from '../src';
import { plugin as tsPlugin } from '../../typescript/src/index';
import { validateTs } from '../../typescript/tests/validate';

describe('TypeScript Resolvers Plugin', () => {
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

  const validate = async (content: string, config: any = {}, pluginSchema = schema) => {
    const mergedContent = (await tsPlugin(pluginSchema, [], config, { outputFile: '' })) + '\n' + content;

    validateTs(mergedContent);
  };

  it('Should generate basic type resolvers', async () => {
    const result = await plugin(schema, [], {}, { outputFile: '' });

    expect(result).toBeSimilarStringTo(`
    export type MyDirectiveDirectiveResolver<Result, Parent, Context = any, Args = {   arg?: Maybe<Scalars['Int']>,
      arg2?: Maybe<Scalars['String']>, arg3?: Maybe<Scalars['Boolean']> }> = DirectiveResolverFn<Result, Parent, Context, Args>;`);

    expect(result).toBeSimilarStringTo(`
      export type MyOtherTypeResolvers<Context = any, ParentType = MyOtherType> = ResolversObject<{
        bar?: Resolver<Scalars['String'], ParentType, Context>,
      }>;
    `);

    expect(result)
      .toBeSimilarStringTo(`export interface MyScalarScalarConfig extends GraphQLScalarTypeConfig<Scalars['MyScalar'], any> {
      name: 'MyScalar'
    }`);

    expect(result).toBeSimilarStringTo(`
      export type MyTypeResolvers<Context = any, ParentType = MyType> = {
        foo?: Resolver<Scalars['String'], ParentType, Context>,
        otherType?: Resolver<Maybe<MyOtherType>, ParentType, Context>,
        withArgs?: Resolver<Maybe<Scalars['String']>, ParentType, Context, MyTypeWithArgsArgs>,
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type MyUnionResolvers<Context = any, ParentType = MyUnion> = {
        __resolveType: TypeResolveFn<'MyType' | 'MyOtherType'>
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type NodeResolvers<Context = any, ParentType = Node> = {
        __resolveType: TypeResolveFn<'SomeNode'>,
        id?: Resolver<Scalars['ID'], ParentType, Context>,
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type QueryResolvers<Context = any, ParentType = Query> = {
        something?: Resolver<MyType, ParentType, Context>,
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type SomeNodeResolvers<Context = any, ParentType = SomeNode> = {
        id?: Resolver<Scalars['ID'], ParentType, Context>,
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type SubscriptionResolvers<Context = any, ParentType = Subscription> = {
        somethingChanged?: SubscriptionResolver<Maybe<MyOtherType>, ParentType, Context>,
      };
    `);

    await validate(result);
  });

  it('Should generate the correct imports when schema has scalars', async () => {
    const testSchema = buildSchema(`scalar MyScalar`);
    const result = await plugin(testSchema, [], {}, { outputFile: '' });

    expect(result).toBeSimilarStringTo(
      `import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';`
    );
    await validate(result, {}, schema);
  });

  it('Should generate the correct imports when schema has no scalars', async () => {
    const testSchema = buildSchema(`type MyType { f: String }`);
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
    export type MyDirectiveDirectiveResolver<Result, Parent, Context = any, Args = {   arg?: Maybe<Scalars['Int']>,
      arg2?: Maybe<Scalars['String']>, arg3?: Maybe<Scalars['Boolean']> }> = DirectiveResolverFn<Result, Parent, Context, Args>;`);

    expect(result).toBeSimilarStringTo(`
      export type MyOtherTypeResolvers<Context = any, ParentType = MyCustomOtherType> = {
        bar?: Resolver<Scalars['String'], ParentType, Context>,
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export interface MyScalarScalarConfig extends GraphQLScalarTypeConfig<Scalars['MyScalar'], any> {
        name: 'MyScalar'
      }
    `);

    expect(result).toBeSimilarStringTo(`
      export type MyTypeResolvers<Context = any, ParentType = MyType> = {
        foo?: Resolver<Scalars['String'], ParentType, Context>,
        otherType?: Resolver<Maybe<MyCustomOtherType>, ParentType, Context>,
        withArgs?: Resolver<Maybe<Scalars['String']>, ParentType, Context, MyTypeWithArgsArgs>,
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type MyUnionResolvers<Context = any, ParentType = MyUnion> = {
        __resolveType: TypeResolveFn<'MyType' | 'MyOtherType'>
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type NodeResolvers<Context = any, ParentType = Node> = {
        __resolveType: TypeResolveFn<'SomeNode'>,
        id?: Resolver<Scalars['ID'], ParentType, Context>,
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type QueryResolvers<Context = any, ParentType = Query> = {
        something?: Resolver<MyType, ParentType, Context>,
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type SomeNodeResolvers<Context = any, ParentType = SomeNode> = {
        id?: Resolver<Scalars['ID'], ParentType, Context>,
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type SubscriptionResolvers<Context = any, ParentType = Subscription> = {
        somethingChanged?: SubscriptionResolver<Maybe<MyCustomOtherType>, ParentType, Context>,
      };
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
    export type MyDirectiveDirectiveResolver<Result, Parent, Context = any, Args = {   arg?: Maybe<Scalars['Int']>,
      arg2?: Maybe<Scalars['String']>, arg3?: Maybe<Scalars['Boolean']> }> = DirectiveResolverFn<Result, Parent, Context, Args>;`);

    expect(result).toBeSimilarStringTo(`
        export type MyOtherTypeResolvers<Context = any, ParentType = MyCustomOtherType> = {
          bar?: Resolver<Scalars['String'], ParentType, Context>,
        };
      `);

    expect(result)
      .toBeSimilarStringTo(`export interface MyScalarScalarConfig extends GraphQLScalarTypeConfig<Scalars['MyScalar'], any> {
      name: 'MyScalar'
        }
      `);

    expect(result).toBeSimilarStringTo(`
      export type MyTypeResolvers<Context = any, ParentType = MyType> = {
        foo?: Resolver<Scalars['String'], ParentType, Context>,
        otherType?: Resolver<Maybe<MyCustomOtherType>, ParentType, Context>,
        withArgs?: Resolver<Maybe<Scalars['String']>, ParentType, Context, MyTypeWithArgsArgs>,
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type MyUnionResolvers<Context = any, ParentType = MyUnion> = {
        __resolveType: TypeResolveFn<'MyType' | 'MyOtherType'>
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type NodeResolvers<Context = any, ParentType = Node> = {
        __resolveType: TypeResolveFn<'SomeNode'>,
        id?: Resolver<Scalars['ID'], ParentType, Context>,
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type QueryResolvers<Context = any, ParentType = Query> = {
        something?: Resolver<MyType, ParentType, Context>,
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type SomeNodeResolvers<Context = any, ParentType = SomeNode> = {
        id?: Resolver<Scalars['ID'], ParentType, Context>,
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type SubscriptionResolvers<Context = any, ParentType = Subscription> = {
        somethingChanged?: SubscriptionResolver<Maybe<MyCustomOtherType>, ParentType, Context>,
      };
    `);

    await validate(result);
  });

  it('Should generate the correct resolver args type names when typesPrefix is specified', async () => {
    const testSchema = buildSchema(`type MyType { f(a: String): String }`);
    const config = { typesPrefix: 'T' };
    const result = await plugin(testSchema, [], config, { outputFile: '' });

    expect(result).toBeSimilarStringTo(`f?: Resolver<Maybe<Scalars['String']>, ParentType, Context, TMyTypeFArgs>,`);
    await validate(result, config, testSchema);
  });

  it('should generate Resolvers interface', async () => {
    const testSchema = buildSchema(/* GraphQL */ `
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
    `);

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
      };
    `);

    expect(content).toBeSimilarStringTo(`
      export type IDirectiveResolvers<Context = any> = {
        modify?: ModifyDirectiveResolver<any, any, Context>,
      };
    `);
  });

  it('should use Iterable on ListNodes', async () => {
    const testSchema = buildSchema(/* GraphQL */ `
      type Query {
        foo: [User]
        bar: [User!]
        baz: [User!]!
      }

      enum Role {
        A
        B
        C
        D
      }

      type User {
        id: ID!
        name: String!
        roles: [Role!]!
      }
    `);

    const tsContent = await tsPlugin(testSchema, [], {}, { outputFile: 'graphql.ts' });
    const resolversContent = await plugin(
      testSchema,
      [],
      {},
      {
        outputFile: 'graphql.ts'
      }
    );
    const content = [tsContent, resolversContent].join('\n');

    expect(content).toBeSimilarStringTo(`
      export type QueryResolvers<Context = any, ParentType = Query> = {
        foo?: Resolver<Maybe<ArrayOrIterable<Maybe<User>>>, ParentType, Context>,
        bar?: Resolver<Maybe<ArrayOrIterable<User>>, ParentType, Context>,
        baz?: Resolver<ArrayOrIterable<User>, ParentType, Context>,
      };

      export type UserResolvers<Context = any, ParentType = User> = {
        id?: Resolver<Scalars['ID'], ParentType, Context>,
        name?: Resolver<Scalars['String'], ParentType, Context>,
        roles?: Resolver<ArrayOrIterable<Role>, ParentType, Context>,
      };

      export type IResolvers<Context = any> = {
        Query?: QueryResolvers<Context>,
        User?: UserResolvers<Context>,
      };
    `);

    validateTs(content);
  });

  it('should produce IResolvers compatible with graphql-tools', async () => {
    const testSchema = buildSchema(/* GraphQL */ `
      type Query {
        users: [User!]!
      }

      type User {
        id: ID!
        name: String!
      }
    `);

    const tsContent = await tsPlugin(testSchema, [], {}, { outputFile: 'graphql.ts' });
    const resolversContent = await plugin(
      testSchema,
      [],
      {
        contextType: 'AppContext',
        useIndexSignature: true
      },
      {
        outputFile: 'graphql.ts'
      }
    );
    const content = [
      tsContent,
      resolversContent,
      `
        import { makeExecutableSchema } from 'graphql-tools';

        interface AppContext {
          users: Array<{
            id: string;
            name: string;
          }>;
        }

        const resolvers: IResolvers = {
          Query: {
            users(parent, args, ctx, info) {
              return ctx.users;
            }
          }
        }

        makeExecutableSchema({
          typeDefs: '',
          resolvers
        })
      `
    ].join('\n');

    expect(content).toBeSimilarStringTo(`
      export type QueryResolvers<Context = AppContext, ParentType = Query> = ResolversObject<{
        users?: Resolver<ArrayOrIterable<User>, ParentType, Context>,
      }>;
    `);

    expect(content).toBeSimilarStringTo(`
      export type UserResolvers<Context = AppContext, ParentType = User> = ResolversObject<{
        id?: Resolver<Scalars['ID'], ParentType, Context>,
        name?: Resolver<Scalars['String'], ParentType, Context>,
      }>;
    `);

    expect(content).toBeSimilarStringTo(`
      export type IResolvers<Context = AppContext> = ResolversObject<{
        Query?: QueryResolvers<Context>,
        User?: UserResolvers<Context>,
      }>;
    `);

    validateTs(content);
  });

  it('should produce resolvers compatible with graphql-tools', async () => {
    const testSchema = buildSchema(/* GraphQL */ `
      type Query {
        users: [User!]!
      }

      type User {
        id: ID!
        name: String!
      }
    `);

    const tsContent = await tsPlugin(testSchema, [], {}, { outputFile: 'graphql.ts' });
    const resolversContent = await plugin(
      testSchema,
      [],
      {
        contextType: 'AppContext',
        useIndexSignature: true
      },
      {
        outputFile: 'graphql.ts'
      }
    );
    const content = [
      tsContent,
      resolversContent,
      `
        import { makeExecutableSchema } from 'graphql-tools';

        interface AppContext {
          users: Array<{
            id: string;
            name: string;
          }>;
        }

        const query: QueryResolvers = {
          users(parent, args, ctx, info) {
            return ctx.users;
          }
        }

        makeExecutableSchema({
          typeDefs: '',
          resolvers: {
            Query: query
          }
        })
      `
    ].join('\n');

    validateTs(content);
  });
});
