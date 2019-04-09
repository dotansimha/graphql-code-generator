import '@graphql-codegen/testing';
import { buildSchema } from 'graphql';
import { plugin } from '../src';
import { plugin as tsPlugin } from '../../typescript/src/index';
import { validateTs } from '../../typescript/tests/validate';
import { schema, validate } from './common';

describe('TypeScript Resolvers Plugin', () => {
  describe('Backward Compatability', () => {
    it('Should generate IDirectiveResolvers by default', async () => {
      const result = await plugin(schema, [], {}, { outputFile: '' });
      expect(result).toBeSimilarStringTo(`
      /**
       * @deprecated
       * Use "DirectiveResolvers" root object instead. If you wish to get "IDirectiveResolvers", add "typesPrefix: I" to your config.
      */
      export type IDirectiveResolvers<Context = any> = DirectiveResolvers<Context>;`);
      await validate(result);
    });

    it('Should not generate IDirectiveResolvers when prefix is overwritten', async () => {
      const config = { typesPrefix: 'PREFIX_' };
      const result = await plugin(schema, [], config, { outputFile: '' });
      expect(result).not.toContain(`export type IDirectiveResolvers`);
      expect(result).not.toContain(`export type DirectiveResolvers`);
      expect(result).toContain(`export type PREFIX_DirectiveResolvers`);
      await validate(result, config);
    });

    it('Should generate IResolvers by default', async () => {
      const result = await plugin(schema, [], {}, { outputFile: '' });
      expect(result).toBeSimilarStringTo(`
      /**
       * @deprecated
       * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
      */
      export type IResolvers<Context = any> = Resolvers<Context>;`);
      await validate(result);
    });

    it('Should not generate IResolvers when prefix is overwritten', async () => {
      const config = { typesPrefix: 'PREFIX_' };
      const result = await plugin(schema, [], config, { outputFile: '' });
      expect(result).not.toContain(`export type IResolvers`);
      expect(result).not.toContain(`export type Resolvers`);
      expect(result).toContain(`export type PREFIX_Resolvers`);
      await validate(result, config);
    });

    it('Should generate IResolvers by default with deprecated warning', async () => {
      const result = await plugin(schema, [], {}, { outputFile: '' });
      expect(result).toBeSimilarStringTo(`
      /**
       * @deprecated
       * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
      */
      export type IResolvers<Context = any> = Resolvers<Context>;`);
      await validate(result);
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
          useIndexSignature: true,
        },
        {
          outputFile: 'graphql.ts',
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
        `,
      ].join('\n');

      expect(content).toBeSimilarStringTo(`
        export type Resolvers<Context = AppContext> = ResolversObject<{
          Query?: QueryResolvers<Context>,
          User?: UserResolvers<Context>,
        }>;
      `);

      validateTs(content);
    });
  });

  it('Should use StitchingResolver by default', async () => {
    const result = await plugin(schema, [], {}, { outputFile: '' });

    expect(result).toBeSimilarStringTo(`
      export type StitchingResolver<TResult, TParent, TContext, TArgs> = {
        fragment: string;
        resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
      };
    `);
    expect(result).toBeSimilarStringTo(`
      export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
        | ResolverFn<TResult, TParent, TContext, TArgs>
        | StitchingResolver<TResult, TParent, TContext, TArgs>;
    `);

    await validate(result);
  });

  it('Should warn when noSchemaStitching is set to false (deprecated)', async () => {
    const spy = jest.spyOn(console, 'warn').mockImplementation();
    const result = await plugin(
      schema,
      [],
      {
        noSchemaStitching: false,
      },
      { outputFile: '' }
    );

    expect(spy).toHaveBeenCalled();
    expect(spy.mock.calls[0][0]).toContain('noSchemaStitching');

    spy.mockRestore();

    await validate(result);
  });

  it('Should not warn when noSchemaStitching is not defined', async () => {
    const spy = jest.spyOn(console, 'warn').mockImplementation();
    const result = await plugin(schema, [], {}, { outputFile: '' });

    expect(spy).not.toHaveBeenCalled();

    spy.mockRestore();

    await validate(result);
  });

  it('Should disable StitchingResolver on demand', async () => {
    const result = await plugin(
      schema,
      [],
      {
        noSchemaStitching: true,
      },
      { outputFile: '' }
    );

    expect(result).not.toBeSimilarStringTo(`
      export type StitchingResolver<TResult, TParent, TContext, TArgs> = {
        fragment: string;
        resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
      };
    `);
    expect(result).not.toBeSimilarStringTo(`
      export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
        | ResolverFn<TResult, TParent, TContext, TArgs>
        | StitchingResolver<TResult, TParent, TContext, TArgs>;
    `);

    expect(result).toBeSimilarStringTo(`
      export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
        ResolverFn<TResult, TParent, TContext, TArgs>;
    `);

    await validate(result);
  });

  it('Should generate basic type resolvers', async () => {
    const result = await plugin(schema, [], {}, { outputFile: '' });

    expect(result).toBeSimilarStringTo(`
    export type MyDirectiveDirectiveResolver<Result, Parent, Context = any, Args = {   arg?: Maybe<Scalars['Int']>,
      arg2?: Maybe<Scalars['String']>, arg3?: Maybe<Scalars['Boolean']> }> = DirectiveResolverFn<Result, Parent, Context, Args>;`);

    expect(result).toBeSimilarStringTo(`
      export type MyOtherTypeResolvers<Context = any, ParentType = ResolversTypes['MyOtherType']> = {
        bar?: Resolver<ResolversTypes['String'], ParentType, Context>,
      };
    `);

    expect(result).toBeSimilarStringTo(`export interface MyScalarScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['MyScalar'], any> {
      name: 'MyScalar'
    }`);

    expect(result).toBeSimilarStringTo(`
      export type MyTypeResolvers<Context = any, ParentType = ResolversTypes['MyType']> = {
        foo?: Resolver<ResolversTypes['String'], ParentType, Context>,
        otherType?: Resolver<Maybe<ResolversTypes['MyOtherType']>, ParentType, Context>,
        withArgs?: Resolver<Maybe<ResolversTypes['String']>, ParentType, Context, MyTypeWithArgsArgs>,
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type MyUnionResolvers<Context = any, ParentType = ResolversTypes['MyUnion']> = {
        __resolveType: TypeResolveFn<'MyType' | 'MyOtherType', ParentType, Context>
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type NodeResolvers<Context = any, ParentType = ResolversTypes['Node']> = {
        __resolveType: TypeResolveFn<'SomeNode', ParentType, Context>,
        id?: Resolver<ResolversTypes['ID'], ParentType, Context>,
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type QueryResolvers<Context = any, ParentType = ResolversTypes['Query']> = {
        something?: Resolver<ResolversTypes['MyType'], ParentType, Context>,
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type SomeNodeResolvers<Context = any, ParentType = ResolversTypes['SomeNode']> = {
        id?: Resolver<ResolversTypes['ID'], ParentType, Context>,
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type SubscriptionResolvers<Context = any, ParentType = ResolversTypes['Subscription']> = {
        somethingChanged?: SubscriptionResolver<Maybe<ResolversTypes['MyOtherType']>, ParentType, Context>,
      };
    `);

    await validate(result);
  });

  it('Should generate basic type resolvers with avoidOptionals', async () => {
    const result = await plugin(schema, [], { avoidOptionals: true }, { outputFile: '' });

    expect(result).toBeSimilarStringTo(`
    export type MyDirectiveDirectiveResolver<Result, Parent, Context = any, Args = {   arg: Maybe<Scalars['Int']>,
      arg2: Maybe<Scalars['String']>, arg3: Maybe<Scalars['Boolean']> }> = DirectiveResolverFn<Result, Parent, Context, Args>;`);

    expect(result).toBeSimilarStringTo(`
      export type MyOtherTypeResolvers<Context = any, ParentType = ResolversTypes['MyOtherType']> = {
        bar: Resolver<ResolversTypes['String'], ParentType, Context>,
      };
    `);

    expect(result).toBeSimilarStringTo(`export interface MyScalarScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['MyScalar'], any> {
      name: 'MyScalar'
    }`);

    expect(result).toBeSimilarStringTo(`
      export type MyTypeResolvers<Context = any, ParentType = ResolversTypes['MyType']> = {
        foo: Resolver<ResolversTypes['String'], ParentType, Context>,
        otherType: Resolver<Maybe<ResolversTypes['MyOtherType']>, ParentType, Context>,
        withArgs: Resolver<Maybe<ResolversTypes['String']>, ParentType, Context, MyTypeWithArgsArgs>,
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type MyUnionResolvers<Context = any, ParentType = ResolversTypes['MyUnion']> = {
        __resolveType: TypeResolveFn<'MyType' | 'MyOtherType', ParentType, Context>
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type NodeResolvers<Context = any, ParentType = ResolversTypes['Node']> = {
        __resolveType: TypeResolveFn<'SomeNode', ParentType, Context>,
        id: Resolver<ResolversTypes['ID'], ParentType, Context>,
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type QueryResolvers<Context = any, ParentType = ResolversTypes['Query']> = {
        something: Resolver<ResolversTypes['MyType'], ParentType, Context>,
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type SomeNodeResolvers<Context = any, ParentType = ResolversTypes['SomeNode']> = {
        id: Resolver<ResolversTypes['ID'], ParentType, Context>,
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type SubscriptionResolvers<Context = any, ParentType = ResolversTypes['Subscription']> = {
        somethingChanged: SubscriptionResolver<Maybe<ResolversTypes['MyOtherType']>, ParentType, Context>,
      };
    `);

    await validate(result);
  });

  it('Should allow to override context with simple identifier', async () => {
    const result = await plugin(
      schema,
      [],
      {
        contextType: 'MyCustomContext',
      },
      { outputFile: '' }
    );

    expect(result).toBeSimilarStringTo(`
    export type MyDirectiveDirectiveResolver<Result, Parent, Context = MyCustomContext, Args = {   arg?: Maybe<Scalars['Int']>,
      arg2?: Maybe<Scalars['String']>, arg3?: Maybe<Scalars['Boolean']> }> = DirectiveResolverFn<Result, Parent, Context, Args>;`);

    expect(result).toBeSimilarStringTo(`
      export type MyOtherTypeResolvers<Context = MyCustomContext, ParentType = ResolversTypes['MyOtherType']> = {
        bar?: Resolver<ResolversTypes['String'], ParentType, Context>,
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type MyTypeResolvers<Context = MyCustomContext, ParentType = ResolversTypes['MyType']> = {
        foo?: Resolver<ResolversTypes['String'], ParentType, Context>,
        otherType?: Resolver<Maybe<ResolversTypes['MyOtherType']>, ParentType, Context>,
        withArgs?: Resolver<Maybe<ResolversTypes['String']>, ParentType, Context, MyTypeWithArgsArgs>,
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type MyUnionResolvers<Context = MyCustomContext, ParentType = ResolversTypes['MyUnion']> = {
        __resolveType: TypeResolveFn<'MyType' | 'MyOtherType', ParentType, Context>
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type NodeResolvers<Context = MyCustomContext, ParentType = ResolversTypes['Node']> = {
        __resolveType: TypeResolveFn<'SomeNode', ParentType, Context>,
        id?: Resolver<ResolversTypes['ID'], ParentType, Context>,
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type QueryResolvers<Context = MyCustomContext, ParentType = ResolversTypes['Query']> = {
        something?: Resolver<ResolversTypes['MyType'], ParentType, Context>,
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type SomeNodeResolvers<Context = MyCustomContext, ParentType = ResolversTypes['SomeNode']> = {
        id?: Resolver<ResolversTypes['ID'], ParentType, Context>,
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type SubscriptionResolvers<Context = MyCustomContext, ParentType = ResolversTypes['Subscription']> = {
        somethingChanged?: SubscriptionResolver<Maybe<ResolversTypes['MyOtherType']>, ParentType, Context>,
      };
    `);

    await validate(`type MyCustomContext = {};\n` + result);
  });

  it('Should allow to override context with mapped context type', async () => {
    const result = await plugin(
      schema,
      [],
      {
        contextType: './my-file#MyCustomContext',
      },
      { outputFile: '' }
    );

    expect(result).toBeSimilarStringTo(`import { MyCustomContext } from './my-file';`);

    expect(result).toBeSimilarStringTo(`
    export type MyDirectiveDirectiveResolver<Result, Parent, Context = MyCustomContext, Args = {   arg?: Maybe<Scalars['Int']>,
      arg2?: Maybe<Scalars['String']>, arg3?: Maybe<Scalars['Boolean']> }> = DirectiveResolverFn<Result, Parent, Context, Args>;`);

    expect(result).toBeSimilarStringTo(`
      export type MyOtherTypeResolvers<Context = MyCustomContext, ParentType = ResolversTypes['MyOtherType']> = {
        bar?: Resolver<ResolversTypes['String'], ParentType, Context>,
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type MyTypeResolvers<Context = MyCustomContext, ParentType = ResolversTypes['MyType']> = {
        foo?: Resolver<ResolversTypes['String'], ParentType, Context>,
        otherType?: Resolver<Maybe<ResolversTypes['MyOtherType']>, ParentType, Context>,
        withArgs?: Resolver<Maybe<ResolversTypes['String']>, ParentType, Context, MyTypeWithArgsArgs>,
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type MyUnionResolvers<Context = MyCustomContext, ParentType = ResolversTypes['MyUnion']> = {
        __resolveType: TypeResolveFn<'MyType' | 'MyOtherType', ParentType, Context>
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type NodeResolvers<Context = MyCustomContext, ParentType = ResolversTypes['Node']> = {
        __resolveType: TypeResolveFn<'SomeNode', ParentType, Context>,
        id?: Resolver<ResolversTypes['ID'], ParentType, Context>,
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type QueryResolvers<Context = MyCustomContext, ParentType = ResolversTypes['Query']> = {
        something?: Resolver<ResolversTypes['MyType'], ParentType, Context>,
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type SomeNodeResolvers<Context = MyCustomContext, ParentType = ResolversTypes['SomeNode']> = {
        id?: Resolver<ResolversTypes['ID'], ParentType, Context>,
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type SubscriptionResolvers<Context = MyCustomContext, ParentType = ResolversTypes['Subscription']> = {
        somethingChanged?: SubscriptionResolver<Maybe<ResolversTypes['MyOtherType']>, ParentType, Context>,
      };
    `);

    await validate(result);
  });

  it('Should generate the correct imports when schema has scalars', async () => {
    const testSchema = buildSchema(`scalar MyScalar`);
    const result = await plugin(testSchema, [], {}, { outputFile: '' });

    expect(result).toBeSimilarStringTo(`import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';`);
    await validate(result, {}, schema);
  });

  it('Should generate the correct imports when schema has no scalars', async () => {
    const testSchema = buildSchema(`type MyType { f: String }`);
    const result = await plugin(testSchema, [], {}, { outputFile: '' });

    expect(result).not.toBeSimilarStringTo(`import { GraphQLResolveInfo, GraphQLScalarTypeConfig } from 'graphql';`);
    await validate(result, {}, testSchema);
  });

  it('Should not convert type names in unions', async () => {
    const testSchema = buildSchema(/* GraphQL */ `
      type CCCFoo {
        foo: String!
      }

      type CCCBar {
        bar: String!
      }

      type Query {
        something: CCCUnion!
      }

      union CCCUnion = CCCFoo | CCCBar
    `);

    const tsContent = await tsPlugin(testSchema, [], {}, { outputFile: 'graphql.ts' });
    const content = await plugin(testSchema, [], {}, { outputFile: 'graphql.ts' });

    expect(content).toBeSimilarStringTo(`CCCUnion: CccUnion`); // In ResolversTypes
    expect(content).toBeSimilarStringTo(`
    export type CccUnionResolvers<Context = any, ParentType = ResolversTypes['CCCUnion']> = {
      __resolveType: TypeResolveFn<'CCCFoo' | 'CCCBar', ParentType, Context>
    };
    `);

    await validateTs([tsContent, content].join('\n'));
  });

  it('Should generate the correct resolver args type names when typesPrefix is specified', async () => {
    const testSchema = buildSchema(`type MyType { f(a: String): String }`);
    const config = { typesPrefix: 'T' };
    const result = await plugin(testSchema, [], config, { outputFile: '' });

    expect(result).toBeSimilarStringTo(`f?: Resolver<Maybe<TResolversTypes['String']>, ParentType, Context, TMyTypeFArgs>,`);
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
        outputFile: 'graphql.ts',
      }
    );

    expect(content).toBeSimilarStringTo(`
      export type Resolvers<Context = any> = {
        Date?: GraphQLScalarType,
        Node?: NodeResolvers,
        Post?: PostResolvers<Context>,
        PostOrUser?: PostOrUserResolvers,
        Query?: QueryResolvers<Context>,
        User?: UserResolvers<Context>,
      };
    `);

    expect(content).toBeSimilarStringTo(`
      export type DirectiveResolvers<Context = any> = {
        modify?: ModifyDirectiveResolver<any, any, Context>,
      };
    `);
  });

  it('should not create DirectiveResolvers if there is no directive defined in the schema', async () => {
    const testSchema = buildSchema(/* GraphQL */ `
      type Query {
        foo: String
      }
    `);

    const content = await plugin(
      testSchema,
      [],
      { scalars: { Date: 'Date' } },
      {
        outputFile: 'graphql.ts',
      }
    );

    expect(content).not.toBeSimilarStringTo(`
      export type DirectiveResolvers<Context = any> = {};
    `);
  });

  it('should produce Resolvers compatible with graphql-tools', async () => {
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
        useIndexSignature: true,
      },
      {
        outputFile: 'graphql.ts',
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

        const resolvers: Resolvers = {
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
      `,
    ].join('\n');

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
        useIndexSignature: true,
      },
      {
        outputFile: 'graphql.ts',
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
      `,
    ].join('\n');

    validateTs(content);
  });

  it('should use {} as default of rootValueType', async () => {
    const testSchema = buildSchema(/* GraphQL */ `
      type Subscription {
        postAdded: Post
      }

      type Query {
        posts: [Post]
      }

      type Mutation {
        addPost(author: String, comment: String): Post
      }

      type Post {
        author: String
        comment: String
      }
    `);
    const content = await plugin(testSchema, [], {}, { outputFile: 'graphql.ts' });

    expect(content).toBeSimilarStringTo(`
      export type ResolversTypes = {
        Query: {},
        Post: Post,
        String: Scalars['String'],
        Mutation: {},
        Subscription: {},
        Boolean: Scalars['Boolean'],
      };
    `);
  });

  it('should use rootValueType in Query, Mutation and Subscription', async () => {
    const testSchema = buildSchema(/* GraphQL */ `
      type MySubscription {
        postAdded: Post
      }

      type MyQuery {
        posts: [Post]
      }

      type MyMutation {
        addPost(author: String, comment: String): Post
      }

      type Post {
        author: String
        comment: String
      }

      schema {
        query: MyQuery
        mutation: MyMutation
        subscription: MySubscription
      }
    `);
    const content = await plugin(
      testSchema,
      [],
      {
        rootValueType: 'MyRoot',
      },
      { outputFile: 'graphql.ts' }
    );

    expect(content).toBeSimilarStringTo(`
      export type ResolversTypes = {
        MyQuery: MyRoot,
        Post: Post,
        String: Scalars['String'],
        MyMutation: MyRoot,
        MySubscription: MyRoot,
        Boolean: Scalars['Boolean'],
      };
    `);
  });

  it('should generate subscription types correctly', async () => {
    const testSchema = buildSchema(/* GraphQL */ `
      type Subscription {
        postAdded: Post
      }

      type Query {
        posts: [Post]
      }

      type Mutation {
        addPost(author: String, comment: String): Post
      }

      type Post {
        author: String
        comment: String
      }
    `);
    const tsContent = await tsPlugin(testSchema, [], {}, { outputFile: 'graphql.ts' });
    const resolversContent = await plugin(
      testSchema,
      [],
      {
        rootValueType: '{version: 1}',
      },
      { outputFile: 'graphql.ts' }
    );
    const content = [
      tsContent,
      resolversContent,
      `
        import { PubSub } from 'graphql-subscriptions';
        const pubsub = new PubSub();
        
        const POST_ADDED = 'POST_ADDED';

        const resolvers: Resolvers = {
          Subscription: {
            postAdded: {
              subscribe: () => pubsub.asyncIterator([POST_ADDED]),
              // Make sure we get and return a proper value
              resolve: post => post
            }
          },
          Mutation: {
            addPost: (root, { author, comment }) => {
              const post = {
                author,
                comment,
              };

              // RootValue should be accessible
              console.log(root.version);

              // Pass correct data
              pubsub.publish(POST_ADDED, post);
              
              // Return correct data
              return post;
            }
          },
        };
      `,
    ].join('\n');

    validateTs(content);
  });

  it('Should generate valid types even when there are no implementers for an interface', async () => {
    const schemaWithNoImplementors = buildSchema(/* GraphQL */ `
      interface Node {
        id: ID!
      }

      type Query {
        node: Node!
      }
    `);

    const result = await plugin(schemaWithNoImplementors, [], {}, { outputFile: '' });

    expect(result).toBeSimilarStringTo(`
      export type NodeResolvers<Context = any, ParentType = ResolversTypes['Node']> = {
        __resolveType: TypeResolveFn<null, ParentType, Context>,
        id?: Resolver<ResolversTypes['ID'], ParentType, Context>,
      };
    `);
  });
});
