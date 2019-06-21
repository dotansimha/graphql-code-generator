import { Types, mergeOutputs } from '@graphql-codegen/plugin-helpers';
import '@graphql-codegen/testing';
import { schema, validate } from './common';
import { plugin } from '../src';
import { buildSchema } from 'graphql';

describe('ResolversTypes', () => {
  it('Should build ResolversTypes object when there are no mappers', async () => {
    const result = (await plugin(schema, [], {}, { outputFile: '' })) as Types.ComplexPluginOutput;

    expect(result.content).toBeSimilarStringTo(`
    export type ResolversTypes = {
      Query: ResolverTypeWrapper<{}>,
      MyType: ResolverTypeWrapper<MyType>,
      String: ResolverTypeWrapper<Scalars['String']>,
      MyOtherType: ResolverTypeWrapper<MyOtherType>,
      Subscription: ResolverTypeWrapper<{}>,
      Boolean: ResolverTypeWrapper<Scalars['Boolean']>,
      Node: ResolverTypeWrapper<Node>,
      ID: ResolverTypeWrapper<Scalars['ID']>,
      SomeNode: ResolverTypeWrapper<SomeNode>,
      MyUnion: ResolversTypes['MyType'] | ResolversTypes['MyOtherType'],
      MyScalar: ResolverTypeWrapper<Scalars['MyScalar']>,
      Int: ResolverTypeWrapper<Scalars['Int']>,
    };`);
  });

  it('Should build ResolversTypes with simple mappers', async () => {
    const result = (await plugin(
      schema,
      [],
      {
        mappers: {
          MyType: 'MyTypeDb',
          String: 'number',
        },
      },
      { outputFile: '' }
    )) as Types.ComplexPluginOutput;

    expect(result.content).toBeSimilarStringTo(`
      export type ResolversTypes = {
        Query: ResolverTypeWrapper<{}>,
        MyType: ResolverTypeWrapper<MyTypeDb>,
        String: ResolverTypeWrapper<number>,
        MyOtherType: ResolverTypeWrapper<Omit<MyOtherType, 'bar'> & { bar: ResolversTypes['String'] }>,
        Subscription: ResolverTypeWrapper<{}>,
        Boolean: ResolverTypeWrapper<Scalars['Boolean']>,
        Node: ResolverTypeWrapper<Node>,
        ID: ResolverTypeWrapper<Scalars['ID']>,
        SomeNode: ResolverTypeWrapper<SomeNode>,
        MyUnion: ResolversTypes['MyType'] | ResolversTypes['MyOtherType'],
        MyScalar: ResolverTypeWrapper<Scalars['MyScalar']>,
        Int: ResolverTypeWrapper<Scalars['Int']>,
      };
    `);
  });

  it('Should allow to map custom type that refers itself (issue #1770)', async () => {
    const testSchema = buildSchema(/* GraphQL */ `
      type Movie {
        id: ID!
        title: String!
      }

      type Book {
        id: ID!
        author: String!
      }

      union MovieLike = Movie | Book

      type NonInterfaceHasNarrative {
        narrative: MovieLike!
        movie: Movie!
      }
    `);
    const result = (await plugin(
      testSchema,
      [],
      {
        noSchemaStitching: true,
        mappers: {
          Movie: 'MovieEntity',
        },
      },
      { outputFile: '' }
    )) as Types.ComplexPluginOutput;
    const content = mergeOutputs([result]);
    expect(content).toBeSimilarStringTo(`
      export type ResolversTypes = {
        String: ResolverTypeWrapper<Scalars['String']>,
        Boolean: ResolverTypeWrapper<Scalars['Boolean']>,
        Movie: ResolverTypeWrapper<MovieEntity>,
        ID: ResolverTypeWrapper<Scalars['ID']>,
        Book: ResolverTypeWrapper<Book>,
        MovieLike: ResolversTypes['Movie'] | ResolversTypes['Book'],
        NonInterfaceHasNarrative: ResolverTypeWrapper<Omit<NonInterfaceHasNarrative, 'narrative' | 'movie'> & { narrative: ResolversTypes['MovieLike'], movie: ResolversTypes['Movie'] }>,
      };
    `);
  });

  it('Should allow to map custom type that refers itself (issue #1770, attempt #2)', async () => {
    const testSchema = buildSchema(/* GraphQL */ `
      type Movie {
        id: ID!
        title: String!
      }

      type Book {
        id: ID!
        author: String!
      }

      union MovieLike = Movie | Book

      type NonInterfaceHasNarrative {
        narrative: MovieLike!
        movie: Movie!
      }

      type LayerOfIndirection {
        id: ID!
        movies: [NonInterfaceHasNarrative!]!
      }

      type AnotherLayerOfIndirection {
        inner: LayerOfIndirection!
      }
    `);
    const result = (await plugin(
      testSchema,
      [],
      {
        noSchemaStitching: true,
        mappers: {
          Movie: 'MovieEntity',
        },
      },
      { outputFile: '' }
    )) as Types.ComplexPluginOutput;
    const content = mergeOutputs([result]);
    expect(content).toBeSimilarStringTo(`export type ResolversTypes = {
      String: ResolverTypeWrapper<Scalars['String']>,
      Boolean: ResolverTypeWrapper<Scalars['Boolean']>,
      Movie: ResolverTypeWrapper<MovieEntity>,
      ID: ResolverTypeWrapper<Scalars['ID']>,
      Book: ResolverTypeWrapper<Book>,
      MovieLike: ResolversTypes['Movie'] | ResolversTypes['Book'],
      NonInterfaceHasNarrative: ResolverTypeWrapper<Omit<NonInterfaceHasNarrative, 'narrative' | 'movie'> & { narrative: ResolversTypes['MovieLike'], movie: ResolversTypes['Movie'] }>,
      LayerOfIndirection: ResolverTypeWrapper<Omit<LayerOfIndirection, 'movies'> & { movies: Array<ResolversTypes['NonInterfaceHasNarrative']> }>,
      AnotherLayerOfIndirection: ResolverTypeWrapper<Omit<AnotherLayerOfIndirection, 'inner'> & { inner: ResolversTypes['LayerOfIndirection'] }>,
    };`);
  });

  it('Should allow to map custom type that refers itself (issue #1770, attempt #3 - circular)', async () => {
    const testSchema = buildSchema(/* GraphQL */ `
      type Account {
        id: ID!
        name: String!
        programs: [Program!]!
      }

      type Program {
        id: ID!
        name: String!
        account: Account!
      }
    `);
    const result = (await plugin(
      testSchema,
      [],
      {
        typesPrefix: 'Gql',
        defaultMapper: 'Partial<{T}>',
        namingConvention: {
          typeNames: 'change-case#pascalCase',
          enumValues: 'change-case#upperCase',
        },
        noSchemaStitching: true,
      },
      { outputFile: '' }
    )) as Types.ComplexPluginOutput;
    const content = mergeOutputs([result]);

    expect(content).toBeSimilarStringTo(`export type GqlResolversTypes = {
      String: ResolverTypeWrapper<Partial<Scalars['String']>>,
      Boolean: ResolverTypeWrapper<Partial<Scalars['Boolean']>>,
      Account: ResolverTypeWrapper<Partial<GqlAccount>>,
      ID: ResolverTypeWrapper<Partial<Scalars['ID']>>,
      Program: ResolverTypeWrapper<Partial<GqlProgram>>,
    };`);
  });

  it('should map to a custom type on every level (+ actual usage in code)', async () => {
    const testSchema = buildSchema(/* GraphQL */ `
      type User {
        id: ID!
        name: String!
        chats: [Chat!]
      }

      type Chat {
        id: ID!
        owner: User!
        members: [User!]
      }

      type Query {
        me: User
      }
    `);
    const result = (await plugin(
      testSchema,
      [],
      {
        noSchemaStitching: true,
        mappers: {
          ID: 'number',
          Chat: 'number',
        },
      },
      { outputFile: '' }
    )) as Types.ComplexPluginOutput;

    const usage = `
      const resolvers: Resolvers = {
        Query: {
          me() {
            return {
              id: 1,
              name: 'Foo',
              chats: [0,1,2],
            };
          }
        },
        Chat: {
          id(parent) {
            const id: number = parent;
            return id;
          }
        }
      }
    `;

    await validate(
      [mergeOutputs(result), usage].join('\n\n'),
      {
        scalars: {
          ID: 'number',
        },
      },
      testSchema
    );
  });

  it('Should build ResolversTypes with defaultMapper set using {T}', async () => {
    const result = (await plugin(
      schema,
      [],
      {
        noSchemaStitching: true,
        defaultMapper: 'Partial<{T}>',
      },
      { outputFile: '' }
    )) as Types.ComplexPluginOutput;

    expect(result.content).toBeSimilarStringTo(`
    export type ResolversTypes = {
      Query: ResolverTypeWrapper<{}>,
      MyType: ResolverTypeWrapper<Partial<MyType>>,
      String: ResolverTypeWrapper<Partial<Scalars['String']>>,
      MyOtherType: ResolverTypeWrapper<Partial<MyOtherType>>,
      Subscription: ResolverTypeWrapper<{}>,
      Boolean: ResolverTypeWrapper<Partial<Scalars['Boolean']>>,
      Node: ResolverTypeWrapper<Partial<Node>>,
      ID: ResolverTypeWrapper<Partial<Scalars['ID']>>,
      SomeNode: ResolverTypeWrapper<Partial<SomeNode>>,
      MyUnion: Partial<ResolversTypes['MyType'] | ResolversTypes['MyOtherType']>,
      MyScalar: ResolverTypeWrapper<Partial<Scalars['MyScalar']>>,
      Int: ResolverTypeWrapper<Partial<Scalars['Int']>>,
    };`);
  });

  it('Should build ResolversTypes with defaultMapper set using {T} with external identifier', async () => {
    const result = (await plugin(
      schema,
      [],
      {
        noSchemaStitching: true,
        defaultMapper: './my-wrapper#CustomPartial<{T}>',
      },
      { outputFile: '' }
    )) as Types.ComplexPluginOutput;

    expect(result.prepend).toContain(`import { CustomPartial } from './my-wrapper';`);
    expect(result.content).toBeSimilarStringTo(`
    export type ResolversTypes = {
      Query: ResolverTypeWrapper<{}>,
      MyType: ResolverTypeWrapper<CustomPartial<MyType>>,
      String: ResolverTypeWrapper<CustomPartial<Scalars['String']>>,
      MyOtherType: ResolverTypeWrapper<CustomPartial<MyOtherType>>,
      Subscription: ResolverTypeWrapper<{}>,
      Boolean: ResolverTypeWrapper<CustomPartial<Scalars['Boolean']>>,
      Node: ResolverTypeWrapper<CustomPartial<Node>>,
      ID: ResolverTypeWrapper<CustomPartial<Scalars['ID']>>,
      SomeNode: ResolverTypeWrapper<CustomPartial<SomeNode>>,
      MyUnion: CustomPartial<ResolversTypes['MyType'] | ResolversTypes['MyOtherType']>,
      MyScalar: ResolverTypeWrapper<CustomPartial<Scalars['MyScalar']>>,
      Int: ResolverTypeWrapper<CustomPartial<Scalars['Int']>>,
    };`);
  });

  it('Should build ResolversTypes with mapper set for concrete type using {T} with external identifier', async () => {
    const result = (await plugin(
      schema,
      [],
      {
        noSchemaStitching: true,
        mappers: {
          MyType: './my-wrapper#CustomPartial<{T}>',
        },
      },
      { outputFile: '' }
    )) as Types.ComplexPluginOutput;

    expect(result.prepend).toContain(`import { CustomPartial } from './my-wrapper';`);
    expect(result.content).toBeSimilarStringTo(`
    export type ResolversTypes = {
      Query: ResolverTypeWrapper<{}>,
      MyType: ResolverTypeWrapper<CustomPartial<MyType>>,
      String: ResolverTypeWrapper<Scalars['String']>,
      MyOtherType: ResolverTypeWrapper<MyOtherType>,
      Subscription: ResolverTypeWrapper<{}>,
      Boolean: ResolverTypeWrapper<Scalars['Boolean']>,
      Node: ResolverTypeWrapper<Node>,
      ID: ResolverTypeWrapper<Scalars['ID']>,
      SomeNode: ResolverTypeWrapper<SomeNode>,
      MyUnion: ResolversTypes['MyType'] | ResolversTypes['MyOtherType'],
      MyScalar: ResolverTypeWrapper<Scalars['MyScalar']>,
      Int: ResolverTypeWrapper<Scalars['Int']>,
    };`);
  });

  it('Should map to a custom type on every level when {T} is used as default mapper', async () => {
    const config = {
      scalars: {
        ID: 'number',
      },
      noSchemaStitching: true,
      defaultMapper: 'Partial<{T}>',
      mappers: {
        User: 'number',
      },
    };
    const testSchema = buildSchema(/* GraphQL */ `
      type User {
        id: ID!
        name: String!
        chats: [Chat!]
      }

      type Chat {
        id: ID!
        owner: User!
        members: [User!]
      }

      type Query {
        me: User
      }
    `);
    const result = (await plugin(testSchema, [], config, { outputFile: '' })) as Types.ComplexPluginOutput;

    expect(result.content).toBeSimilarStringTo(`
      export type ResolversTypes = {
        Query: ResolverTypeWrapper<{}>,
        User: ResolverTypeWrapper<number>,
        ID: ResolverTypeWrapper<Partial<Scalars['ID']>>,
        String: ResolverTypeWrapper<Partial<Scalars['String']>>,
        Chat: ResolverTypeWrapper<Partial<Omit<Chat, 'owner' | 'members'> & { owner: ResolversTypes['User'], members?: Maybe<Array<ResolversTypes['User']>> }>>,
        Boolean: ResolverTypeWrapper<Partial<Scalars['Boolean']>>,
      };
    `);

    const usage = `
      const resolvers: Resolvers = {
        Query: {
          me() {
            return 1;
          }
        },
        Chat: {
          id(chat) {
            return chat.id;
          },
          owner(chat) {
            const id: number = chat.owner;
            return id;
          },
          members(chat) {
            const ids: number[] = chat.members;
            return ids;
          }
        },
        User: {
          id(parent) {
            const id: number = parent;
            return id;
          }
        }
      }
    `;

    await validate([mergeOutputs(result), usage].join('\n\n'), config, testSchema);
  });

  it('Should build ResolversTypes with defaultMapper set', async () => {
    const result = (await plugin(
      schema,
      [],
      {
        noSchemaStitching: true,
        mappers: {
          MyType: 'MyTypeDb',
          String: 'string',
        },
        defaultMapper: 'any',
      },
      { outputFile: '' }
    )) as Types.ComplexPluginOutput;

    expect(result.content).toBeSimilarStringTo(`
    export type ResolversTypes = {
      Query: ResolverTypeWrapper<{}>,
      MyType: ResolverTypeWrapper<MyTypeDb>,
      String: ResolverTypeWrapper<string>,
      MyOtherType: ResolverTypeWrapper<any>,
      Subscription: ResolverTypeWrapper<{}>,
      Boolean: ResolverTypeWrapper<any>,
      Node: ResolverTypeWrapper<any>,
      ID: ResolverTypeWrapper<any>,
      SomeNode: ResolverTypeWrapper<any>,
      MyUnion: ResolverTypeWrapper<any>,
      MyScalar: ResolverTypeWrapper<any>,
      Int: ResolverTypeWrapper<any>,
    };`);
  });

  it('Should build ResolversTypes with external mappers', async () => {
    const result = (await plugin(
      schema,
      [],
      {
        noSchemaStitching: true,
        mappers: {
          MyOtherType: './my-module#CustomMyOtherType',
          MyType: 'MyTypeDb',
        },
      },
      { outputFile: '' }
    )) as Types.ComplexPluginOutput;

    expect(result.content).toBeSimilarStringTo(`
    export type ResolversTypes = {
      Query: ResolverTypeWrapper<{}>,
      MyType: ResolverTypeWrapper<MyTypeDb>,
      String: ResolverTypeWrapper<Scalars['String']>,
      MyOtherType: ResolverTypeWrapper<CustomMyOtherType>,
      Subscription: ResolverTypeWrapper<{}>,
      Boolean: ResolverTypeWrapper<Scalars['Boolean']>,
      Node: ResolverTypeWrapper<Node>,
      ID: ResolverTypeWrapper<Scalars['ID']>,
      SomeNode: ResolverTypeWrapper<SomeNode>,
      MyUnion: ResolversTypes['MyType'] | ResolversTypes['MyOtherType'],
      MyScalar: ResolverTypeWrapper<Scalars['MyScalar']>,
      Int: ResolverTypeWrapper<Scalars['Int']>,
    };`);
  });

  it('Should handle {T} in a mapper', async () => {
    const result = (await plugin(
      schema,
      [],
      {
        noSchemaStitching: true,
        mappers: {
          MyType: 'Partial<{T}>',
        },
      },
      { outputFile: '' }
    )) as Types.ComplexPluginOutput;

    expect(result.content).toBeSimilarStringTo(`
      export type ResolversTypes = {
        Query: ResolverTypeWrapper<{}>,
        MyType: ResolverTypeWrapper<Partial<MyType>>,
        String: ResolverTypeWrapper<Scalars['String']>,
        MyOtherType: ResolverTypeWrapper<MyOtherType>,
        Subscription: ResolverTypeWrapper<{}>,
        Boolean: ResolverTypeWrapper<Scalars['Boolean']>,
        Node: ResolverTypeWrapper<Node>,
        ID: ResolverTypeWrapper<Scalars['ID']>,
        SomeNode: ResolverTypeWrapper<SomeNode>,
        MyUnion: ResolversTypes['MyType'] | ResolversTypes['MyOtherType'],
        MyScalar: ResolverTypeWrapper<Scalars['MyScalar']>,
        Int: ResolverTypeWrapper<Scalars['Int']>,
      };
    `);
  });

  it('should warn about unused mappers by default', async () => {
    const spy = jest.spyOn(console, 'warn').mockImplementation();
    const testSchema = buildSchema(/* GraphQL */ `
      type Query {
        comments: [Comment!]!
      }

      type User {
        id: ID!
        name: String!
      }

      type Comment {
        id: ID!
        text: String!
        author: User!
      }
    `);

    await plugin(
      testSchema,
      [],
      {
        noSchemaStitching: true,
        mappers: {
          Comment: 'number',
          Post: 'string',
        },
      },
      {
        outputFile: 'graphql.ts',
      }
    );

    expect(spy).toHaveBeenCalledWith('Unused mappers: Post');
    spy.mockRestore();
  });

  it('should be able not to warn about unused mappers', async () => {
    const spy = jest.spyOn(console, 'warn').mockImplementation();
    const testSchema = buildSchema(/* GraphQL */ `
      type Query {
        comments: [Comment!]!
      }

      type User {
        id: ID!
        name: String!
      }

      type Comment {
        id: ID!
        text: String!
        author: User!
      }
    `);

    await plugin(
      testSchema,
      [],
      {
        noSchemaStitching: true,
        mappers: {
          Comment: 'number',
          Post: 'string',
        },
        showUnusedMappers: false,
      },
      {
        outputFile: 'graphql.ts',
      }
    );

    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('Should generate basic type resolvers with external mappers', async () => {
    const result = (await plugin(
      schema,
      [],
      {
        noSchemaStitching: true,
        mappers: {
          MyOtherType: './my-file#MyCustomOtherType',
        },
      },
      { outputFile: '' }
    )) as Types.ComplexPluginOutput;

    expect(result.prepend).toContain(`import { MyCustomOtherType } from './my-file';`);
    expect(result.content).toBeSimilarStringTo(`
    export type MyDirectiveDirectiveResolver<Result, Parent, ContextType = any, Args = {   arg?: Maybe<Scalars['Int']>,
      arg2?: Maybe<Scalars['String']>, arg3?: Maybe<Scalars['Boolean']> }> = DirectiveResolverFn<Result, Parent, ContextType, Args>;`);

    expect(result.content).toBeSimilarStringTo(`
        export type MyOtherTypeResolvers<ContextType = any, ParentType = ResolversParentTypes['MyOtherType']> = {
          bar?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
        };
      `);

    expect(result.content).toBeSimilarStringTo(`export interface MyScalarScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['MyScalar'], any> {
      name: 'MyScalar'
        }
      `);

    expect(result.content).toBeSimilarStringTo(`
      export type MyTypeResolvers<ContextType = any, ParentType = ResolversParentTypes['MyType']> = {
        foo?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
        otherType?: Resolver<Maybe<ResolversTypes['MyOtherType']>, ParentType, ContextType>,
        withArgs?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, MyTypeWithArgsArgs>,
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type MyUnionResolvers<ContextType = any, ParentType = ResolversParentTypes['MyUnion']> = {
        __resolveType: TypeResolveFn<'MyType' | 'MyOtherType', ParentType, ContextType>
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type NodeResolvers<ContextType = any, ParentType = ResolversParentTypes['Node']> = {
        __resolveType: TypeResolveFn<'SomeNode', ParentType, ContextType>,
        id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>,
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type QueryResolvers<ContextType = any, ParentType = ResolversParentTypes['Query']> = {
        something?: Resolver<ResolversTypes['MyType'], ParentType, ContextType>,
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type SomeNodeResolvers<ContextType = any, ParentType = ResolversParentTypes['SomeNode']> = {
        id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>,
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type SubscriptionResolvers<ContextType = any, ParentType = ResolversParentTypes['Subscription']> = {
        somethingChanged?: SubscriptionResolver<Maybe<ResolversTypes['MyOtherType']>, ParentType, ContextType>,
      };
    `);
    await validate(result);
  });

  it('Should generate basic type resolvers with external mappers using same imported type', async () => {
    const result = (await plugin(
      schema,
      [],
      {
        noSchemaStitching: true,
        mappers: {
          MyType: './my-file#MyCustomOtherType',
          MyOtherType: './my-file#MyCustomOtherType',
        },
      },
      { outputFile: '' }
    )) as Types.ComplexPluginOutput;

    expect(result.prepend).toContain(`import { MyCustomOtherType } from './my-file';`);
    expect(result.content).toBeSimilarStringTo(`
    export type MyDirectiveDirectiveResolver<Result, Parent, ContextType = any, Args = {   arg?: Maybe<Scalars['Int']>,
      arg2?: Maybe<Scalars['String']>, arg3?: Maybe<Scalars['Boolean']> }> = DirectiveResolverFn<Result, Parent, ContextType, Args>;`);

    expect(result.content).toBeSimilarStringTo(`
        export type MyOtherTypeResolvers<ContextType = any, ParentType = ResolversParentTypes['MyOtherType']> = {
          bar?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
        };
      `);

    expect(result.content).toBeSimilarStringTo(`export interface MyScalarScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['MyScalar'], any> {
      name: 'MyScalar'
        }
      `);

    expect(result.content).toBeSimilarStringTo(`
      export type MyTypeResolvers<ContextType = any, ParentType = ResolversParentTypes['MyType']> = {
        foo?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
        otherType?: Resolver<Maybe<ResolversTypes['MyOtherType']>, ParentType, ContextType>,
        withArgs?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, MyTypeWithArgsArgs>,
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type MyUnionResolvers<ContextType = any, ParentType = ResolversParentTypes['MyUnion']> = {
        __resolveType: TypeResolveFn<'MyType' | 'MyOtherType', ParentType, ContextType>
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type NodeResolvers<ContextType = any, ParentType = ResolversParentTypes['Node']> = {
        __resolveType: TypeResolveFn<'SomeNode', ParentType, ContextType>,
        id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>,
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type QueryResolvers<ContextType = any, ParentType = ResolversParentTypes['Query']> = {
        something?: Resolver<ResolversTypes['MyType'], ParentType, ContextType>,
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type SomeNodeResolvers<ContextType = any, ParentType = ResolversParentTypes['SomeNode']> = {
        id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>,
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type SubscriptionResolvers<ContextType = any, ParentType = ResolversParentTypes['Subscription']> = {
        somethingChanged?: SubscriptionResolver<Maybe<ResolversTypes['MyOtherType']>, ParentType, ContextType>,
      };
    `);
    await validate(result);
  });

  it('Should generate the correct resolvers when used with mappers with interfaces', async () => {
    const result = (await plugin(
      schema,
      [],
      {
        noSchemaStitching: true,
        mappers: {
          Node: 'MyNodeType',
        },
      },
      { outputFile: '' }
    )) as Types.ComplexPluginOutput;

    expect(result.content).toBeSimilarStringTo(`
    export type MyDirectiveDirectiveResolver<Result, Parent, ContextType = any, Args = {   arg?: Maybe<Scalars['Int']>,
      arg2?: Maybe<Scalars['String']>, arg3?: Maybe<Scalars['Boolean']> }> = DirectiveResolverFn<Result, Parent, ContextType, Args>;`);

    expect(result.content).toBeSimilarStringTo(`
      export type MyOtherTypeResolvers<ContextType = any, ParentType = ResolversParentTypes['MyOtherType']> = {
        bar?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export interface MyScalarScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['MyScalar'], any> {
        name: 'MyScalar'
      }
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type MyTypeResolvers<ContextType = any, ParentType = ResolversParentTypes['MyType']> = {
        foo?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
        otherType?: Resolver<Maybe<ResolversTypes['MyOtherType']>, ParentType, ContextType>,
        withArgs?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, MyTypeWithArgsArgs>,
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type MyUnionResolvers<ContextType = any, ParentType = ResolversParentTypes['MyUnion']> = {
        __resolveType: TypeResolveFn<'MyType' | 'MyOtherType', ParentType, ContextType>
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type NodeResolvers<ContextType = any, ParentType = ResolversParentTypes['Node']> = {
        __resolveType: TypeResolveFn<'SomeNode', ParentType, ContextType>,
        id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>,
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type QueryResolvers<ContextType = any, ParentType = ResolversParentTypes['Query']> = {
        something?: Resolver<ResolversTypes['MyType'], ParentType, ContextType>,
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type SomeNodeResolvers<ContextType = any, ParentType = ResolversParentTypes['SomeNode']> = {
        id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>,
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type SubscriptionResolvers<ContextType = any, ParentType = ResolversParentTypes['Subscription']> = {
        somethingChanged?: SubscriptionResolver<Maybe<ResolversTypes['MyOtherType']>, ParentType, ContextType>,
      };
    `);
    await validate(mergeOutputs([result, `type MyNodeType = {};`]));
  });

  it('Should generate basic type resolvers with defaultMapper set to any', async () => {
    const result = (await plugin(
      schema,
      [],
      {
        noSchemaStitching: true,
        defaultMapper: 'any',
      },
      { outputFile: '' }
    )) as Types.ComplexPluginOutput;

    expect(result.content).toBeSimilarStringTo(`
    export type MyDirectiveDirectiveResolver<Result, Parent, ContextType = any, Args = {   arg?: Maybe<Scalars['Int']>,
      arg2?: Maybe<Scalars['String']>, arg3?: Maybe<Scalars['Boolean']> }> = DirectiveResolverFn<Result, Parent, ContextType, Args>;`);

    expect(result.content).toBeSimilarStringTo(`
      export type MyOtherTypeResolvers<ContextType = any, ParentType = ResolversParentTypes['MyOtherType']> = {
        bar?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export interface MyScalarScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['MyScalar'], any> {
        name: 'MyScalar'
      }
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type MyTypeResolvers<ContextType = any, ParentType = ResolversParentTypes['MyType']> = {
        foo?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
        otherType?: Resolver<Maybe<ResolversTypes['MyOtherType']>, ParentType, ContextType>,
        withArgs?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, MyTypeWithArgsArgs>,
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type MyUnionResolvers<ContextType = any, ParentType = ResolversParentTypes['MyUnion']> = {
        __resolveType: TypeResolveFn<'MyType' | 'MyOtherType', ParentType, ContextType>
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type NodeResolvers<ContextType = any, ParentType = ResolversParentTypes['Node']> = {
        __resolveType: TypeResolveFn<'SomeNode', ParentType, ContextType>,
        id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>,
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type QueryResolvers<ContextType = any, ParentType = ResolversParentTypes['Query']> = {
        something?: Resolver<ResolversTypes['MyType'], ParentType, ContextType>,
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type SomeNodeResolvers<ContextType = any, ParentType = ResolversParentTypes['SomeNode']> = {
        id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>,
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type SubscriptionResolvers<ContextType = any, ParentType = ResolversParentTypes['Subscription']> = {
        somethingChanged?: SubscriptionResolver<Maybe<ResolversTypes['MyOtherType']>, ParentType, ContextType>,
      };
    `);
    await validate(result);
  });

  it('Should generate basic type resolvers with defaultMapper set to external identifier', async () => {
    const result = (await plugin(
      schema,
      [],
      {
        noSchemaStitching: true,
        defaultMapper: './my-file#MyBaseType',
      },
      { outputFile: '' }
    )) as Types.ComplexPluginOutput;

    expect(result.prepend).toContain(`import { MyBaseType } from './my-file';`);

    expect(result.content).toBeSimilarStringTo(`
    export type MyDirectiveDirectiveResolver<Result, Parent, ContextType = any, Args = {   arg?: Maybe<Scalars['Int']>,
      arg2?: Maybe<Scalars['String']>, arg3?: Maybe<Scalars['Boolean']> }> = DirectiveResolverFn<Result, Parent, ContextType, Args>;`);

    expect(result.content).toBeSimilarStringTo(`
      export type MyOtherTypeResolvers<ContextType = any, ParentType = ResolversParentTypes['MyOtherType']> = {
        bar?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export interface MyScalarScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['MyScalar'], any> {
        name: 'MyScalar'
      }
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type MyTypeResolvers<ContextType = any, ParentType = ResolversParentTypes['MyType']> = {
        foo?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
        otherType?: Resolver<Maybe<ResolversTypes['MyOtherType']>, ParentType, ContextType>,
        withArgs?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, MyTypeWithArgsArgs>,
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type MyUnionResolvers<ContextType = any, ParentType = ResolversParentTypes['MyUnion']> = {
        __resolveType: TypeResolveFn<'MyType' | 'MyOtherType', ParentType, ContextType>
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type NodeResolvers<ContextType = any, ParentType = ResolversParentTypes['Node']> = {
        __resolveType: TypeResolveFn<'SomeNode', ParentType, ContextType>,
        id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>,
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type QueryResolvers<ContextType = any, ParentType = ResolversParentTypes['Query']> = {
        something?: Resolver<ResolversTypes['MyType'], ParentType, ContextType>,
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type SomeNodeResolvers<ContextType = any, ParentType = ResolversParentTypes['SomeNode']> = {
        id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>,
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type SubscriptionResolvers<ContextType = any, ParentType = ResolversParentTypes['Subscription']> = {
        somethingChanged?: SubscriptionResolver<Maybe<ResolversTypes['MyOtherType']>, ParentType, ContextType>,
      };
    `);
    await validate(result);
  });

  it('Should replace using Omit when non-mapped type is pointing to mapped type', async () => {
    const result = (await plugin(
      schema,
      [],
      {
        noSchemaStitching: true,
        mappers: {
          MyOtherType: 'MyOtherTypeCustom',
        },
      },
      { outputFile: '' }
    )) as Types.ComplexPluginOutput;

    expect(result.content).toBeSimilarStringTo(`
    export type ResolversTypes = {
      Query: ResolverTypeWrapper<{}>,
      MyType: ResolverTypeWrapper<Omit<MyType, 'otherType'> & { otherType?: Maybe<ResolversTypes['MyOtherType']> }>,
      String: ResolverTypeWrapper<Scalars['String']>,
      MyOtherType: ResolverTypeWrapper<MyOtherTypeCustom>,
      Subscription: ResolverTypeWrapper<{}>,
      Boolean: ResolverTypeWrapper<Scalars['Boolean']>,
      Node: ResolverTypeWrapper<Node>,
      ID: ResolverTypeWrapper<Scalars['ID']>,
      SomeNode: ResolverTypeWrapper<SomeNode>,
      MyUnion: ResolversTypes['MyType'] | ResolversTypes['MyOtherType'],
      MyScalar: ResolverTypeWrapper<Scalars['MyScalar']>,
      Int: ResolverTypeWrapper<Scalars['Int']>,
    };`);
    await validate(mergeOutputs([result, 'type MyOtherTypeCustom = {};']));
  });

  it('Should not replace using Omit when non-mapped type is pointing to mapped type', async () => {
    const result = (await plugin(
      schema,
      [],
      {
        noSchemaStitching: true,
        mappers: {
          MyOtherType: 'MyOtherTypeCustom',
          MyType: 'MyTypeCustom',
        },
      },
      { outputFile: '' }
    )) as Types.ComplexPluginOutput;

    expect(result.content).toBeSimilarStringTo(`
    export type ResolversTypes = {
      Query: ResolverTypeWrapper<{}>,
      MyType: ResolverTypeWrapper<MyTypeCustom>,
      String: ResolverTypeWrapper<Scalars['String']>,
      MyOtherType: ResolverTypeWrapper<MyOtherTypeCustom>,
      Subscription: ResolverTypeWrapper<{}>,
      Boolean: ResolverTypeWrapper<Scalars['Boolean']>,
      Node: ResolverTypeWrapper<Node>,
      ID: ResolverTypeWrapper<Scalars['ID']>,
      SomeNode: ResolverTypeWrapper<SomeNode>,
      MyUnion: ResolversTypes['MyType'] | ResolversTypes['MyOtherType'],
      MyScalar: ResolverTypeWrapper<Scalars['MyScalar']>,
      Int: ResolverTypeWrapper<Scalars['Int']>,
    };`);
    await validate(mergeOutputs([result, `type MyTypeCustom = {}; type MyOtherTypeCustom = {};`]));
  });
});
