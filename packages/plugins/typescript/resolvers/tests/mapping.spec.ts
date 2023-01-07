import '@graphql-codegen/testing';
import { mergeOutputs, Types } from '@graphql-codegen/plugin-helpers';
import { resolversTestingSchema, resolversTestingValidate } from '@graphql-codegen/testing';
import { buildSchema } from 'graphql';
import { plugin } from '../src/index.js';

describe('ResolversTypes', () => {
  it('Should build ResolversTypes object when there are no mappers', async () => {
    const result = await plugin(resolversTestingSchema, [], {}, { outputFile: '' });

    expect(result.content).toBeSimilarStringTo(`
    export type ResolversTypes = {
      MyType: ResolverTypeWrapper<Omit<MyType, 'unionChild'> & { unionChild?: Maybe<ResolversTypes['ChildUnion']> }>;
      String: ResolverTypeWrapper<Scalars['String']>;
      Child: ResolverTypeWrapper<Child>;
      MyOtherType: ResolverTypeWrapper<MyOtherType>;
      ChildUnion: ResolversTypes['Child'] | ResolversTypes['MyOtherType'];
      Query: ResolverTypeWrapper<{}>;
      Subscription: ResolverTypeWrapper<{}>;
      Node: ResolversTypes['SomeNode'];
      ID: ResolverTypeWrapper<Scalars['ID']>;
      SomeNode: ResolverTypeWrapper<SomeNode>;
      MyUnion: ResolversTypes['MyType'] | ResolversTypes['MyOtherType'];
      MyScalar: ResolverTypeWrapper<Scalars['MyScalar']>;
      Int: ResolverTypeWrapper<Scalars['Int']>;
      Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
    };`);
  });

  it('Should build ResolversTypes with simple mappers', async () => {
    const result = (await plugin(
      resolversTestingSchema,
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
        MyType: ResolverTypeWrapper<MyTypeDb>;
        String: ResolverTypeWrapper<number>;
        Child: ResolverTypeWrapper<Omit<Child, 'bar' | 'parent'> & { bar: ResolversTypes['String'], parent?: Maybe<ResolversTypes['MyType']> }>;
        MyOtherType: ResolverTypeWrapper<Omit<MyOtherType, 'bar'> & { bar: ResolversTypes['String'] }>;
        ChildUnion: ResolversTypes['Child'] | ResolversTypes['MyOtherType'];
        Query: ResolverTypeWrapper<{}>;
        Subscription: ResolverTypeWrapper<{}>;
        Node: ResolversTypes['SomeNode'];
        ID: ResolverTypeWrapper<Scalars['ID']>;
        SomeNode: ResolverTypeWrapper<SomeNode>;
        MyUnion: ResolversTypes['MyType'] | ResolversTypes['MyOtherType'];
        MyScalar: ResolverTypeWrapper<Scalars['MyScalar']>;
        Int: ResolverTypeWrapper<Scalars['Int']>;
        Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
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
        Movie: ResolverTypeWrapper<MovieEntity>;
        ID: ResolverTypeWrapper<Scalars['ID']>;
        String: ResolverTypeWrapper<Scalars['String']>;
        Book: ResolverTypeWrapper<Book>;
        MovieLike: ResolversTypes['Movie'] | ResolversTypes['Book'];
        NonInterfaceHasNarrative: ResolverTypeWrapper<Omit<NonInterfaceHasNarrative, 'narrative' | 'movie'> & { narrative: ResolversTypes['MovieLike'], movie: ResolversTypes['Movie'] }>;
        Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
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
      Movie: ResolverTypeWrapper<MovieEntity>;
      ID: ResolverTypeWrapper<Scalars['ID']>;
      String: ResolverTypeWrapper<Scalars['String']>;
      Book: ResolverTypeWrapper<Book>;
      MovieLike: ResolversTypes['Movie'] | ResolversTypes['Book'];
      NonInterfaceHasNarrative: ResolverTypeWrapper<Omit<NonInterfaceHasNarrative, 'narrative' | 'movie'> & { narrative: ResolversTypes['MovieLike'], movie: ResolversTypes['Movie'] }>;
      LayerOfIndirection: ResolverTypeWrapper<Omit<LayerOfIndirection, 'movies'> & { movies: Array<ResolversTypes['NonInterfaceHasNarrative']> }>;
      AnotherLayerOfIndirection: ResolverTypeWrapper<Omit<AnotherLayerOfIndirection, 'inner'> & { inner: ResolversTypes['LayerOfIndirection'] }>;
      Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
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
          typeNames: 'change-case-all#pascalCase',
          enumValues: 'change-case-all#upperCase',
        },
        noSchemaStitching: true,
      },
      { outputFile: '' }
    )) as Types.ComplexPluginOutput;
    const content = mergeOutputs([result]);

    expect(content).toBeSimilarStringTo(`export type GqlResolversTypes = {
      Account: ResolverTypeWrapper<Partial<GqlAccount>>;
      ID: ResolverTypeWrapper<Partial<Scalars['ID']>>;
      String: ResolverTypeWrapper<Partial<Scalars['String']>>;
      Program: ResolverTypeWrapper<Partial<GqlProgram>>;
      Boolean: ResolverTypeWrapper<Partial<Scalars['Boolean']>>;
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

    await resolversTestingValidate(
      mergeOutputs([usage, result]),
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
      resolversTestingSchema,
      [],
      {
        noSchemaStitching: true,
        defaultMapper: 'Partial<{T}>',
      },
      { outputFile: '' }
    )) as Types.ComplexPluginOutput;

    expect(result.content).toBeSimilarStringTo(`
    export type ResolversTypes = {
      MyType: ResolverTypeWrapper<Partial<Omit<MyType, 'unionChild'> & { unionChild?: Maybe<ResolversTypes['ChildUnion']> }>>;
      String: ResolverTypeWrapper<Partial<Scalars['String']>>;
      Child: ResolverTypeWrapper<Partial<Child>>;
      MyOtherType: ResolverTypeWrapper<Partial<MyOtherType>>;
      ChildUnion: Partial<ResolversTypes['Child'] | ResolversTypes['MyOtherType']>;
      Query: ResolverTypeWrapper<{}>;
      Subscription: ResolverTypeWrapper<{}>;
      Node: ResolversTypes['SomeNode'];
      ID: ResolverTypeWrapper<Partial<Scalars['ID']>>;
      SomeNode: ResolverTypeWrapper<Partial<SomeNode>>;
      MyUnion: Partial<ResolversTypes['MyType'] | ResolversTypes['MyOtherType']>;
      MyScalar: ResolverTypeWrapper<Partial<Scalars['MyScalar']>>;
      Int: ResolverTypeWrapper<Partial<Scalars['Int']>>;
      Boolean: ResolverTypeWrapper<Partial<Scalars['Boolean']>>;
    };`);
  });

  it('Should build ResolversTypes with defaultMapper set using {T} with external identifier', async () => {
    const result = (await plugin(
      resolversTestingSchema,
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
      MyType: ResolverTypeWrapper<CustomPartial<Omit<MyType, 'unionChild'> & { unionChild?: Maybe<ResolversTypes['ChildUnion']> }>>;
      String: ResolverTypeWrapper<CustomPartial<Scalars['String']>>;
      Child: ResolverTypeWrapper<CustomPartial<Child>>;
      MyOtherType: ResolverTypeWrapper<CustomPartial<MyOtherType>>;
      ChildUnion: CustomPartial<ResolversTypes['Child'] | ResolversTypes['MyOtherType']>;
      Query: ResolverTypeWrapper<{}>;
      Subscription: ResolverTypeWrapper<{}>;
      Node: ResolversTypes['SomeNode'];
      ID: ResolverTypeWrapper<CustomPartial<Scalars['ID']>>;
      SomeNode: ResolverTypeWrapper<CustomPartial<SomeNode>>;
      MyUnion: CustomPartial<ResolversTypes['MyType'] | ResolversTypes['MyOtherType']>;
      MyScalar: ResolverTypeWrapper<CustomPartial<Scalars['MyScalar']>>;
      Int: ResolverTypeWrapper<CustomPartial<Scalars['Int']>>;
      Boolean: ResolverTypeWrapper<CustomPartial<Scalars['Boolean']>>;
    };`);
  });

  it('Should build ResolversTypes with mapper set for concrete type using {T} with external identifier', async () => {
    const result = (await plugin(
      resolversTestingSchema,
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
      MyType: ResolverTypeWrapper<CustomPartial<MyType>>;
      String: ResolverTypeWrapper<Scalars['String']>;
      Child: ResolverTypeWrapper<Omit<Child, 'parent'> & { parent?: Maybe<ResolversTypes['MyType']> }>;
      MyOtherType: ResolverTypeWrapper<MyOtherType>;
      ChildUnion: ResolversTypes['Child'] | ResolversTypes['MyOtherType'];
      Query: ResolverTypeWrapper<{}>;
      Subscription: ResolverTypeWrapper<{}>;
      Node: ResolversTypes['SomeNode'];
      ID: ResolverTypeWrapper<Scalars['ID']>;
      SomeNode: ResolverTypeWrapper<SomeNode>;
      MyUnion: ResolversTypes['MyType'] | ResolversTypes['MyOtherType'];
      MyScalar: ResolverTypeWrapper<Scalars['MyScalar']>;
      Int: ResolverTypeWrapper<Scalars['Int']>;
      Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
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
    const result = await plugin(testSchema, [], config, { outputFile: '' });

    expect(result.content).toBeSimilarStringTo(`
      export type ResolversTypes = {
        User: ResolverTypeWrapper<number>;
        ID: ResolverTypeWrapper<Partial<Scalars['ID']>>;
        String: ResolverTypeWrapper<Partial<Scalars['String']>>;
        Chat: ResolverTypeWrapper<Partial<Omit<Chat, 'owner' | 'members'> & { owner: ResolversTypes['User'], members?: Maybe<Array<ResolversTypes['User']>> }>>;
        Query: ResolverTypeWrapper<{}>;
        Boolean: ResolverTypeWrapper<Partial<Scalars['Boolean']>>;
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

    await resolversTestingValidate(mergeOutputs([result, usage]), config, testSchema);
  });

  it('Should build ResolversTypes with mapper set for concrete type using renamed external identifier', async () => {
    const result = (await plugin(
      resolversTestingSchema,
      [],
      {
        noSchemaStitching: true,
        mappers: {
          MyType: './my-type#MyType as DatabaseMyType',
        },
      },
      { outputFile: '' }
    )) as Types.ComplexPluginOutput;

    expect(result.prepend).toContain(`import { MyType as DatabaseMyType } from './my-type';`);
    expect(result.content).toBeSimilarStringTo(`
    export type ResolversTypes = {
      MyType: ResolverTypeWrapper<DatabaseMyType>;
      String: ResolverTypeWrapper<Scalars['String']>;
      Child: ResolverTypeWrapper<Omit<Child, 'parent'> & { parent?: Maybe<ResolversTypes['MyType']> }>;
      MyOtherType: ResolverTypeWrapper<MyOtherType>;
      ChildUnion: ResolversTypes['Child'] | ResolversTypes['MyOtherType'];
      Query: ResolverTypeWrapper<{}>;
      Subscription: ResolverTypeWrapper<{}>;
      Node: ResolversTypes['SomeNode'];
      ID: ResolverTypeWrapper<Scalars['ID']>;
      SomeNode: ResolverTypeWrapper<SomeNode>;
      MyUnion: ResolversTypes['MyType'] | ResolversTypes['MyOtherType'];
      MyScalar: ResolverTypeWrapper<Scalars['MyScalar']>;
      Int: ResolverTypeWrapper<Scalars['Int']>;
      Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
    };`);
  });

  it('Should build ResolversTypes with mapper set for concrete type using renamed external identifier (with default)', async () => {
    const result = (await plugin(
      resolversTestingSchema,
      [],
      {
        noSchemaStitching: true,
        mappers: {
          MyOtherType: './my-type#default as DatabaseMyOtherType',
          MyType: './my-type#MyType as DatabaseMyType',
        },
      },
      { outputFile: '' }
    )) as Types.ComplexPluginOutput;

    expect(result.prepend).toContain(`import DatabaseMyOtherType, { MyType as DatabaseMyType } from './my-type';`);
    expect(result.content).toBeSimilarStringTo(`
    export type ResolversTypes = {
      MyType: ResolverTypeWrapper<DatabaseMyType>;
      String: ResolverTypeWrapper<Scalars['String']>;
      Child: ResolverTypeWrapper<Omit<Child, 'parent'> & { parent?: Maybe<ResolversTypes['MyType']> }>;
      MyOtherType: ResolverTypeWrapper<DatabaseMyOtherType>;
      ChildUnion: ResolversTypes['Child'] | ResolversTypes['MyOtherType'];
      Query: ResolverTypeWrapper<{}>;
      Subscription: ResolverTypeWrapper<{}>;
      Node: ResolversTypes['SomeNode'];
      ID: ResolverTypeWrapper<Scalars['ID']>;
      SomeNode: ResolverTypeWrapper<SomeNode>;
      MyUnion: ResolversTypes['MyType'] | ResolversTypes['MyOtherType'];
      MyScalar: ResolverTypeWrapper<Scalars['MyScalar']>;
      Int: ResolverTypeWrapper<Scalars['Int']>;
      Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
    };`);
  });

  it('Should build ResolversTypes with mapper set for concrete type using renamed external identifier (with default) and type import', async () => {
    const result = (await plugin(
      resolversTestingSchema,
      [],
      {
        noSchemaStitching: true,
        mappers: {
          MyOtherType: './my-type#default as DatabaseMyOtherType',
          MyType: './my-type#MyType as DatabaseMyType',
        },
        useTypeImports: true,
      },
      { outputFile: '' }
    )) as Types.ComplexPluginOutput;

    expect(result.prepend).toContain(
      `import type { default as DatabaseMyOtherType, MyType as DatabaseMyType } from './my-type';`
    );
    expect(result.content).toBeSimilarStringTo(`
    export type ResolversTypes = {
      MyType: ResolverTypeWrapper<DatabaseMyType>;
      String: ResolverTypeWrapper<Scalars['String']>;
      Child: ResolverTypeWrapper<Omit<Child, 'parent'> & { parent?: Maybe<ResolversTypes['MyType']> }>;
      MyOtherType: ResolverTypeWrapper<DatabaseMyOtherType>;
      ChildUnion: ResolversTypes['Child'] | ResolversTypes['MyOtherType'];
      Query: ResolverTypeWrapper<{}>;
      Subscription: ResolverTypeWrapper<{}>;
      Node: ResolversTypes['SomeNode'];
      ID: ResolverTypeWrapper<Scalars['ID']>;
      SomeNode: ResolverTypeWrapper<SomeNode>;
      MyUnion: ResolversTypes['MyType'] | ResolversTypes['MyOtherType'];
      MyScalar: ResolverTypeWrapper<Scalars['MyScalar']>;
      Int: ResolverTypeWrapper<Scalars['Int']>;
      Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
    };`);
  });

  it('Should build ResolversTypes with defaultMapper set', async () => {
    const result = (await plugin(
      resolversTestingSchema,
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
      MyType: ResolverTypeWrapper<MyTypeDb>;
      String: ResolverTypeWrapper<string>;
      Child: ResolverTypeWrapper<any>;
      MyOtherType: ResolverTypeWrapper<any>;
      ChildUnion: ResolverTypeWrapper<any>;
      Query: ResolverTypeWrapper<{}>;
      Subscription: ResolverTypeWrapper<{}>;
      Node: ResolversTypes['SomeNode'];
      ID: ResolverTypeWrapper<any>;
      SomeNode: ResolverTypeWrapper<any>;
      MyUnion: ResolverTypeWrapper<any>;
      MyScalar: ResolverTypeWrapper<any>;
      Int: ResolverTypeWrapper<any>;
      Boolean: ResolverTypeWrapper<any>;
    };`);
  });

  it('Should build ResolversTypes with external mappers', async () => {
    const result = (await plugin(
      resolversTestingSchema,
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
      MyType: ResolverTypeWrapper<MyTypeDb>;
      String: ResolverTypeWrapper<Scalars['String']>;
      Child: ResolverTypeWrapper<Omit<Child, 'parent'> & { parent?: Maybe<ResolversTypes['MyType']> }>;
      MyOtherType: ResolverTypeWrapper<CustomMyOtherType>;
      ChildUnion: ResolversTypes['Child'] | ResolversTypes['MyOtherType'];
      Query: ResolverTypeWrapper<{}>;
      Subscription: ResolverTypeWrapper<{}>;
      Node: ResolversTypes['SomeNode'];
      ID: ResolverTypeWrapper<Scalars['ID']>;
      SomeNode: ResolverTypeWrapper<SomeNode>;
      MyUnion: ResolversTypes['MyType'] | ResolversTypes['MyOtherType'];
      MyScalar: ResolverTypeWrapper<Scalars['MyScalar']>;
      Int: ResolverTypeWrapper<Scalars['Int']>;
      Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
    };`);
  });

  it('Should handle {T} in a mapper', async () => {
    const result = (await plugin(
      resolversTestingSchema,
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
        MyType: ResolverTypeWrapper<Partial<MyType>>;
        String: ResolverTypeWrapper<Scalars['String']>;
        Child: ResolverTypeWrapper<Omit<Child, 'parent'> & { parent?: Maybe<ResolversTypes['MyType']> }>;
        MyOtherType: ResolverTypeWrapper<MyOtherType>;
        ChildUnion: ResolversTypes['Child'] | ResolversTypes['MyOtherType'];
        Query: ResolverTypeWrapper<{}>;
        Subscription: ResolverTypeWrapper<{}>;
        Node: ResolversTypes['SomeNode'];
        ID: ResolverTypeWrapper<Scalars['ID']>;
        SomeNode: ResolverTypeWrapper<SomeNode>;
        MyUnion: ResolversTypes['MyType'] | ResolversTypes['MyOtherType'];
        MyScalar: ResolverTypeWrapper<Scalars['MyScalar']>;
        Int: ResolverTypeWrapper<Scalars['Int']>;
        Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
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
      resolversTestingSchema,
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
    export type MyDirectiveDirectiveArgs = {
      arg: Scalars['Int'];
      arg2: Scalars['String'];
      arg3: Scalars['Boolean'];
    };
    `);
    expect(result.content).toBeSimilarStringTo(`
    export type MyDirectiveDirectiveResolver<Result, Parent, ContextType = any, Args = MyDirectiveDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;`);

    expect(result.content).toBeSimilarStringTo(`
        export type MyOtherTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['MyOtherType'] = ResolversParentTypes['MyOtherType']> = {
          bar?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
          __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
        };
      `);

    expect(result.content)
      .toBeSimilarStringTo(`export interface MyScalarScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['MyScalar'], any> {
      name: 'MyScalar';
        }
      `);

    expect(result.content).toBeSimilarStringTo(`
      export type MyTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['MyType'] = ResolversParentTypes['MyType']> = {
        foo?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
        otherType?: Resolver<Maybe<ResolversTypes['MyOtherType']>, ParentType, ContextType>;
        withArgs?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MyTypeWithArgsArgs, 'arg2'>>;
        unionChild?: Resolver<Maybe<ResolversTypes['ChildUnion']>, ParentType, ContextType>;
        __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type MyUnionResolvers<ContextType = any, ParentType extends ResolversParentTypes['MyUnion'] = ResolversParentTypes['MyUnion']> = {
        __resolveType: TypeResolveFn<'MyType' | 'MyOtherType', ParentType, ContextType>;
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type NodeResolvers<ContextType = any, ParentType extends ResolversParentTypes['Node'] = ResolversParentTypes['Node']> = {
        __resolveType: TypeResolveFn<'SomeNode', ParentType, ContextType>;
        id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
        something?: Resolver<ResolversTypes['MyType'], ParentType, ContextType>;
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type SomeNodeResolvers<ContextType = any, ParentType extends ResolversParentTypes['SomeNode'] = ResolversParentTypes['SomeNode']> = {
        id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
        __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type SubscriptionResolvers<ContextType = any, ParentType extends ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription']> = {
        somethingChanged?: SubscriptionResolver<Maybe<ResolversTypes['MyOtherType']>, "somethingChanged", ParentType, ContextType>;
      };
    `);
    await resolversTestingValidate(result);
  });

  it('Should generate basic type resolvers with external mappers using same imported type', async () => {
    const result = (await plugin(
      resolversTestingSchema,
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
    export type MyDirectiveDirectiveArgs = {
      arg: Scalars['Int'];
      arg2: Scalars['String'];
      arg3: Scalars['Boolean'];
    };
    `);
    expect(result.content).toBeSimilarStringTo(`
    export type MyDirectiveDirectiveResolver<Result, Parent, ContextType = any, Args = MyDirectiveDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;`);

    expect(result.content).toBeSimilarStringTo(`
        export type MyOtherTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['MyOtherType'] = ResolversParentTypes['MyOtherType']> = {
          bar?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
          __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
        };
      `);

    expect(result.content)
      .toBeSimilarStringTo(`export interface MyScalarScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['MyScalar'], any> {
      name: 'MyScalar';
        }
      `);

    expect(result.content).toBeSimilarStringTo(`
      export type MyTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['MyType'] = ResolversParentTypes['MyType']> = {
        foo?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
        otherType?: Resolver<Maybe<ResolversTypes['MyOtherType']>, ParentType, ContextType>;
        withArgs?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MyTypeWithArgsArgs, 'arg2'>>;
        unionChild?: Resolver<Maybe<ResolversTypes['ChildUnion']>, ParentType, ContextType>;
        __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type MyUnionResolvers<ContextType = any, ParentType extends ResolversParentTypes['MyUnion'] = ResolversParentTypes['MyUnion']> = {
        __resolveType: TypeResolveFn<'MyType' | 'MyOtherType', ParentType, ContextType>;
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type NodeResolvers<ContextType = any, ParentType extends ResolversParentTypes['Node'] = ResolversParentTypes['Node']> = {
        __resolveType: TypeResolveFn<'SomeNode', ParentType, ContextType>;
        id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
        something?: Resolver<ResolversTypes['MyType'], ParentType, ContextType>;
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type SomeNodeResolvers<ContextType = any, ParentType extends ResolversParentTypes['SomeNode'] = ResolversParentTypes['SomeNode']> = {
        id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
        __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type SubscriptionResolvers<ContextType = any, ParentType extends ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription']> = {
        somethingChanged?: SubscriptionResolver<Maybe<ResolversTypes['MyOtherType']>, "somethingChanged", ParentType, ContextType>;
      };
    `);
    await resolversTestingValidate(result);
  });

  it('Should generate the correct resolvers when used with mappers with interfaces', async () => {
    const spy = jest.spyOn(console, 'warn').mockImplementation();
    const result = (await plugin(
      resolversTestingSchema,
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
    export type MyDirectiveDirectiveArgs = {
      arg: Scalars['Int'];
      arg2: Scalars['String'];
      arg3: Scalars['Boolean'];
    };
    `);
    expect(result.content).toBeSimilarStringTo(`
    export type MyDirectiveDirectiveResolver<Result, Parent, ContextType = any, Args = MyDirectiveDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;`);

    expect(result.content).toBeSimilarStringTo(`
      export type MyOtherTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['MyOtherType'] = ResolversParentTypes['MyOtherType']> = {
        bar?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
        __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export interface MyScalarScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['MyScalar'], any> {
        name: 'MyScalar';
      }
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type MyTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['MyType'] = ResolversParentTypes['MyType']> = {
        foo?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
        otherType?: Resolver<Maybe<ResolversTypes['MyOtherType']>, ParentType, ContextType>;
        withArgs?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MyTypeWithArgsArgs, 'arg2'>>;
        unionChild?: Resolver<Maybe<ResolversTypes['ChildUnion']>, ParentType, ContextType>;
        __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type MyUnionResolvers<ContextType = any, ParentType extends ResolversParentTypes['MyUnion'] = ResolversParentTypes['MyUnion']> = {
        __resolveType: TypeResolveFn<'MyType' | 'MyOtherType', ParentType, ContextType>;
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type NodeResolvers<ContextType = any, ParentType extends ResolversParentTypes['Node'] = ResolversParentTypes['Node']> = {
        __resolveType: TypeResolveFn<'SomeNode', ParentType, ContextType>;
        id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
        something?: Resolver<ResolversTypes['MyType'], ParentType, ContextType>;
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type SomeNodeResolvers<ContextType = any, ParentType extends ResolversParentTypes['SomeNode'] = ResolversParentTypes['SomeNode']> = {
        id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
        __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type SubscriptionResolvers<ContextType = any, ParentType extends ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription']> = {
        somethingChanged?: SubscriptionResolver<Maybe<ResolversTypes['MyOtherType']>, "somethingChanged", ParentType, ContextType>;
      };
    `);
    await resolversTestingValidate(mergeOutputs([result, `type MyNodeType = {};`]));

    spy.mockRestore();
  });

  it('Should generate basic type resolvers with defaultMapper set to any', async () => {
    const result = (await plugin(
      resolversTestingSchema,
      [],
      {
        noSchemaStitching: true,
        defaultMapper: 'any',
      },
      { outputFile: '' }
    )) as Types.ComplexPluginOutput;

    expect(result.content).toBeSimilarStringTo(`
      export type MyOtherTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['MyOtherType'] = ResolversParentTypes['MyOtherType']> = {
        bar?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
        __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export interface MyScalarScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['MyScalar'], any> {
        name: 'MyScalar';
      }
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type MyTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['MyType'] = ResolversParentTypes['MyType']> = {
        foo?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
        otherType?: Resolver<Maybe<ResolversTypes['MyOtherType']>, ParentType, ContextType>;
        withArgs?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MyTypeWithArgsArgs, 'arg2'>>;
        unionChild?: Resolver<Maybe<ResolversTypes['ChildUnion']>, ParentType, ContextType>;
        __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type MyUnionResolvers<ContextType = any, ParentType extends ResolversParentTypes['MyUnion'] = ResolversParentTypes['MyUnion']> = {
        __resolveType: TypeResolveFn<'MyType' | 'MyOtherType', ParentType, ContextType>;
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type NodeResolvers<ContextType = any, ParentType extends ResolversParentTypes['Node'] = ResolversParentTypes['Node']> = {
        __resolveType: TypeResolveFn<'SomeNode', ParentType, ContextType>;
        id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
        something?: Resolver<ResolversTypes['MyType'], ParentType, ContextType>;
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type SomeNodeResolvers<ContextType = any, ParentType extends ResolversParentTypes['SomeNode'] = ResolversParentTypes['SomeNode']> = {
        id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
        __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type SubscriptionResolvers<ContextType = any, ParentType extends ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription']> = {
        somethingChanged?: SubscriptionResolver<Maybe<ResolversTypes['MyOtherType']>, "somethingChanged", ParentType, ContextType>;
      };
    `);
    await resolversTestingValidate(result);
  });

  it('Should generate basic type resolvers with defaultMapper set to external identifier', async () => {
    const result = (await plugin(
      resolversTestingSchema,
      [],
      {
        noSchemaStitching: true,
        defaultMapper: './my-file#MyBaseType',
      },
      { outputFile: '' }
    )) as Types.ComplexPluginOutput;

    expect(result.prepend).toContain(`import { MyBaseType } from './my-file';`);

    expect(result.content).toBeSimilarStringTo(`
      export type MyOtherTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['MyOtherType'] = ResolversParentTypes['MyOtherType']> = {
        bar?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
        __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export interface MyScalarScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['MyScalar'], any> {
        name: 'MyScalar';
      }
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type MyTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['MyType'] = ResolversParentTypes['MyType']> = {
        foo?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
        otherType?: Resolver<Maybe<ResolversTypes['MyOtherType']>, ParentType, ContextType>;
        withArgs?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MyTypeWithArgsArgs, 'arg2'>>;
        unionChild?: Resolver<Maybe<ResolversTypes['ChildUnion']>, ParentType, ContextType>;
        __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type MyUnionResolvers<ContextType = any, ParentType extends ResolversParentTypes['MyUnion'] = ResolversParentTypes['MyUnion']> = {
        __resolveType: TypeResolveFn<'MyType' | 'MyOtherType', ParentType, ContextType>;
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type NodeResolvers<ContextType = any, ParentType extends ResolversParentTypes['Node'] = ResolversParentTypes['Node']> = {
        __resolveType: TypeResolveFn<'SomeNode', ParentType, ContextType>;
        id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
        something?: Resolver<ResolversTypes['MyType'], ParentType, ContextType>;
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type SomeNodeResolvers<ContextType = any, ParentType extends ResolversParentTypes['SomeNode'] = ResolversParentTypes['SomeNode']> = {
        id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
        __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type SubscriptionResolvers<ContextType = any, ParentType extends ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription']> = {
        somethingChanged?: SubscriptionResolver<Maybe<ResolversTypes['MyOtherType']>, "somethingChanged", ParentType, ContextType>;
      };
    `);
    await resolversTestingValidate(result);
  });

  it('Should replace using Omit when non-mapped type is pointing to mapped type', async () => {
    const result = (await plugin(
      resolversTestingSchema,
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
      MyType: ResolverTypeWrapper<Omit<MyType, 'otherType' | 'unionChild'> & { otherType?: Maybe<ResolversTypes['MyOtherType']>, unionChild?: Maybe<ResolversTypes['ChildUnion']> }>;
      String: ResolverTypeWrapper<Scalars['String']>;
      Child: ResolverTypeWrapper<Omit<Child, 'parent'> & { parent?: Maybe<ResolversTypes['MyType']> }>;
      MyOtherType: ResolverTypeWrapper<MyOtherTypeCustom>;
      ChildUnion: ResolversTypes['Child'] | ResolversTypes['MyOtherType'];
      Query: ResolverTypeWrapper<{}>;
      Subscription: ResolverTypeWrapper<{}>;
      Node: ResolversTypes['SomeNode'];
      ID: ResolverTypeWrapper<Scalars['ID']>;
      SomeNode: ResolverTypeWrapper<SomeNode>;
      MyUnion: ResolversTypes['MyType'] | ResolversTypes['MyOtherType'];
      MyScalar: ResolverTypeWrapper<Scalars['MyScalar']>;
      Int: ResolverTypeWrapper<Scalars['Int']>;
      Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
    };`);
    await resolversTestingValidate(mergeOutputs([result, 'type MyOtherTypeCustom = {};']));
  });

  it('Should not replace using Omit when non-mapped type is pointing to mapped type', async () => {
    const result = (await plugin(
      resolversTestingSchema,
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
      MyType: ResolverTypeWrapper<MyTypeCustom>;
      String: ResolverTypeWrapper<Scalars['String']>;
      Child: ResolverTypeWrapper<Omit<Child, 'parent'> & { parent?: Maybe<ResolversTypes['MyType']> }>;
      MyOtherType: ResolverTypeWrapper<MyOtherTypeCustom>;
      ChildUnion: ResolversTypes['Child'] | ResolversTypes['MyOtherType'];
      Query: ResolverTypeWrapper<{}>;
      Subscription: ResolverTypeWrapper<{}>;
      Node: ResolversTypes['SomeNode'];
      ID: ResolverTypeWrapper<Scalars['ID']>;
      SomeNode: ResolverTypeWrapper<SomeNode>;
      MyUnion: ResolversTypes['MyType'] | ResolversTypes['MyOtherType'];
      MyScalar: ResolverTypeWrapper<Scalars['MyScalar']>;
      Int: ResolverTypeWrapper<Scalars['Int']>;
      Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
    };`);
    await resolversTestingValidate(mergeOutputs([result, `type MyTypeCustom = {}; type MyOtherTypeCustom = {};`]));
  });

  it('Should build ResolversTypes object when there are no mappers', async () => {
    const result = await plugin(resolversTestingSchema, [], {}, { outputFile: '' });

    expect(result.content).toBeSimilarStringTo(`
      export type ResolversTypes = {
        MyType: ResolverTypeWrapper<Omit<MyType, 'unionChild'> & { unionChild?: Maybe<ResolversTypes['ChildUnion']> }>;
        String: ResolverTypeWrapper<Scalars['String']>;
        Child: ResolverTypeWrapper<Child>;
        MyOtherType: ResolverTypeWrapper<MyOtherType>;
        ChildUnion: ResolversTypes['Child'] | ResolversTypes['MyOtherType'];
        Query: ResolverTypeWrapper<{}>;
        Subscription: ResolverTypeWrapper<{}>;
        Node: ResolversTypes['SomeNode'];
        ID: ResolverTypeWrapper<Scalars['ID']>;
        SomeNode: ResolverTypeWrapper<SomeNode>;
        MyUnion: ResolversTypes['MyType'] | ResolversTypes['MyOtherType'];
        MyScalar: ResolverTypeWrapper<Scalars['MyScalar']>;
        Int: ResolverTypeWrapper<Scalars['Int']>;
        Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
      };
    `);
  });

  it('should support namespaces', async () => {
    const result = (await plugin(
      resolversTestingSchema,
      [],
      {
        noSchemaStitching: true,
        mappers: {
          MyOtherType: './my-file#MyNamespace#MyCustomOtherType',
        },
      },
      { outputFile: '' }
    )) as Types.ComplexPluginOutput;

    expect(result.prepend).toContain(`import { MyNamespace } from './my-file';`);

    expect(result.content).toBeSimilarStringTo(`
      export type ResolversTypes = {
        MyType: ResolverTypeWrapper<Omit<MyType, 'otherType' | 'unionChild'> & { otherType?: Maybe<ResolversTypes['MyOtherType']>, unionChild?: Maybe<ResolversTypes['ChildUnion']> }>;
        String: ResolverTypeWrapper<Scalars['String']>;
        Child: ResolverTypeWrapper<Omit<Child, 'parent'> & { parent?: Maybe<ResolversTypes['MyType']> }>;
        MyOtherType: ResolverTypeWrapper<MyNamespace.MyCustomOtherType>;
        ChildUnion: ResolversTypes['Child'] | ResolversTypes['MyOtherType'];
        Query: ResolverTypeWrapper<{}>;
        Subscription: ResolverTypeWrapper<{}>;
        Node: ResolversTypes['SomeNode'];
        ID: ResolverTypeWrapper<Scalars['ID']>;
        SomeNode: ResolverTypeWrapper<SomeNode>;
        MyUnion: ResolversTypes['MyType'] | ResolversTypes['MyOtherType'];
        MyScalar: ResolverTypeWrapper<Scalars['MyScalar']>;
        Int: ResolverTypeWrapper<Scalars['Int']>;
        Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
    export type ResolversParentTypes = {
      MyType: Omit<MyType, 'otherType' | 'unionChild'> & { otherType?: Maybe<ResolversParentTypes['MyOtherType']>, unionChild?: Maybe<ResolversParentTypes['ChildUnion']> };
      String: Scalars['String'];
      Child: Omit<Child, 'parent'> & { parent?: Maybe<ResolversParentTypes['MyType']> };
      MyOtherType: MyNamespace.MyCustomOtherType;
      ChildUnion: ResolversParentTypes['Child'] | ResolversParentTypes['MyOtherType'];
      Query: {};
      Subscription: {};
      Node: ResolversParentTypes['SomeNode'];
      ID: Scalars['ID'];
      SomeNode: SomeNode;
      MyUnion: ResolversParentTypes['MyType'] | ResolversParentTypes['MyOtherType'];
      MyScalar: Scalars['MyScalar'];
      Int: Scalars['Int'];
      Boolean: Scalars['Boolean'];
    };
    `);
  });

  it('should support namespaces in contextType', async () => {
    const result = (await plugin(
      resolversTestingSchema,
      [],
      {
        noSchemaStitching: true,
        contextType: './my-file#MyNamespace#MyContextType',
      },
      { outputFile: '' }
    )) as Types.ComplexPluginOutput;

    expect(result.prepend).toContain(`import { MyNamespace } from './my-file';`);

    expect(result.content).toContain(`<ContextType = MyNamespace.MyContextType>`);
    expect(result.content).not.toContain(`<ContextType = MyNamespace>`);
    expect(result.content).not.toContain(`<ContextType = MyContextType>`);
  });

  it('should support namespaces in defaultMapper', async () => {
    const result = (await plugin(
      resolversTestingSchema,
      [],
      {
        defaultMapper: './my-file#MyNamespace#MyDefaultMapper',
      },
      { outputFile: '' }
    )) as Types.ComplexPluginOutput;

    expect(result.prepend).toContain(`import { MyNamespace } from './my-file';`);

    expect(result.content).toBeSimilarStringTo(`
      export type ResolversTypes = {
        MyType: ResolverTypeWrapper<MyNamespace.MyDefaultMapper>;
        String: ResolverTypeWrapper<MyNamespace.MyDefaultMapper>;
        Child: ResolverTypeWrapper<MyNamespace.MyDefaultMapper>;
        MyOtherType: ResolverTypeWrapper<MyNamespace.MyDefaultMapper>;
        ChildUnion: ResolverTypeWrapper<MyNamespace.MyDefaultMapper>;
        Query: ResolverTypeWrapper<{}>;
        Subscription: ResolverTypeWrapper<{}>;
        Node: ResolversTypes['SomeNode'];
        ID: ResolverTypeWrapper<MyNamespace.MyDefaultMapper>;
        SomeNode: ResolverTypeWrapper<MyNamespace.MyDefaultMapper>;
        MyUnion: ResolverTypeWrapper<MyNamespace.MyDefaultMapper>;
        MyScalar: ResolverTypeWrapper<MyNamespace.MyDefaultMapper>;
        Int: ResolverTypeWrapper<MyNamespace.MyDefaultMapper>;
        Boolean: ResolverTypeWrapper<MyNamespace.MyDefaultMapper>;
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type ResolversParentTypes = {
        MyType: MyNamespace.MyDefaultMapper;
        String: MyNamespace.MyDefaultMapper;
        Child: MyNamespace.MyDefaultMapper;
        MyOtherType: MyNamespace.MyDefaultMapper;
        ChildUnion: MyNamespace.MyDefaultMapper;
        Query: {};
        Subscription: {};
        Node: ResolversParentTypes['SomeNode'];
        ID: MyNamespace.MyDefaultMapper;
        SomeNode: MyNamespace.MyDefaultMapper;
        MyUnion: MyNamespace.MyDefaultMapper;
        MyScalar: MyNamespace.MyDefaultMapper;
        Int: MyNamespace.MyDefaultMapper;
        Boolean: MyNamespace.MyDefaultMapper;
      };
    `);
  });

  it('should support namespaces in rootValueType', async () => {
    const result = (await plugin(
      resolversTestingSchema,
      [],
      {
        noSchemaStitching: true,
        rootValueType: './my-file#MyNamespace#MyRootType',
      },
      { outputFile: '' }
    )) as Types.ComplexPluginOutput;

    expect(result.prepend).toContain(`import { MyNamespace } from './my-file';`);

    expect(result.content).toBeSimilarStringTo(`
      export type ResolversTypes = {
        MyType: ResolverTypeWrapper<Omit<MyType, 'unionChild'> & { unionChild?: Maybe<ResolversTypes['ChildUnion']> }>;
        String: ResolverTypeWrapper<Scalars['String']>;
        Child: ResolverTypeWrapper<Child>;
        MyOtherType: ResolverTypeWrapper<MyOtherType>;
        ChildUnion: ResolversTypes['Child'] | ResolversTypes['MyOtherType'];
        Query: ResolverTypeWrapper<MyNamespace.MyRootType>;
        Subscription: ResolverTypeWrapper<MyNamespace.MyRootType>;
        Node: ResolversTypes['SomeNode'];
        ID: ResolverTypeWrapper<Scalars['ID']>;
        SomeNode: ResolverTypeWrapper<SomeNode>;
        MyUnion: ResolversTypes['MyType'] | ResolversTypes['MyOtherType'];
        MyScalar: ResolverTypeWrapper<Scalars['MyScalar']>;
        Int: ResolverTypeWrapper<Scalars['Int']>;
        Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
    export type ResolversParentTypes = {
      MyType: Omit<MyType, 'unionChild'> & { unionChild?: Maybe<ResolversParentTypes['ChildUnion']> };
      String: Scalars['String'];
      Child: Child;
      MyOtherType: MyOtherType;
      ChildUnion: ResolversParentTypes['Child'] | ResolversParentTypes['MyOtherType'];
      Query: MyNamespace.MyRootType;
      Subscription: MyNamespace.MyRootType;
      Node: ResolversParentTypes['SomeNode'];
      ID: Scalars['ID'];
      SomeNode: SomeNode;
      MyUnion: ResolversParentTypes['MyType'] | ResolversParentTypes['MyOtherType'];
      MyScalar: Scalars['MyScalar'];
      Int: Scalars['Int'];
      Boolean: Scalars['Boolean'];
    };
    `);
  });

  it('should support namespaces and {T} placeholder', async () => {
    const result = (await plugin(
      resolversTestingSchema,
      [],
      {
        defaultMapper: './my-file#MyNamespace#MyDefaultMapper<{T}>',
        mappers: {
          MyType: './my-file#MyNamespace#MyType<{T}>',
        },
      },
      { outputFile: '' }
    )) as Types.ComplexPluginOutput;

    expect(result.prepend).toContain(`import { MyNamespace } from './my-file';`);

    expect(result.content).toBeSimilarStringTo(`
      export type ResolversTypes = {
        MyType: ResolverTypeWrapper<MyNamespace.MyType<MyType>>;
        String: ResolverTypeWrapper<MyNamespace.MyDefaultMapper<Scalars['String']>>;
        Child: ResolverTypeWrapper<MyNamespace.MyDefaultMapper<Omit<Child, 'parent'> & { parent?: Maybe<ResolversTypes['MyType']> }>>;
        MyOtherType: ResolverTypeWrapper<MyNamespace.MyDefaultMapper<MyOtherType>>;
        ChildUnion: MyNamespace.MyDefaultMapper<ResolversTypes['Child'] | ResolversTypes['MyOtherType']>;
        Query: ResolverTypeWrapper<{}>;
        Subscription: ResolverTypeWrapper<{}>;
        Node: ResolversTypes['SomeNode'];
        ID: ResolverTypeWrapper<MyNamespace.MyDefaultMapper<Scalars['ID']>>;
        SomeNode: ResolverTypeWrapper<MyNamespace.MyDefaultMapper<SomeNode>>;
        MyUnion: MyNamespace.MyDefaultMapper<ResolversTypes['MyType'] | ResolversTypes['MyOtherType']>;
        MyScalar: ResolverTypeWrapper<MyNamespace.MyDefaultMapper<Scalars['MyScalar']>>;
        Int: ResolverTypeWrapper<MyNamespace.MyDefaultMapper<Scalars['Int']>>;
        Boolean: ResolverTypeWrapper<MyNamespace.MyDefaultMapper<Scalars['Boolean']>>;
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
    export type ResolversParentTypes = {
      MyType: MyNamespace.MyType<MyType>;
      String: MyNamespace.MyDefaultMapper<Scalars['String']>;
      Child: MyNamespace.MyDefaultMapper<Omit<Child, 'parent'> & { parent?: Maybe<ResolversParentTypes['MyType']> }>;
      MyOtherType: MyNamespace.MyDefaultMapper<MyOtherType>;
      ChildUnion: MyNamespace.MyDefaultMapper<ResolversParentTypes['Child'] | ResolversParentTypes['MyOtherType']>;
      Query: {};
      Subscription: {};
      Node: ResolversParentTypes['SomeNode'];
      ID: MyNamespace.MyDefaultMapper<Scalars['ID']>;
      SomeNode: MyNamespace.MyDefaultMapper<SomeNode>;
      MyUnion: MyNamespace.MyDefaultMapper<ResolversParentTypes['MyType'] | ResolversParentTypes['MyOtherType']>;
      MyScalar: MyNamespace.MyDefaultMapper<Scalars['MyScalar']>;
      Int: MyNamespace.MyDefaultMapper<Scalars['Int']>;
      Boolean: MyNamespace.MyDefaultMapper<Scalars['Boolean']>;
    };
    `);
  });
});
