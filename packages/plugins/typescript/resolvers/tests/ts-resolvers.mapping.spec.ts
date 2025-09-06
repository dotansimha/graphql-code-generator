import { mergeOutputs, Types } from '@graphql-codegen/plugin-helpers';
import { resolversTestingSchema, resolversTestingValidate } from '@graphql-codegen/testing';
import { buildSchema } from 'graphql';
import { plugin } from '../src/index.js';

describe('TypeScript Resolvers Plugin - Mapping', () => {
  it('Should build ResolversTypes object when there are no mappers', async () => {
    const result = await plugin(resolversTestingSchema, [], {}, { outputFile: '' });

    expect(result.content).toBeSimilarStringTo(`
      export type ResolversUnionTypes<_RefType extends Record<string, unknown>> = {
        ChildUnion: ( Omit<Child, 'parent'> & { parent?: Maybe<_RefType['MyType']> } ) | ( MyOtherType );
        MyUnion: ( Omit<MyType, 'unionChild'> & { unionChild?: Maybe<_RefType['ChildUnion']> } ) | ( MyOtherType );
      };
    `);
    expect(result.content).toBeSimilarStringTo(`
      export type ResolversInterfaceTypes<_RefType extends Record<string, unknown>> = {
        Node: ( SomeNode );
        AnotherNode: ( Omit<AnotherNodeWithChild, 'unionChild' | 'interfaceChild'> & { unionChild?: Maybe<_RefType['ChildUnion']>, interfaceChild?: Maybe<_RefType['Node']> } ) | ( Omit<AnotherNodeWithAll, 'unionChild' | 'unionChildren' | 'interfaceChild' | 'interfaceChildren'> & { unionChild?: Maybe<_RefType['ChildUnion']>, unionChildren: Array<_RefType['ChildUnion']>, interfaceChild?: Maybe<_RefType['Node']>, interfaceChildren: Array<_RefType['Node']> } );
        WithChild: ( Omit<AnotherNodeWithChild, 'unionChild' | 'interfaceChild'> & { unionChild?: Maybe<_RefType['ChildUnion']>, interfaceChild?: Maybe<_RefType['Node']> } ) | ( Omit<AnotherNodeWithAll, 'unionChild' | 'unionChildren' | 'interfaceChild' | 'interfaceChildren'> & { unionChild?: Maybe<_RefType['ChildUnion']>, unionChildren: Array<_RefType['ChildUnion']>, interfaceChild?: Maybe<_RefType['Node']>, interfaceChildren: Array<_RefType['Node']> } );
        WithChildren: ( Omit<AnotherNodeWithAll, 'unionChild' | 'unionChildren' | 'interfaceChild' | 'interfaceChildren'> & { unionChild?: Maybe<_RefType['ChildUnion']>, unionChildren: Array<_RefType['ChildUnion']>, interfaceChild?: Maybe<_RefType['Node']>, interfaceChildren: Array<_RefType['Node']> } );
      };
    `);
    expect(result.content).toBeSimilarStringTo(`
    export type ResolversTypes = {
      MyType: ResolverTypeWrapper<Omit<MyType, 'unionChild'> & { unionChild?: Maybe<ResolversTypes['ChildUnion']> }>;
      String: ResolverTypeWrapper<Scalars['String']['output']>;
      Child: ResolverTypeWrapper<Omit<Child, 'parent'> & { parent?: Maybe<ResolversTypes['MyType']> }>;
      MyOtherType: ResolverTypeWrapper<MyOtherType>;
      ChildUnion: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['ChildUnion']>;
      Query: ResolverTypeWrapper<Record<PropertyKey, never>>;
      Subscription: ResolverTypeWrapper<Record<PropertyKey, never>>;
      Node: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['Node']>;
      ID: ResolverTypeWrapper<Scalars['ID']['output']>;
      SomeNode: ResolverTypeWrapper<SomeNode>;
      AnotherNode: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['AnotherNode']>;
      WithChild: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['WithChild']>;
      WithChildren: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['WithChildren']>;
      AnotherNodeWithChild: ResolverTypeWrapper<Omit<AnotherNodeWithChild, 'unionChild' | 'interfaceChild'> & { unionChild?: Maybe<ResolversTypes['ChildUnion']>, interfaceChild?: Maybe<ResolversTypes['Node']> }>;
      AnotherNodeWithAll: ResolverTypeWrapper<Omit<AnotherNodeWithAll, 'unionChild' | 'unionChildren' | 'interfaceChild' | 'interfaceChildren'> & { unionChild?: Maybe<ResolversTypes['ChildUnion']>, unionChildren: Array<ResolversTypes['ChildUnion']>, interfaceChild?: Maybe<ResolversTypes['Node']>, interfaceChildren: Array<ResolversTypes['Node']> }>;
      MyUnion: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['MyUnion']>;
      MyScalar: ResolverTypeWrapper<Scalars['MyScalar']['output']>;
      Int: ResolverTypeWrapper<Scalars['Int']['output']>;
      Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
    };
    `);
    expect(result.content).toBeSimilarStringTo(`
      export type ResolversParentTypes = {
        MyType: Omit<MyType, 'unionChild'> & { unionChild?: Maybe<ResolversParentTypes['ChildUnion']> };
        String: Scalars['String']['output'];
        Child: Omit<Child, 'parent'> & { parent?: Maybe<ResolversParentTypes['MyType']> };
        MyOtherType: MyOtherType;
        ChildUnion: ResolversUnionTypes<ResolversParentTypes>['ChildUnion'];
        Query: Record<PropertyKey, never>;
        Subscription: Record<PropertyKey, never>;
        Node: ResolversInterfaceTypes<ResolversParentTypes>['Node'];
        ID: Scalars['ID']['output'];
        SomeNode: SomeNode;
        AnotherNode: ResolversInterfaceTypes<ResolversParentTypes>['AnotherNode'];
        WithChild: ResolversInterfaceTypes<ResolversParentTypes>['WithChild'];
        WithChildren: ResolversInterfaceTypes<ResolversParentTypes>['WithChildren'];
        AnotherNodeWithChild: Omit<AnotherNodeWithChild, 'unionChild' | 'interfaceChild'> & { unionChild?: Maybe<ResolversParentTypes['ChildUnion']>, interfaceChild?: Maybe<ResolversParentTypes['Node']> };
        AnotherNodeWithAll: Omit<AnotherNodeWithAll, 'unionChild' | 'unionChildren' | 'interfaceChild' | 'interfaceChildren'> & { unionChild?: Maybe<ResolversParentTypes['ChildUnion']>, unionChildren: Array<ResolversParentTypes['ChildUnion']>, interfaceChild?: Maybe<ResolversParentTypes['Node']>, interfaceChildren: Array<ResolversParentTypes['Node']> };
        MyUnion: ResolversUnionTypes<ResolversParentTypes>['MyUnion'];
        MyScalar: Scalars['MyScalar']['output'];
        Int: Scalars['Int']['output'];
        Boolean: Scalars['Boolean']['output'];
      };
    `);
  });

  it('Should build ResolversTypes with simple mappers', async () => {
    const result = (await plugin(
      resolversTestingSchema,
      [],
      {
        mappers: {
          MyType: 'MyTypeDb',
          AnotherNodeWithChild: 'AnotherNodeWithChildMapper',
          String: 'number',
        },
      },
      { outputFile: '' }
    )) as Types.ComplexPluginOutput;

    expect(result.content).toBeSimilarStringTo(`
      export type ResolversUnionTypes<_RefType extends Record<string, unknown>> = {
        ChildUnion: ( Omit<Child, 'bar' | 'parent'> & { bar: _RefType['String'], parent?: Maybe<_RefType['MyType']> } ) | ( Omit<MyOtherType, 'bar'> & { bar: _RefType['String'] } );
        MyUnion: ( MyTypeDb ) | ( Omit<MyOtherType, 'bar'> & { bar: _RefType['String'] } );
      };
    `);
    expect(result.content).toBeSimilarStringTo(`
      export type ResolversInterfaceTypes<_RefType extends Record<string, unknown>> = {
        Node: ( SomeNode );
        AnotherNode: ( AnotherNodeWithChildMapper ) | ( Omit<AnotherNodeWithAll, 'unionChild' | 'unionChildren' | 'interfaceChild' | 'interfaceChildren'> & { unionChild?: Maybe<_RefType['ChildUnion']>, unionChildren: Array<_RefType['ChildUnion']>, interfaceChild?: Maybe<_RefType['Node']>, interfaceChildren: Array<_RefType['Node']> } );
        WithChild: ( AnotherNodeWithChildMapper ) | ( Omit<AnotherNodeWithAll, 'unionChild' | 'unionChildren' | 'interfaceChild' | 'interfaceChildren'> & { unionChild?: Maybe<_RefType['ChildUnion']>, unionChildren: Array<_RefType['ChildUnion']>, interfaceChild?: Maybe<_RefType['Node']>, interfaceChildren: Array<_RefType['Node']> } );
        WithChildren: ( Omit<AnotherNodeWithAll, 'unionChild' | 'unionChildren' | 'interfaceChild' | 'interfaceChildren'> & { unionChild?: Maybe<_RefType['ChildUnion']>, unionChildren: Array<_RefType['ChildUnion']>, interfaceChild?: Maybe<_RefType['Node']>, interfaceChildren: Array<_RefType['Node']> } );
      };
    `);
    expect(result.content).toBeSimilarStringTo(`
      export type ResolversTypes = {
        MyType: ResolverTypeWrapper<MyTypeDb>;
        String: ResolverTypeWrapper<number>;
        Child: ResolverTypeWrapper<Omit<Child, 'bar' | 'parent'> & { bar: ResolversTypes['String'], parent?: Maybe<ResolversTypes['MyType']> }>;
        MyOtherType: ResolverTypeWrapper<Omit<MyOtherType, 'bar'> & { bar: ResolversTypes['String'] }>;
        ChildUnion: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['ChildUnion']>;
        Query: ResolverTypeWrapper<Record<PropertyKey, never>>;
        Subscription: ResolverTypeWrapper<Record<PropertyKey, never>>;
        Node: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['Node']>;
        ID: ResolverTypeWrapper<Scalars['ID']['output']>;
        SomeNode: ResolverTypeWrapper<SomeNode>;
        AnotherNode: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['AnotherNode']>;
        WithChild: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['WithChild']>;
        WithChildren: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['WithChildren']>;
        AnotherNodeWithChild: ResolverTypeWrapper<AnotherNodeWithChildMapper>;
        AnotherNodeWithAll: ResolverTypeWrapper<Omit<AnotherNodeWithAll, 'unionChild' | 'unionChildren' | 'interfaceChild' | 'interfaceChildren'> & { unionChild?: Maybe<ResolversTypes['ChildUnion']>, unionChildren: Array<ResolversTypes['ChildUnion']>, interfaceChild?: Maybe<ResolversTypes['Node']>, interfaceChildren: Array<ResolversTypes['Node']> }>;
        MyUnion: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['MyUnion']>;
        MyScalar: ResolverTypeWrapper<Scalars['MyScalar']['output']>;
        Int: ResolverTypeWrapper<Scalars['Int']['output']>;
        Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
      };
    `);
    expect(result.content).toBeSimilarStringTo(`
      export type ResolversParentTypes = {
        MyType: MyTypeDb;
        String: number;
        Child: Omit<Child, 'bar' | 'parent'> & { bar: ResolversParentTypes['String'], parent?: Maybe<ResolversParentTypes['MyType']> };
        MyOtherType: Omit<MyOtherType, 'bar'> & { bar: ResolversParentTypes['String'] };
        ChildUnion: ResolversUnionTypes<ResolversParentTypes>['ChildUnion'];
        Query: Record<PropertyKey, never>;
        Subscription: Record<PropertyKey, never>;
        Node: ResolversInterfaceTypes<ResolversParentTypes>['Node'];
        ID: Scalars['ID']['output'];
        SomeNode: SomeNode;
        AnotherNode: ResolversInterfaceTypes<ResolversParentTypes>['AnotherNode'];
        WithChild: ResolversInterfaceTypes<ResolversParentTypes>['WithChild'];
        WithChildren: ResolversInterfaceTypes<ResolversParentTypes>['WithChildren'];
        AnotherNodeWithChild: AnotherNodeWithChildMapper;
        AnotherNodeWithAll: Omit<AnotherNodeWithAll, 'unionChild' | 'unionChildren' | 'interfaceChild' | 'interfaceChildren'> & { unionChild?: Maybe<ResolversParentTypes['ChildUnion']>, unionChildren: Array<ResolversParentTypes['ChildUnion']>, interfaceChild?: Maybe<ResolversParentTypes['Node']>, interfaceChildren: Array<ResolversParentTypes['Node']> };
        MyUnion: ResolversUnionTypes<ResolversParentTypes>['MyUnion'];
        MyScalar: Scalars['MyScalar']['output'];
        Int: Scalars['Int']['output'];
        Boolean: Scalars['Boolean']['output'];
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

    expect(result.content).toBeSimilarStringTo(`
      export type ResolversUnionTypes<_RefType extends Record<string, unknown>> = {
        MovieLike: ( MovieEntity ) | ( Book );
      };
    `);
    expect(content).toBeSimilarStringTo(`
      export type ResolversTypes = {
        Movie: ResolverTypeWrapper<MovieEntity>;
        ID: ResolverTypeWrapper<Scalars['ID']['output']>;
        String: ResolverTypeWrapper<Scalars['String']['output']>;
        Book: ResolverTypeWrapper<Book>;
        MovieLike: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['MovieLike']>;
        NonInterfaceHasNarrative: ResolverTypeWrapper<Omit<NonInterfaceHasNarrative, 'narrative' | 'movie'> & { narrative: ResolversTypes['MovieLike'], movie: ResolversTypes['Movie'] }>;
        Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
      };
    `);
    expect(content).toBeSimilarStringTo(`
      export type ResolversParentTypes = {
        Movie: MovieEntity;
        ID: Scalars['ID']['output'];
        String: Scalars['String']['output'];
        Book: Book;
        MovieLike: ResolversUnionTypes<ResolversParentTypes>['MovieLike'];
        NonInterfaceHasNarrative: Omit<NonInterfaceHasNarrative, 'narrative' | 'movie'> & { narrative: ResolversParentTypes['MovieLike'], movie: ResolversParentTypes['Movie'] };
        Boolean: Scalars['Boolean']['output'];
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

    expect(content).toBeSimilarStringTo(`
      export type ResolversUnionTypes<_RefType extends Record<string, unknown>> = {
        MovieLike: ( MovieEntity ) | ( Book );
      };
    `);
    expect(content).toBeSimilarStringTo(`export type ResolversTypes = {
      Movie: ResolverTypeWrapper<MovieEntity>;
      ID: ResolverTypeWrapper<Scalars['ID']['output']>;
      String: ResolverTypeWrapper<Scalars['String']['output']>;
      Book: ResolverTypeWrapper<Book>;
      MovieLike: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['MovieLike']>;
      NonInterfaceHasNarrative: ResolverTypeWrapper<Omit<NonInterfaceHasNarrative, 'narrative' | 'movie'> & { narrative: ResolversTypes['MovieLike'], movie: ResolversTypes['Movie'] }>;
      LayerOfIndirection: ResolverTypeWrapper<Omit<LayerOfIndirection, 'movies'> & { movies: Array<ResolversTypes['NonInterfaceHasNarrative']> }>;
      AnotherLayerOfIndirection: ResolverTypeWrapper<Omit<AnotherLayerOfIndirection, 'inner'> & { inner: ResolversTypes['LayerOfIndirection'] }>;
      Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
    };`);
    expect(content).toBeSimilarStringTo(`
      export type ResolversParentTypes = {
        Movie: MovieEntity;
        ID: Scalars['ID']['output'];
        String: Scalars['String']['output'];
        Book: Book;
        MovieLike: ResolversUnionTypes<ResolversParentTypes>['MovieLike'];
        NonInterfaceHasNarrative: Omit<NonInterfaceHasNarrative, 'narrative' | 'movie'> & { narrative: ResolversParentTypes['MovieLike'], movie: ResolversParentTypes['Movie'] };
        LayerOfIndirection: Omit<LayerOfIndirection, 'movies'> & { movies: Array<ResolversParentTypes['NonInterfaceHasNarrative']> };
        AnotherLayerOfIndirection: Omit<AnotherLayerOfIndirection, 'inner'> & { inner: ResolversParentTypes['LayerOfIndirection'] };
        Boolean: Scalars['Boolean']['output'];
      };
    `);
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
      ID: ResolverTypeWrapper<Partial<Scalars['ID']['output']>>;
      String: ResolverTypeWrapper<Partial<Scalars['String']['output']>>;
      Program: ResolverTypeWrapper<Partial<GqlProgram>>;
      Boolean: ResolverTypeWrapper<Partial<Scalars['Boolean']['output']>>;
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
      export type ResolversUnionTypes<_RefType extends Record<string, unknown>> = {
        ChildUnion: ( Partial<Omit<Child, 'parent'> & { parent?: Maybe<_RefType['MyType']> }> ) | ( Partial<MyOtherType> );
        MyUnion: ( Partial<Omit<MyType, 'unionChild'> & { unionChild?: Maybe<_RefType['ChildUnion']> }> ) | ( Partial<MyOtherType> );
      };
    `);
    expect(result.content).toBeSimilarStringTo(`
      export type ResolversInterfaceTypes<_RefType extends Record<string, unknown>> = {
        Node: ( Partial<SomeNode> );
        AnotherNode: ( Partial<Omit<AnotherNodeWithChild, 'unionChild' | 'interfaceChild'> & { unionChild?: Maybe<_RefType['ChildUnion']>, interfaceChild?: Maybe<_RefType['Node']> }> ) | ( Partial<Omit<AnotherNodeWithAll, 'unionChild' | 'unionChildren' | 'interfaceChild' | 'interfaceChildren'> & { unionChild?: Maybe<_RefType['ChildUnion']>, unionChildren: Array<_RefType['ChildUnion']>, interfaceChild?: Maybe<_RefType['Node']>, interfaceChildren: Array<_RefType['Node']> }> );
        WithChild: ( Partial<Omit<AnotherNodeWithChild, 'unionChild' | 'interfaceChild'> & { unionChild?: Maybe<_RefType['ChildUnion']>, interfaceChild?: Maybe<_RefType['Node']> }> ) | ( Partial<Omit<AnotherNodeWithAll, 'unionChild' | 'unionChildren' | 'interfaceChild' | 'interfaceChildren'> & { unionChild?: Maybe<_RefType['ChildUnion']>, unionChildren: Array<_RefType['ChildUnion']>, interfaceChild?: Maybe<_RefType['Node']>, interfaceChildren: Array<_RefType['Node']> }> );
        WithChildren: ( Partial<Omit<AnotherNodeWithAll, 'unionChild' | 'unionChildren' | 'interfaceChild' | 'interfaceChildren'> & { unionChild?: Maybe<_RefType['ChildUnion']>, unionChildren: Array<_RefType['ChildUnion']>, interfaceChild?: Maybe<_RefType['Node']>, interfaceChildren: Array<_RefType['Node']> }> );
      };
    `);
    expect(result.content).toBeSimilarStringTo(`
    export type ResolversTypes = {
      MyType: ResolverTypeWrapper<Partial<Omit<MyType, 'unionChild'> & { unionChild?: Maybe<ResolversTypes['ChildUnion']> }>>;
      String: ResolverTypeWrapper<Partial<Scalars['String']['output']>>;
      Child: ResolverTypeWrapper<Partial<Omit<Child, 'parent'> & { parent?: Maybe<ResolversTypes['MyType']> }>>;
      MyOtherType: ResolverTypeWrapper<Partial<MyOtherType>>;
      ChildUnion: Partial<ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['ChildUnion']>>;
      Query: ResolverTypeWrapper<Record<PropertyKey, never>>;
      Subscription: ResolverTypeWrapper<Record<PropertyKey, never>>;
      Node: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['Node']>;
      ID: ResolverTypeWrapper<Partial<Scalars['ID']['output']>>;
      SomeNode: ResolverTypeWrapper<Partial<SomeNode>>;
      AnotherNode: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['AnotherNode']>;
      WithChild: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['WithChild']>;
      WithChildren: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['WithChildren']>;
      AnotherNodeWithChild: ResolverTypeWrapper<Partial<Omit<AnotherNodeWithChild, 'unionChild' | 'interfaceChild'> & { unionChild?: Maybe<ResolversTypes['ChildUnion']>, interfaceChild?: Maybe<ResolversTypes['Node']> }>>;
      AnotherNodeWithAll: ResolverTypeWrapper<Partial<Omit<AnotherNodeWithAll, 'unionChild' | 'unionChildren' | 'interfaceChild' | 'interfaceChildren'> & { unionChild?: Maybe<ResolversTypes['ChildUnion']>, unionChildren: Array<ResolversTypes['ChildUnion']>, interfaceChild?: Maybe<ResolversTypes['Node']>, interfaceChildren: Array<ResolversTypes['Node']> }>>;
      MyUnion: Partial<ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['MyUnion']>>;
      MyScalar: ResolverTypeWrapper<Partial<Scalars['MyScalar']['output']>>;
      Int: ResolverTypeWrapper<Partial<Scalars['Int']['output']>>;
      Boolean: ResolverTypeWrapper<Partial<Scalars['Boolean']['output']>>;
    };`);
    expect(result.content).toBeSimilarStringTo(`
      export type ResolversParentTypes = {
        MyType: Partial<Omit<MyType, 'unionChild'> & { unionChild?: Maybe<ResolversParentTypes['ChildUnion']> }>;
        String: Partial<Scalars['String']['output']>;
        Child: Partial<Omit<Child, 'parent'> & { parent?: Maybe<ResolversParentTypes['MyType']> }>;
        MyOtherType: Partial<MyOtherType>;
        ChildUnion: Partial<ResolversUnionTypes<ResolversParentTypes>['ChildUnion']>;
        Query: Record<PropertyKey, never>;
        Subscription: Record<PropertyKey, never>;
        Node: ResolversInterfaceTypes<ResolversParentTypes>['Node'];
        ID: Partial<Scalars['ID']['output']>;
        SomeNode: Partial<SomeNode>;
        AnotherNode: ResolversInterfaceTypes<ResolversParentTypes>['AnotherNode'];
        WithChild: ResolversInterfaceTypes<ResolversParentTypes>['WithChild'];
        WithChildren: ResolversInterfaceTypes<ResolversParentTypes>['WithChildren'];
        AnotherNodeWithChild: Partial<Omit<AnotherNodeWithChild, 'unionChild' | 'interfaceChild'> & { unionChild?: Maybe<ResolversParentTypes['ChildUnion']>, interfaceChild?: Maybe<ResolversParentTypes['Node']> }>;
        AnotherNodeWithAll: Partial<Omit<AnotherNodeWithAll, 'unionChild' | 'unionChildren' | 'interfaceChild' | 'interfaceChildren'> & { unionChild?: Maybe<ResolversParentTypes['ChildUnion']>, unionChildren: Array<ResolversParentTypes['ChildUnion']>, interfaceChild?: Maybe<ResolversParentTypes['Node']>, interfaceChildren: Array<ResolversParentTypes['Node']> }>;
        MyUnion: Partial<ResolversUnionTypes<ResolversParentTypes>['MyUnion']>;
        MyScalar: Partial<Scalars['MyScalar']['output']>;
        Int: Partial<Scalars['Int']['output']>;
        Boolean: Partial<Scalars['Boolean']['output']>;
      };
    `);
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
      export type ResolversUnionTypes<_RefType extends Record<string, unknown>> = {
        ChildUnion: ( CustomPartial<Omit<Child, 'parent'> & { parent?: Maybe<_RefType['MyType']> }> ) | ( CustomPartial<MyOtherType> );
        MyUnion: ( CustomPartial<Omit<MyType, 'unionChild'> & { unionChild?: Maybe<_RefType['ChildUnion']> }> ) | ( CustomPartial<MyOtherType> );
      }
    `);
    expect(result.content).toBeSimilarStringTo(`
      export type ResolversInterfaceTypes<_RefType extends Record<string, unknown>> = {
        Node: ( CustomPartial<SomeNode> );
        AnotherNode: ( CustomPartial<Omit<AnotherNodeWithChild, 'unionChild' | 'interfaceChild'> & { unionChild?: Maybe<_RefType['ChildUnion']>, interfaceChild?: Maybe<_RefType['Node']> }> ) | ( CustomPartial<Omit<AnotherNodeWithAll, 'unionChild' | 'unionChildren' | 'interfaceChild' | 'interfaceChildren'> & { unionChild?: Maybe<_RefType['ChildUnion']>, unionChildren: Array<_RefType['ChildUnion']>, interfaceChild?: Maybe<_RefType['Node']>, interfaceChildren: Array<_RefType['Node']> }> );
        WithChild: ( CustomPartial<Omit<AnotherNodeWithChild, 'unionChild' | 'interfaceChild'> & { unionChild?: Maybe<_RefType['ChildUnion']>, interfaceChild?: Maybe<_RefType['Node']> }> ) | ( CustomPartial<Omit<AnotherNodeWithAll, 'unionChild' | 'unionChildren' | 'interfaceChild' | 'interfaceChildren'> & { unionChild?: Maybe<_RefType['ChildUnion']>, unionChildren: Array<_RefType['ChildUnion']>, interfaceChild?: Maybe<_RefType['Node']>, interfaceChildren: Array<_RefType['Node']> }> );
        WithChildren: ( CustomPartial<Omit<AnotherNodeWithAll, 'unionChild' | 'unionChildren' | 'interfaceChild' | 'interfaceChildren'> & { unionChild?: Maybe<_RefType['ChildUnion']>, unionChildren: Array<_RefType['ChildUnion']>, interfaceChild?: Maybe<_RefType['Node']>, interfaceChildren: Array<_RefType['Node']> }> );
      };
    `);
    expect(result.content).toBeSimilarStringTo(`
    export type ResolversTypes = {
      MyType: ResolverTypeWrapper<CustomPartial<Omit<MyType, 'unionChild'> & { unionChild?: Maybe<ResolversTypes['ChildUnion']> }>>;
      String: ResolverTypeWrapper<CustomPartial<Scalars['String']['output']>>;
      Child: ResolverTypeWrapper<CustomPartial<Omit<Child, 'parent'> & { parent?: Maybe<ResolversTypes['MyType']> }>>;
      MyOtherType: ResolverTypeWrapper<CustomPartial<MyOtherType>>;
      ChildUnion: CustomPartial<ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['ChildUnion']>>;
      Query: ResolverTypeWrapper<Record<PropertyKey, never>>;
      Subscription: ResolverTypeWrapper<Record<PropertyKey, never>>;
      Node: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['Node']>;
      ID: ResolverTypeWrapper<CustomPartial<Scalars['ID']['output']>>;
      SomeNode: ResolverTypeWrapper<CustomPartial<SomeNode>>;
      AnotherNode: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['AnotherNode']>;
      WithChild: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['WithChild']>;
      WithChildren: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['WithChildren']>;
      AnotherNodeWithChild: ResolverTypeWrapper<CustomPartial<Omit<AnotherNodeWithChild, 'unionChild' | 'interfaceChild'> & { unionChild?: Maybe<ResolversTypes['ChildUnion']>, interfaceChild?: Maybe<ResolversTypes['Node']> }>>;
      AnotherNodeWithAll: ResolverTypeWrapper<CustomPartial<Omit<AnotherNodeWithAll, 'unionChild' | 'unionChildren' | 'interfaceChild' | 'interfaceChildren'> & { unionChild?: Maybe<ResolversTypes['ChildUnion']>, unionChildren: Array<ResolversTypes['ChildUnion']>, interfaceChild?: Maybe<ResolversTypes['Node']>, interfaceChildren: Array<ResolversTypes['Node']> }>>;
      MyUnion: CustomPartial<ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['MyUnion']>>;
      MyScalar: ResolverTypeWrapper<CustomPartial<Scalars['MyScalar']['output']>>;
      Int: ResolverTypeWrapper<CustomPartial<Scalars['Int']['output']>>;
      Boolean: ResolverTypeWrapper<CustomPartial<Scalars['Boolean']['output']>>;
    };`);
    expect(result.content).toBeSimilarStringTo(`
      export type ResolversParentTypes = {
        MyType: CustomPartial<Omit<MyType, 'unionChild'> & { unionChild?: Maybe<ResolversParentTypes['ChildUnion']> }>;
        String: CustomPartial<Scalars['String']['output']>;
        Child: CustomPartial<Omit<Child, 'parent'> & { parent?: Maybe<ResolversParentTypes['MyType']> }>;
        MyOtherType: CustomPartial<MyOtherType>;
        ChildUnion: CustomPartial<ResolversUnionTypes<ResolversParentTypes>['ChildUnion']>;
        Query: Record<PropertyKey, never>;
        Subscription: Record<PropertyKey, never>;
        Node: ResolversInterfaceTypes<ResolversParentTypes>['Node'];
        ID: CustomPartial<Scalars['ID']['output']>;
        SomeNode: CustomPartial<SomeNode>;
        AnotherNode: ResolversInterfaceTypes<ResolversParentTypes>['AnotherNode'];
        WithChild: ResolversInterfaceTypes<ResolversParentTypes>['WithChild'];
        WithChildren: ResolversInterfaceTypes<ResolversParentTypes>['WithChildren'];
        AnotherNodeWithChild: CustomPartial<Omit<AnotherNodeWithChild, 'unionChild' | 'interfaceChild'> & { unionChild?: Maybe<ResolversParentTypes['ChildUnion']>, interfaceChild?: Maybe<ResolversParentTypes['Node']> }>;
        AnotherNodeWithAll: CustomPartial<Omit<AnotherNodeWithAll, 'unionChild' | 'unionChildren' | 'interfaceChild' | 'interfaceChildren'> & { unionChild?: Maybe<ResolversParentTypes['ChildUnion']>, unionChildren: Array<ResolversParentTypes['ChildUnion']>, interfaceChild?: Maybe<ResolversParentTypes['Node']>, interfaceChildren: Array<ResolversParentTypes['Node']> }>;
        MyUnion: CustomPartial<ResolversUnionTypes<ResolversParentTypes>['MyUnion']>;
        MyScalar: CustomPartial<Scalars['MyScalar']['output']>;
        Int: CustomPartial<Scalars['Int']['output']>;
        Boolean: CustomPartial<Scalars['Boolean']['output']>;
      };
    `);
  });

  it('Should build ResolversTypes with mapper set for concrete type using {T} with external identifier', async () => {
    const result = (await plugin(
      resolversTestingSchema,
      [],
      {
        noSchemaStitching: true,
        mappers: {
          MyType: './my-wrapper#CustomPartial<{T}>',
          AnotherNodeWithChild: './my-wrapper#CustomPartial<{T}>',
        },
      },
      { outputFile: '' }
    )) as Types.ComplexPluginOutput;

    expect(result.prepend).toContain(`import { CustomPartial } from './my-wrapper';`);
    expect(result.content).toBeSimilarStringTo(`
      export type ResolversUnionTypes<_RefType extends Record<string, unknown>> = {
        ChildUnion: ( Omit<Child, 'parent'> & { parent?: Maybe<_RefType['MyType']> } ) | ( MyOtherType );
        MyUnion: ( CustomPartial<Omit<MyType, 'unionChild'> & { unionChild?: Maybe<_RefType['ChildUnion']> }> ) | ( MyOtherType );
      };
    `);
    expect(result.content).toBeSimilarStringTo(`
      export type ResolversInterfaceTypes<_RefType extends Record<string, unknown>> = {
        Node: ( SomeNode );
        AnotherNode: ( CustomPartial<Omit<AnotherNodeWithChild, 'unionChild' | 'interfaceChild'> & { unionChild?: Maybe<_RefType['ChildUnion']>, interfaceChild?: Maybe<_RefType['Node']> }> ) | ( Omit<AnotherNodeWithAll, 'unionChild' | 'unionChildren' | 'interfaceChild' | 'interfaceChildren'> & { unionChild?: Maybe<_RefType['ChildUnion']>, unionChildren: Array<_RefType['ChildUnion']>, interfaceChild?: Maybe<_RefType['Node']>, interfaceChildren: Array<_RefType['Node']> } );
        WithChild: ( CustomPartial<Omit<AnotherNodeWithChild, 'unionChild' | 'interfaceChild'> & { unionChild?: Maybe<_RefType['ChildUnion']>, interfaceChild?: Maybe<_RefType['Node']> }> ) | ( Omit<AnotherNodeWithAll, 'unionChild' | 'unionChildren' | 'interfaceChild' | 'interfaceChildren'> & { unionChild?: Maybe<_RefType['ChildUnion']>, unionChildren: Array<_RefType['ChildUnion']>, interfaceChild?: Maybe<_RefType['Node']>, interfaceChildren: Array<_RefType['Node']> } );
        WithChildren: ( Omit<AnotherNodeWithAll, 'unionChild' | 'unionChildren' | 'interfaceChild' | 'interfaceChildren'> & { unionChild?: Maybe<_RefType['ChildUnion']>, unionChildren: Array<_RefType['ChildUnion']>, interfaceChild?: Maybe<_RefType['Node']>, interfaceChildren: Array<_RefType['Node']> } );
      };
    `);
    expect(result.content).toBeSimilarStringTo(`
    export type ResolversTypes = {
      MyType: ResolverTypeWrapper<CustomPartial<Omit<MyType, 'unionChild'> & { unionChild?: Maybe<ResolversTypes['ChildUnion']> }>>;
      String: ResolverTypeWrapper<Scalars['String']['output']>;
      Child: ResolverTypeWrapper<Omit<Child, 'parent'> & { parent?: Maybe<ResolversTypes['MyType']> }>;
      MyOtherType: ResolverTypeWrapper<MyOtherType>;
      ChildUnion: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['ChildUnion']>;
      Query: ResolverTypeWrapper<Record<PropertyKey, never>>;
      Subscription: ResolverTypeWrapper<Record<PropertyKey, never>>;
      Node: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['Node']>;
      ID: ResolverTypeWrapper<Scalars['ID']['output']>;
      SomeNode: ResolverTypeWrapper<SomeNode>;
      AnotherNode: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['AnotherNode']>;
      WithChild: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['WithChild']>;
      WithChildren: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['WithChildren']>;
      AnotherNodeWithChild: ResolverTypeWrapper<CustomPartial<Omit<AnotherNodeWithChild, 'unionChild' | 'interfaceChild'> & { unionChild?: Maybe<ResolversTypes['ChildUnion']>, interfaceChild?: Maybe<ResolversTypes['Node']> }>>;
      AnotherNodeWithAll: ResolverTypeWrapper<Omit<AnotherNodeWithAll, 'unionChild' | 'unionChildren' | 'interfaceChild' | 'interfaceChildren'> & { unionChild?: Maybe<ResolversTypes['ChildUnion']>, unionChildren: Array<ResolversTypes['ChildUnion']>, interfaceChild?: Maybe<ResolversTypes['Node']>, interfaceChildren: Array<ResolversTypes['Node']> }>;
      MyUnion: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['MyUnion']>;
      MyScalar: ResolverTypeWrapper<Scalars['MyScalar']['output']>;
      Int: ResolverTypeWrapper<Scalars['Int']['output']>;
      Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
    };`);
    expect(result.content).toBeSimilarStringTo(`
      export type ResolversParentTypes = {
        MyType: CustomPartial<Omit<MyType, 'unionChild'> & { unionChild?: Maybe<ResolversParentTypes['ChildUnion']> }>;
        String: Scalars['String']['output'];
        Child: Omit<Child, 'parent'> & { parent?: Maybe<ResolversParentTypes['MyType']> };
        MyOtherType: MyOtherType;
        ChildUnion: ResolversUnionTypes<ResolversParentTypes>['ChildUnion'];
        Query: Record<PropertyKey, never>;
        Subscription: Record<PropertyKey, never>;
        Node: ResolversInterfaceTypes<ResolversParentTypes>['Node'];
        ID: Scalars['ID']['output'];
        SomeNode: SomeNode;
        AnotherNode: ResolversInterfaceTypes<ResolversParentTypes>['AnotherNode'];
        WithChild: ResolversInterfaceTypes<ResolversParentTypes>['WithChild'];
        WithChildren: ResolversInterfaceTypes<ResolversParentTypes>['WithChildren'];
        AnotherNodeWithChild: CustomPartial<Omit<AnotherNodeWithChild, 'unionChild' | 'interfaceChild'> & { unionChild?: Maybe<ResolversParentTypes['ChildUnion']>, interfaceChild?: Maybe<ResolversParentTypes['Node']> }>;
        AnotherNodeWithAll: Omit<AnotherNodeWithAll, 'unionChild' | 'unionChildren' | 'interfaceChild' | 'interfaceChildren'> & { unionChild?: Maybe<ResolversParentTypes['ChildUnion']>, unionChildren: Array<ResolversParentTypes['ChildUnion']>, interfaceChild?: Maybe<ResolversParentTypes['Node']>, interfaceChildren: Array<ResolversParentTypes['Node']> };
        MyUnion: ResolversUnionTypes<ResolversParentTypes>['MyUnion'];
        MyScalar: Scalars['MyScalar']['output'];
        Int: Scalars['Int']['output'];
        Boolean: Scalars['Boolean']['output'];
      };
    `);
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
        ID: ResolverTypeWrapper<Partial<Scalars['ID']['output']>>;
        String: ResolverTypeWrapper<Partial<Scalars['String']['output']>>;
        Chat: ResolverTypeWrapper<Partial<Omit<Chat, 'owner' | 'members'> & { owner: ResolversTypes['User'], members?: Maybe<Array<ResolversTypes['User']>> }>>;
        Query: ResolverTypeWrapper<Record<PropertyKey, never>>;
        Boolean: ResolverTypeWrapper<Partial<Scalars['Boolean']['output']>>;
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
          AnotherNodeWithChild: './my-interface#AnotherNodeWithChild as AnotherNodeWithChildMapper',
        },
      },
      { outputFile: '' }
    )) as Types.ComplexPluginOutput;

    expect(result.prepend).toContain(`import { MyType as DatabaseMyType } from './my-type';`);
    expect(result.prepend).toContain(
      `import { AnotherNodeWithChild as AnotherNodeWithChildMapper } from './my-interface';`
    );
    expect(result.content).toBeSimilarStringTo(`
      export type ResolversUnionTypes<_RefType extends Record<string, unknown>> = {
        ChildUnion: ( Omit<Child, 'parent'> & { parent?: Maybe<_RefType['MyType']> } ) | ( MyOtherType );
        MyUnion: ( DatabaseMyType ) | ( MyOtherType );
      };
    `);
    expect(result.content).toBeSimilarStringTo(`
      export type ResolversInterfaceTypes<_RefType extends Record<string, unknown>> = {
        Node: ( SomeNode );
        AnotherNode: ( AnotherNodeWithChildMapper ) | ( Omit<AnotherNodeWithAll, 'unionChild' | 'unionChildren' | 'interfaceChild' | 'interfaceChildren'> & { unionChild?: Maybe<_RefType['ChildUnion']>, unionChildren: Array<_RefType['ChildUnion']>, interfaceChild?: Maybe<_RefType['Node']>, interfaceChildren: Array<_RefType['Node']> } );
        WithChild: ( AnotherNodeWithChildMapper ) | ( Omit<AnotherNodeWithAll, 'unionChild' | 'unionChildren' | 'interfaceChild' | 'interfaceChildren'> & { unionChild?: Maybe<_RefType['ChildUnion']>, unionChildren: Array<_RefType['ChildUnion']>, interfaceChild?: Maybe<_RefType['Node']>, interfaceChildren: Array<_RefType['Node']> } );
        WithChildren: ( Omit<AnotherNodeWithAll, 'unionChild' | 'unionChildren' | 'interfaceChild' | 'interfaceChildren'> & { unionChild?: Maybe<_RefType['ChildUnion']>, unionChildren: Array<_RefType['ChildUnion']>, interfaceChild?: Maybe<_RefType['Node']>, interfaceChildren: Array<_RefType['Node']> } );
      };
    `);
    expect(result.content).toBeSimilarStringTo(`
    export type ResolversTypes = {
      MyType: ResolverTypeWrapper<DatabaseMyType>;
      String: ResolverTypeWrapper<Scalars['String']['output']>;
      Child: ResolverTypeWrapper<Omit<Child, 'parent'> & { parent?: Maybe<ResolversTypes['MyType']> }>;
      MyOtherType: ResolverTypeWrapper<MyOtherType>;
      ChildUnion: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['ChildUnion']>;
      Query: ResolverTypeWrapper<Record<PropertyKey, never>>;
      Subscription: ResolverTypeWrapper<Record<PropertyKey, never>>;
      Node: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['Node']>;
      ID: ResolverTypeWrapper<Scalars['ID']['output']>;
      SomeNode: ResolverTypeWrapper<SomeNode>;
      AnotherNode: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['AnotherNode']>;
      WithChild: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['WithChild']>;
      WithChildren: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['WithChildren']>;
      AnotherNodeWithChild: ResolverTypeWrapper<AnotherNodeWithChildMapper>;
      AnotherNodeWithAll: ResolverTypeWrapper<Omit<AnotherNodeWithAll, 'unionChild' | 'unionChildren' | 'interfaceChild' | 'interfaceChildren'> & { unionChild?: Maybe<ResolversTypes['ChildUnion']>, unionChildren: Array<ResolversTypes['ChildUnion']>, interfaceChild?: Maybe<ResolversTypes['Node']>, interfaceChildren: Array<ResolversTypes['Node']> }>;
      MyUnion: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['MyUnion']>;
      MyScalar: ResolverTypeWrapper<Scalars['MyScalar']['output']>;
      Int: ResolverTypeWrapper<Scalars['Int']['output']>;
      Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
    };`);
    expect(result.content).toBeSimilarStringTo(`
      export type ResolversParentTypes = {
        MyType: DatabaseMyType;
        String: Scalars['String']['output'];
        Child: Omit<Child, 'parent'> & { parent?: Maybe<ResolversParentTypes['MyType']> };
        MyOtherType: MyOtherType;
        ChildUnion: ResolversUnionTypes<ResolversParentTypes>['ChildUnion'];
        Query: Record<PropertyKey, never>;
        Subscription: Record<PropertyKey, never>;
        Node: ResolversInterfaceTypes<ResolversParentTypes>['Node'];
        ID: Scalars['ID']['output'];
        SomeNode: SomeNode;
        AnotherNode: ResolversInterfaceTypes<ResolversParentTypes>['AnotherNode'];
        WithChild: ResolversInterfaceTypes<ResolversParentTypes>['WithChild'];
        WithChildren: ResolversInterfaceTypes<ResolversParentTypes>['WithChildren'];
        AnotherNodeWithChild: AnotherNodeWithChildMapper;
        AnotherNodeWithAll: Omit<AnotherNodeWithAll, 'unionChild' | 'unionChildren' | 'interfaceChild' | 'interfaceChildren'> & { unionChild?: Maybe<ResolversParentTypes['ChildUnion']>, unionChildren: Array<ResolversParentTypes['ChildUnion']>, interfaceChild?: Maybe<ResolversParentTypes['Node']>, interfaceChildren: Array<ResolversParentTypes['Node']> };
        MyUnion: ResolversUnionTypes<ResolversParentTypes>['MyUnion'];
        MyScalar: Scalars['MyScalar']['output'];
        Int: Scalars['Int']['output'];
        Boolean: Scalars['Boolean']['output'];
      };
    `);
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
          AnotherNodeWithChild: './my-interface#default as AnotherNodeWithChildMapper',
          AnotherNodeWithAll: './my-interface#AnotherNodeWithAll as AnotherNodeWithAllMapper',
        },
      },
      { outputFile: '' }
    )) as Types.ComplexPluginOutput;

    expect(result.prepend).toContain(`import DatabaseMyOtherType, { MyType as DatabaseMyType } from './my-type';`);
    expect(result.content).toBeSimilarStringTo(`
      export type ResolversUnionTypes<_RefType extends Record<string, unknown>> = {
        ChildUnion: ( Omit<Child, 'parent'> & { parent?: Maybe<_RefType['MyType']> } ) | ( DatabaseMyOtherType );
        MyUnion: ( DatabaseMyType ) | ( DatabaseMyOtherType );
      };
    `);
    expect(result.content).toBeSimilarStringTo(`
      export type ResolversInterfaceTypes<_RefType extends Record<string, unknown>> = {
        Node: ( SomeNode );
        AnotherNode: ( AnotherNodeWithChildMapper ) | ( AnotherNodeWithAllMapper );
        WithChild: ( AnotherNodeWithChildMapper ) | ( AnotherNodeWithAllMapper );
        WithChildren: ( AnotherNodeWithAllMapper );
      };
    `);
    expect(result.content).toBeSimilarStringTo(`
    export type ResolversTypes = {
      MyType: ResolverTypeWrapper<DatabaseMyType>;
      String: ResolverTypeWrapper<Scalars['String']['output']>;
      Child: ResolverTypeWrapper<Omit<Child, 'parent'> & { parent?: Maybe<ResolversTypes['MyType']> }>;
      MyOtherType: ResolverTypeWrapper<DatabaseMyOtherType>;
      ChildUnion: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['ChildUnion']>;
      Query: ResolverTypeWrapper<Record<PropertyKey, never>>;
      Subscription: ResolverTypeWrapper<Record<PropertyKey, never>>;
      Node: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['Node']>;
      ID: ResolverTypeWrapper<Scalars['ID']['output']>;
      SomeNode: ResolverTypeWrapper<SomeNode>;
      AnotherNode: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['AnotherNode']>;
      WithChild: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['WithChild']>;
      WithChildren: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['WithChildren']>;
      AnotherNodeWithChild: ResolverTypeWrapper<AnotherNodeWithChildMapper>;
      AnotherNodeWithAll: ResolverTypeWrapper<AnotherNodeWithAllMapper>;
      MyUnion: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['MyUnion']>;
      MyScalar: ResolverTypeWrapper<Scalars['MyScalar']['output']>;
      Int: ResolverTypeWrapper<Scalars['Int']['output']>;
      Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
    };`);
    expect(result.content).toBeSimilarStringTo(`
      export type ResolversParentTypes = {
        MyType: DatabaseMyType;
        String: Scalars['String']['output'];
        Child: Omit<Child, 'parent'> & { parent?: Maybe<ResolversParentTypes['MyType']> };
        MyOtherType: DatabaseMyOtherType;
        ChildUnion: ResolversUnionTypes<ResolversParentTypes>['ChildUnion'];
        Query: Record<PropertyKey, never>;
        Subscription: Record<PropertyKey, never>;
        Node: ResolversInterfaceTypes<ResolversParentTypes>['Node'];
        ID: Scalars['ID']['output'];
        SomeNode: SomeNode;
        AnotherNode: ResolversInterfaceTypes<ResolversParentTypes>['AnotherNode'];
        WithChild: ResolversInterfaceTypes<ResolversParentTypes>['WithChild'];
        WithChildren: ResolversInterfaceTypes<ResolversParentTypes>['WithChildren'];
        AnotherNodeWithChild: AnotherNodeWithChildMapper;
        AnotherNodeWithAll: AnotherNodeWithAllMapper;
        MyUnion: ResolversUnionTypes<ResolversParentTypes>['MyUnion'];
        MyScalar: Scalars['MyScalar']['output'];
        Int: Scalars['Int']['output'];
        Boolean: Scalars['Boolean']['output'];
      };
    `);
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
          AnotherNodeWithChild: './my-interface#default as AnotherNodeWithChildMapper',
          AnotherNodeWithAll: './my-interface#AnotherNodeWithAll as AnotherNodeWithAllMapper',
        },
        useTypeImports: true,
      },
      { outputFile: '' }
    )) as Types.ComplexPluginOutput;

    expect(result.prepend).toContain(
      `import type { default as DatabaseMyOtherType, MyType as DatabaseMyType } from './my-type';`
    );
    expect(result.prepend).toContain(
      `import type { default as AnotherNodeWithChildMapper, AnotherNodeWithAll as AnotherNodeWithAllMapper } from './my-interface';`
    );
    expect(result.content).toBeSimilarStringTo(`
      export type ResolversUnionTypes<_RefType extends Record<string, unknown>> = {
        ChildUnion: ( Omit<Child, 'parent'> & { parent?: Maybe<_RefType['MyType']> } ) | ( DatabaseMyOtherType );
        MyUnion: ( DatabaseMyType ) | ( DatabaseMyOtherType );
      };
    `);
    expect(result.content).toBeSimilarStringTo(`
      export type ResolversInterfaceTypes<_RefType extends Record<string, unknown>> = {
        Node: ( SomeNode );
        AnotherNode: ( AnotherNodeWithChildMapper ) | ( AnotherNodeWithAllMapper );
        WithChild: ( AnotherNodeWithChildMapper ) | ( AnotherNodeWithAllMapper );
        WithChildren: ( AnotherNodeWithAllMapper );
      };
    `);
    expect(result.content).toBeSimilarStringTo(`
    export type ResolversTypes = {
      MyType: ResolverTypeWrapper<DatabaseMyType>;
      String: ResolverTypeWrapper<Scalars['String']['output']>;
      Child: ResolverTypeWrapper<Omit<Child, 'parent'> & { parent?: Maybe<ResolversTypes['MyType']> }>;
      MyOtherType: ResolverTypeWrapper<DatabaseMyOtherType>;
      ChildUnion: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['ChildUnion']>;
      Query: ResolverTypeWrapper<Record<PropertyKey, never>>;
      Subscription: ResolverTypeWrapper<Record<PropertyKey, never>>;
      Node: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['Node']>;
      ID: ResolverTypeWrapper<Scalars['ID']['output']>;
      SomeNode: ResolverTypeWrapper<SomeNode>;
      AnotherNode: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['AnotherNode']>;
      WithChild: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['WithChild']>;
      WithChildren: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['WithChildren']>;
      AnotherNodeWithChild: ResolverTypeWrapper<AnotherNodeWithChildMapper>;
      AnotherNodeWithAll: ResolverTypeWrapper<AnotherNodeWithAllMapper>;
      MyUnion: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['MyUnion']>;
      MyScalar: ResolverTypeWrapper<Scalars['MyScalar']['output']>;
      Int: ResolverTypeWrapper<Scalars['Int']['output']>;
      Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
    };`);
    expect(result.content).toBeSimilarStringTo(`
      export type ResolversParentTypes = {
        MyType: DatabaseMyType;
        String: Scalars['String']['output'];
        Child: Omit<Child, 'parent'> & { parent?: Maybe<ResolversParentTypes['MyType']> };
        MyOtherType: DatabaseMyOtherType;
        ChildUnion: ResolversUnionTypes<ResolversParentTypes>['ChildUnion'];
        Query: Record<PropertyKey, never>;
        Subscription: Record<PropertyKey, never>;
        Node: ResolversInterfaceTypes<ResolversParentTypes>['Node'];
        ID: Scalars['ID']['output'];
        SomeNode: SomeNode;
        AnotherNode: ResolversInterfaceTypes<ResolversParentTypes>['AnotherNode'];
        WithChild: ResolversInterfaceTypes<ResolversParentTypes>['WithChild'];
        WithChildren: ResolversInterfaceTypes<ResolversParentTypes>['WithChildren'];
        AnotherNodeWithChild: AnotherNodeWithChildMapper;
        AnotherNodeWithAll: AnotherNodeWithAllMapper;
        MyUnion: ResolversUnionTypes<ResolversParentTypes>['MyUnion'];
        MyScalar: Scalars['MyScalar']['output'];
        Int: Scalars['Int']['output'];
        Boolean: Scalars['Boolean']['output'];
      };
    `);
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

    expect(result.content).not.toBeSimilarStringTo(`export type ResolversUnionTypes`);
    expect(result.content).not.toBeSimilarStringTo(`export type ResolversInterfaceTypes`);
    expect(result.content).toBeSimilarStringTo(`
    export type ResolversTypes = {
      MyType: ResolverTypeWrapper<MyTypeDb>;
      String: ResolverTypeWrapper<string>;
      Child: ResolverTypeWrapper<any>;
      MyOtherType: ResolverTypeWrapper<any>;
      ChildUnion: ResolverTypeWrapper<any>;
      Query: ResolverTypeWrapper<Record<PropertyKey, never>>;
      Subscription: ResolverTypeWrapper<Record<PropertyKey, never>>;
      Node: ResolverTypeWrapper<any>;
      ID: ResolverTypeWrapper<any>;
      SomeNode: ResolverTypeWrapper<any>;
      AnotherNode: ResolverTypeWrapper<any>;
      WithChild: ResolverTypeWrapper<any>;
      WithChildren: ResolverTypeWrapper<any>;
      AnotherNodeWithChild: ResolverTypeWrapper<any>;
      AnotherNodeWithAll: ResolverTypeWrapper<any>;
      MyUnion: ResolverTypeWrapper<any>;
      MyScalar: ResolverTypeWrapper<any>;
      Int: ResolverTypeWrapper<any>;
      Boolean: ResolverTypeWrapper<any>;
    };`);
    expect(result.content).toBeSimilarStringTo(`
    export type ResolversParentTypes = {
      MyType: MyTypeDb;
      String: string;
      Child: any;
      MyOtherType: any;
      ChildUnion: any;
      Query: Record<PropertyKey, never>;
      Subscription: Record<PropertyKey, never>;
      Node: any;
      ID: any;
      SomeNode: any;
      AnotherNode: any;
      WithChild: any;
      WithChildren: any;
      AnotherNodeWithChild: any;
      AnotherNodeWithAll: any;
      MyUnion: any;
      MyScalar: any;
      Int: any;
      Boolean: any;
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
          AnotherNodeWithChild: './my-interface#AnotherNodeWithChildMapper',
          AnotherNodeWithAll: 'AnotherNodeWithAllMapper',
        },
      },
      { outputFile: '' }
    )) as Types.ComplexPluginOutput;

    expect(result.content).toBeSimilarStringTo(`
      export type ResolversUnionTypes<_RefType extends Record<string, unknown>> = {
        ChildUnion: ( Omit<Child, 'parent'> & { parent?: Maybe<_RefType['MyType']> } ) | ( CustomMyOtherType );
        MyUnion: ( MyTypeDb ) | ( CustomMyOtherType );
      };
    `);
    expect(result.content).toBeSimilarStringTo(`
      export type ResolversInterfaceTypes<_RefType extends Record<string, unknown>> = {
        Node: ( SomeNode );
        AnotherNode: ( AnotherNodeWithChildMapper ) | ( AnotherNodeWithAllMapper );
        WithChild: ( AnotherNodeWithChildMapper ) | ( AnotherNodeWithAllMapper );
        WithChildren: ( AnotherNodeWithAllMapper );
      };
    `);
    expect(result.content).toBeSimilarStringTo(`
    export type ResolversTypes = {
      MyType: ResolverTypeWrapper<MyTypeDb>;
      String: ResolverTypeWrapper<Scalars['String']['output']>;
      Child: ResolverTypeWrapper<Omit<Child, 'parent'> & { parent?: Maybe<ResolversTypes['MyType']> }>;
      MyOtherType: ResolverTypeWrapper<CustomMyOtherType>;
      ChildUnion: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['ChildUnion']>;
      Query: ResolverTypeWrapper<Record<PropertyKey, never>>;
      Subscription: ResolverTypeWrapper<Record<PropertyKey, never>>;
      Node: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['Node']>;
      ID: ResolverTypeWrapper<Scalars['ID']['output']>;
      SomeNode: ResolverTypeWrapper<SomeNode>;
      AnotherNode: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['AnotherNode']>;
      WithChild: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['WithChild']>;
      WithChildren: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['WithChildren']>;
      AnotherNodeWithChild: ResolverTypeWrapper<AnotherNodeWithChildMapper>;
      AnotherNodeWithAll: ResolverTypeWrapper<AnotherNodeWithAllMapper>;
      MyUnion: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['MyUnion']>;
      MyScalar: ResolverTypeWrapper<Scalars['MyScalar']['output']>;
      Int: ResolverTypeWrapper<Scalars['Int']['output']>;
      Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
    };`);
    expect(result.content).toBeSimilarStringTo(`
      export type ResolversParentTypes = {
        MyType: MyTypeDb;
        String: Scalars['String']['output'];
        Child: Omit<Child, 'parent'> & { parent?: Maybe<ResolversParentTypes['MyType']> };
        MyOtherType: CustomMyOtherType;
        ChildUnion: ResolversUnionTypes<ResolversParentTypes>['ChildUnion'];
        Query: Record<PropertyKey, never>;
        Subscription: Record<PropertyKey, never>;
        Node: ResolversInterfaceTypes<ResolversParentTypes>['Node'];
        ID: Scalars['ID']['output'];
        SomeNode: SomeNode;
        AnotherNode: ResolversInterfaceTypes<ResolversParentTypes>['AnotherNode'];
        WithChild: ResolversInterfaceTypes<ResolversParentTypes>['WithChild'];
        WithChildren: ResolversInterfaceTypes<ResolversParentTypes>['WithChildren'];
        AnotherNodeWithChild: AnotherNodeWithChildMapper;
        AnotherNodeWithAll: AnotherNodeWithAllMapper;
        MyUnion: ResolversUnionTypes<ResolversParentTypes>['MyUnion'];
        MyScalar: Scalars['MyScalar']['output'];
        Int: Scalars['Int']['output'];
        Boolean: Scalars['Boolean']['output'];
      };
    `);
  });

  it('Should handle {T} in a mapper', async () => {
    const result = (await plugin(
      resolversTestingSchema,
      [],
      {
        noSchemaStitching: true,
        mappers: {
          MyType: 'Partial<{T}>',
          AnotherNodeWithChild: 'ExtraPartial<{T}>',
        },
      },
      { outputFile: '' }
    )) as Types.ComplexPluginOutput;

    expect(result.content).toBeSimilarStringTo(`
      export type ResolversUnionTypes<_RefType extends Record<string, unknown>> = {
        ChildUnion: ( Omit<Child, 'parent'> & { parent?: Maybe<_RefType['MyType']> } ) | ( MyOtherType );
        MyUnion: ( Partial<Omit<MyType, 'unionChild'> & { unionChild?: Maybe<_RefType['ChildUnion']> }> ) | ( MyOtherType );
      };
    `);
    expect(result.content).toBeSimilarStringTo(`
      export type ResolversInterfaceTypes<_RefType extends Record<string, unknown>> = {
        Node: ( SomeNode );
        AnotherNode: ( ExtraPartial<Omit<AnotherNodeWithChild, 'unionChild' | 'interfaceChild'> & { unionChild?: Maybe<_RefType['ChildUnion']>, interfaceChild?: Maybe<_RefType['Node']> }> ) | ( Omit<AnotherNodeWithAll, 'unionChild' | 'unionChildren' | 'interfaceChild' | 'interfaceChildren'> & { unionChild?: Maybe<_RefType['ChildUnion']>, unionChildren: Array<_RefType['ChildUnion']>, interfaceChild?: Maybe<_RefType['Node']>, interfaceChildren: Array<_RefType['Node']> } );
        WithChild: ( ExtraPartial<Omit<AnotherNodeWithChild, 'unionChild' | 'interfaceChild'> & { unionChild?: Maybe<_RefType['ChildUnion']>, interfaceChild?: Maybe<_RefType['Node']> }> ) | ( Omit<AnotherNodeWithAll, 'unionChild' | 'unionChildren' | 'interfaceChild' | 'interfaceChildren'> & { unionChild?: Maybe<_RefType['ChildUnion']>, unionChildren: Array<_RefType['ChildUnion']>, interfaceChild?: Maybe<_RefType['Node']>, interfaceChildren: Array<_RefType['Node']> } );
        WithChildren: ( Omit<AnotherNodeWithAll, 'unionChild' | 'unionChildren' | 'interfaceChild' | 'interfaceChildren'> & { unionChild?: Maybe<_RefType['ChildUnion']>, unionChildren: Array<_RefType['ChildUnion']>, interfaceChild?: Maybe<_RefType['Node']>, interfaceChildren: Array<_RefType['Node']> } );
      };
    `);
    expect(result.content).toBeSimilarStringTo(`
      export type ResolversTypes = {
        MyType: ResolverTypeWrapper<Partial<Omit<MyType, 'unionChild'> & { unionChild?: Maybe<ResolversTypes['ChildUnion']> }>>;
        String: ResolverTypeWrapper<Scalars['String']['output']>;
        Child: ResolverTypeWrapper<Omit<Child, 'parent'> & { parent?: Maybe<ResolversTypes['MyType']> }>;
        MyOtherType: ResolverTypeWrapper<MyOtherType>;
        ChildUnion: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['ChildUnion']>;
        Query: ResolverTypeWrapper<Record<PropertyKey, never>>;
        Subscription: ResolverTypeWrapper<Record<PropertyKey, never>>;
        Node: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['Node']>;
        ID: ResolverTypeWrapper<Scalars['ID']['output']>;
        SomeNode: ResolverTypeWrapper<SomeNode>;
        AnotherNode: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['AnotherNode']>;
        WithChild: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['WithChild']>;
        WithChildren: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['WithChildren']>;
        AnotherNodeWithChild: ResolverTypeWrapper<ExtraPartial<Omit<AnotherNodeWithChild, 'unionChild' | 'interfaceChild'> & { unionChild?: Maybe<ResolversTypes['ChildUnion']>, interfaceChild?: Maybe<ResolversTypes['Node']> }>>;
        AnotherNodeWithAll: ResolverTypeWrapper<Omit<AnotherNodeWithAll, 'unionChild' | 'unionChildren' | 'interfaceChild' | 'interfaceChildren'> & { unionChild?: Maybe<ResolversTypes['ChildUnion']>, unionChildren: Array<ResolversTypes['ChildUnion']>, interfaceChild?: Maybe<ResolversTypes['Node']>, interfaceChildren: Array<ResolversTypes['Node']> }>;
        MyUnion: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['MyUnion']>;
        MyScalar: ResolverTypeWrapper<Scalars['MyScalar']['output']>;
        Int: ResolverTypeWrapper<Scalars['Int']['output']>;
        Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type ResolversParentTypes = {
        MyType: Partial<Omit<MyType, 'unionChild'> & { unionChild?: Maybe<ResolversParentTypes['ChildUnion']> }>;
        String: Scalars['String']['output'];
        Child: Omit<Child, 'parent'> & { parent?: Maybe<ResolversParentTypes['MyType']> };
        MyOtherType: MyOtherType;
        ChildUnion: ResolversUnionTypes<ResolversParentTypes>['ChildUnion'];
        Query: Record<PropertyKey, never>;
        Subscription: Record<PropertyKey, never>;
        Node: ResolversInterfaceTypes<ResolversParentTypes>['Node'];
        ID: Scalars['ID']['output'];
        SomeNode: SomeNode;
        AnotherNode: ResolversInterfaceTypes<ResolversParentTypes>['AnotherNode'];
        WithChild: ResolversInterfaceTypes<ResolversParentTypes>['WithChild'];
        WithChildren: ResolversInterfaceTypes<ResolversParentTypes>['WithChildren'];
        AnotherNodeWithChild: ExtraPartial<Omit<AnotherNodeWithChild, 'unionChild' | 'interfaceChild'> & { unionChild?: Maybe<ResolversParentTypes['ChildUnion']>, interfaceChild?: Maybe<ResolversParentTypes['Node']> }>;
        AnotherNodeWithAll: Omit<AnotherNodeWithAll, 'unionChild' | 'unionChildren' | 'interfaceChild' | 'interfaceChildren'> & { unionChild?: Maybe<ResolversParentTypes['ChildUnion']>, unionChildren: Array<ResolversParentTypes['ChildUnion']>, interfaceChild?: Maybe<ResolversParentTypes['Node']>, interfaceChildren: Array<ResolversParentTypes['Node']> };
        MyUnion: ResolversUnionTypes<ResolversParentTypes>['MyUnion'];
        MyScalar: Scalars['MyScalar']['output'];
        Int: Scalars['Int']['output'];
        Boolean: Scalars['Boolean']['output'];
      };
    `);
  });

  it('should warn about unused mappers by default', async () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
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
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
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
      arg: Scalars['Int']['input'];
      arg2: Scalars['String']['input'];
      arg3: Scalars['Boolean']['input'];
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
      arg: Scalars['Int']['input'];
      arg2: Scalars['String']['input'];
      arg3: Scalars['Boolean']['input'];
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
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
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
      arg: Scalars['Int']['input'];
      arg2: Scalars['String']['input'];
      arg3: Scalars['Boolean']['input'];
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
      export type ResolversUnionTypes<_RefType extends Record<string, unknown>> = {
        ChildUnion: ( Omit<Child, 'parent'> & { parent?: Maybe<_RefType['MyType']> } ) | ( MyOtherTypeCustom );
        MyUnion: ( Omit<MyType, 'otherType' | 'unionChild'> & { otherType?: Maybe<_RefType['MyOtherType']>, unionChild?: Maybe<_RefType['ChildUnion']> } ) | ( MyOtherTypeCustom );
      };
    `);
    expect(result.content).toBeSimilarStringTo(`
      export type ResolversInterfaceTypes<_RefType extends Record<string, unknown>> = {
        Node: ( SomeNode );
        AnotherNode: ( Omit<AnotherNodeWithChild, 'unionChild' | 'interfaceChild'> & { unionChild?: Maybe<_RefType['ChildUnion']>, interfaceChild?: Maybe<_RefType['Node']> } ) | ( Omit<AnotherNodeWithAll, 'unionChild' | 'unionChildren' | 'interfaceChild' | 'interfaceChildren'> & { unionChild?: Maybe<_RefType['ChildUnion']>, unionChildren: Array<_RefType['ChildUnion']>, interfaceChild?: Maybe<_RefType['Node']>, interfaceChildren: Array<_RefType['Node']> } );
        WithChild: ( Omit<AnotherNodeWithChild, 'unionChild' | 'interfaceChild'> & { unionChild?: Maybe<_RefType['ChildUnion']>, interfaceChild?: Maybe<_RefType['Node']> } ) | ( Omit<AnotherNodeWithAll, 'unionChild' | 'unionChildren' | 'interfaceChild' | 'interfaceChildren'> & { unionChild?: Maybe<_RefType['ChildUnion']>, unionChildren: Array<_RefType['ChildUnion']>, interfaceChild?: Maybe<_RefType['Node']>, interfaceChildren: Array<_RefType['Node']> } );
        WithChildren: ( Omit<AnotherNodeWithAll, 'unionChild' | 'unionChildren' | 'interfaceChild' | 'interfaceChildren'> & { unionChild?: Maybe<_RefType['ChildUnion']>, unionChildren: Array<_RefType['ChildUnion']>, interfaceChild?: Maybe<_RefType['Node']>, interfaceChildren: Array<_RefType['Node']> } );
      };
    `);
    expect(result.content).toBeSimilarStringTo(`
    export type ResolversTypes = {
      MyType: ResolverTypeWrapper<Omit<MyType, 'otherType' | 'unionChild'> & { otherType?: Maybe<ResolversTypes['MyOtherType']>, unionChild?: Maybe<ResolversTypes['ChildUnion']> }>;
      String: ResolverTypeWrapper<Scalars['String']['output']>;
      Child: ResolverTypeWrapper<Omit<Child, 'parent'> & { parent?: Maybe<ResolversTypes['MyType']> }>;
      MyOtherType: ResolverTypeWrapper<MyOtherTypeCustom>;
      ChildUnion: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['ChildUnion']>;
      Query: ResolverTypeWrapper<Record<PropertyKey, never>>;
      Subscription: ResolverTypeWrapper<Record<PropertyKey, never>>;
      Node: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['Node']>;
      ID: ResolverTypeWrapper<Scalars['ID']['output']>;
      SomeNode: ResolverTypeWrapper<SomeNode>;
      AnotherNode: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['AnotherNode']>;
      WithChild: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['WithChild']>;
      WithChildren: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['WithChildren']>;
      AnotherNodeWithChild: ResolverTypeWrapper<Omit<AnotherNodeWithChild, 'unionChild' | 'interfaceChild'> & { unionChild?: Maybe<ResolversTypes['ChildUnion']>, interfaceChild?: Maybe<ResolversTypes['Node']> }>;
      AnotherNodeWithAll: ResolverTypeWrapper<Omit<AnotherNodeWithAll, 'unionChild' | 'unionChildren' | 'interfaceChild' | 'interfaceChildren'> & { unionChild?: Maybe<ResolversTypes['ChildUnion']>, unionChildren: Array<ResolversTypes['ChildUnion']>, interfaceChild?: Maybe<ResolversTypes['Node']>, interfaceChildren: Array<ResolversTypes['Node']> }>;
      MyUnion: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['MyUnion']>;
      MyScalar: ResolverTypeWrapper<Scalars['MyScalar']['output']>;
      Int: ResolverTypeWrapper<Scalars['Int']['output']>;
      Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
    };`);
    expect(result.content).toBeSimilarStringTo(`
      export type ResolversParentTypes = {
        MyType: Omit<MyType, 'otherType' | 'unionChild'> & { otherType?: Maybe<ResolversParentTypes['MyOtherType']>, unionChild?: Maybe<ResolversParentTypes['ChildUnion']> };
        String: Scalars['String']['output'];
        Child: Omit<Child, 'parent'> & { parent?: Maybe<ResolversParentTypes['MyType']> };
        MyOtherType: MyOtherTypeCustom;
        ChildUnion: ResolversUnionTypes<ResolversParentTypes>['ChildUnion'];
        Query: Record<PropertyKey, never>;
        Subscription: Record<PropertyKey, never>;
        Node: ResolversInterfaceTypes<ResolversParentTypes>['Node'];
        ID: Scalars['ID']['output'];
        SomeNode: SomeNode;
        AnotherNode: ResolversInterfaceTypes<ResolversParentTypes>['AnotherNode'];
        WithChild: ResolversInterfaceTypes<ResolversParentTypes>['WithChild'];
        WithChildren: ResolversInterfaceTypes<ResolversParentTypes>['WithChildren'];
        AnotherNodeWithChild: Omit<AnotherNodeWithChild, 'unionChild' | 'interfaceChild'> & { unionChild?: Maybe<ResolversParentTypes['ChildUnion']>, interfaceChild?: Maybe<ResolversParentTypes['Node']> };
        AnotherNodeWithAll: Omit<AnotherNodeWithAll, 'unionChild' | 'unionChildren' | 'interfaceChild' | 'interfaceChildren'> & { unionChild?: Maybe<ResolversParentTypes['ChildUnion']>, unionChildren: Array<ResolversParentTypes['ChildUnion']>, interfaceChild?: Maybe<ResolversParentTypes['Node']>, interfaceChildren: Array<ResolversParentTypes['Node']> };
        MyUnion: ResolversUnionTypes<ResolversParentTypes>['MyUnion'];
        MyScalar: Scalars['MyScalar']['output'];
        Int: Scalars['Int']['output'];
        Boolean: Scalars['Boolean']['output'];
      };
    `);
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
      export type ResolversUnionTypes<_RefType extends Record<string, unknown>> = {
        ChildUnion: ( Omit<Child, 'parent'> & { parent?: Maybe<_RefType['MyType']> } ) | ( MyOtherTypeCustom );
        MyUnion: ( MyTypeCustom ) | ( MyOtherTypeCustom );
      };
    `);
    expect(result.content).toBeSimilarStringTo(`
      export type ResolversInterfaceTypes<_RefType extends Record<string, unknown>> = {
        Node: ( SomeNode );
        AnotherNode: ( Omit<AnotherNodeWithChild, 'unionChild' | 'interfaceChild'> & { unionChild?: Maybe<_RefType['ChildUnion']>, interfaceChild?: Maybe<_RefType['Node']> } ) | ( Omit<AnotherNodeWithAll, 'unionChild' | 'unionChildren' | 'interfaceChild' | 'interfaceChildren'> & { unionChild?: Maybe<_RefType['ChildUnion']>, unionChildren: Array<_RefType['ChildUnion']>, interfaceChild?: Maybe<_RefType['Node']>, interfaceChildren: Array<_RefType['Node']> } );
        WithChild: ( Omit<AnotherNodeWithChild, 'unionChild' | 'interfaceChild'> & { unionChild?: Maybe<_RefType['ChildUnion']>, interfaceChild?: Maybe<_RefType['Node']> } ) | ( Omit<AnotherNodeWithAll, 'unionChild' | 'unionChildren' | 'interfaceChild' | 'interfaceChildren'> & { unionChild?: Maybe<_RefType['ChildUnion']>, unionChildren: Array<_RefType['ChildUnion']>, interfaceChild?: Maybe<_RefType['Node']>, interfaceChildren: Array<_RefType['Node']> } );
        WithChildren: ( Omit<AnotherNodeWithAll, 'unionChild' | 'unionChildren' | 'interfaceChild' | 'interfaceChildren'> & { unionChild?: Maybe<_RefType['ChildUnion']>, unionChildren: Array<_RefType['ChildUnion']>, interfaceChild?: Maybe<_RefType['Node']>, interfaceChildren: Array<_RefType['Node']> } );
      };
    `);
    expect(result.content).toBeSimilarStringTo(`
    export type ResolversTypes = {
      MyType: ResolverTypeWrapper<MyTypeCustom>;
      String: ResolverTypeWrapper<Scalars['String']['output']>;
      Child: ResolverTypeWrapper<Omit<Child, 'parent'> & { parent?: Maybe<ResolversTypes['MyType']> }>;
      MyOtherType: ResolverTypeWrapper<MyOtherTypeCustom>;
      ChildUnion: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['ChildUnion']>;
      Query: ResolverTypeWrapper<Record<PropertyKey, never>>;
      Subscription: ResolverTypeWrapper<Record<PropertyKey, never>>;
      Node: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['Node']>;
      ID: ResolverTypeWrapper<Scalars['ID']['output']>;
      SomeNode: ResolverTypeWrapper<SomeNode>;
      AnotherNode: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['AnotherNode']>;
      WithChild: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['WithChild']>;
      WithChildren: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['WithChildren']>;
      AnotherNodeWithChild: ResolverTypeWrapper<Omit<AnotherNodeWithChild, 'unionChild' | 'interfaceChild'> & { unionChild?: Maybe<ResolversTypes['ChildUnion']>, interfaceChild?: Maybe<ResolversTypes['Node']> }>;
      AnotherNodeWithAll: ResolverTypeWrapper<Omit<AnotherNodeWithAll, 'unionChild' | 'unionChildren' | 'interfaceChild' | 'interfaceChildren'> & { unionChild?: Maybe<ResolversTypes['ChildUnion']>, unionChildren: Array<ResolversTypes['ChildUnion']>, interfaceChild?: Maybe<ResolversTypes['Node']>, interfaceChildren: Array<ResolversTypes['Node']> }>;
      MyUnion: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['MyUnion']>;
      MyScalar: ResolverTypeWrapper<Scalars['MyScalar']['output']>;
      Int: ResolverTypeWrapper<Scalars['Int']['output']>;
      Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
    };`);
    expect(result.content).toBeSimilarStringTo(`
      export type ResolversParentTypes = {
        MyType: MyTypeCustom;
        String: Scalars['String']['output'];
        Child: Omit<Child, 'parent'> & { parent?: Maybe<ResolversParentTypes['MyType']> };
        MyOtherType: MyOtherTypeCustom;
        ChildUnion: ResolversUnionTypes<ResolversParentTypes>['ChildUnion'];
        Query: Record<PropertyKey, never>;
        Subscription: Record<PropertyKey, never>;
        Node: ResolversInterfaceTypes<ResolversParentTypes>['Node'];
        ID: Scalars['ID']['output'];
        SomeNode: SomeNode;
        AnotherNode: ResolversInterfaceTypes<ResolversParentTypes>['AnotherNode'];
        WithChild: ResolversInterfaceTypes<ResolversParentTypes>['WithChild'];
        WithChildren: ResolversInterfaceTypes<ResolversParentTypes>['WithChildren'];
        AnotherNodeWithChild: Omit<AnotherNodeWithChild, 'unionChild' | 'interfaceChild'> & { unionChild?: Maybe<ResolversParentTypes['ChildUnion']>, interfaceChild?: Maybe<ResolversParentTypes['Node']> };
        AnotherNodeWithAll: Omit<AnotherNodeWithAll, 'unionChild' | 'unionChildren' | 'interfaceChild' | 'interfaceChildren'> & { unionChild?: Maybe<ResolversParentTypes['ChildUnion']>, unionChildren: Array<ResolversParentTypes['ChildUnion']>, interfaceChild?: Maybe<ResolversParentTypes['Node']>, interfaceChildren: Array<ResolversParentTypes['Node']> };
        MyUnion: ResolversUnionTypes<ResolversParentTypes>['MyUnion'];
        MyScalar: Scalars['MyScalar']['output'];
        Int: Scalars['Int']['output'];
        Boolean: Scalars['Boolean']['output'];
      };
    `);
    await resolversTestingValidate(mergeOutputs([result, `type MyTypeCustom = {}; type MyOtherTypeCustom = {};`]));
  });

  it('should support namespaces', async () => {
    const result = (await plugin(
      resolversTestingSchema,
      [],
      {
        noSchemaStitching: true,
        mappers: {
          MyOtherType: './my-file#MyNamespace#MyCustomOtherType',
          AnotherNodeWithChild: './my-interface#InterfaceNamespace#AnotherNodeWithChildMapper',
        },
      },
      { outputFile: '' }
    )) as Types.ComplexPluginOutput;

    expect(result.prepend).toContain(`import { MyNamespace } from './my-file';`);
    expect(result.prepend).toContain(`import { InterfaceNamespace } from './my-interface';`);
    expect(result.content).toBeSimilarStringTo(`
      export type ResolversUnionTypes<_RefType extends Record<string, unknown>> = {
        ChildUnion: ( Omit<Child, 'parent'> & { parent?: Maybe<_RefType['MyType']> } ) | ( MyNamespace.MyCustomOtherType );
        MyUnion: ( Omit<MyType, 'otherType' | 'unionChild'> & { otherType?: Maybe<_RefType['MyOtherType']>, unionChild?: Maybe<_RefType['ChildUnion']> } ) | ( MyNamespace.MyCustomOtherType );
      };
    `);
    expect(result.content).toBeSimilarStringTo(`
      export type ResolversInterfaceTypes<_RefType extends Record<string, unknown>> = {
        Node: ( SomeNode );
        AnotherNode: ( InterfaceNamespace.AnotherNodeWithChildMapper ) | ( Omit<AnotherNodeWithAll, 'unionChild' | 'unionChildren' | 'interfaceChild' | 'interfaceChildren'> & { unionChild?: Maybe<_RefType['ChildUnion']>, unionChildren: Array<_RefType['ChildUnion']>, interfaceChild?: Maybe<_RefType['Node']>, interfaceChildren: Array<_RefType['Node']> } );
        WithChild: ( InterfaceNamespace.AnotherNodeWithChildMapper ) | ( Omit<AnotherNodeWithAll, 'unionChild' | 'unionChildren' | 'interfaceChild' | 'interfaceChildren'> & { unionChild?: Maybe<_RefType['ChildUnion']>, unionChildren: Array<_RefType['ChildUnion']>, interfaceChild?: Maybe<_RefType['Node']>, interfaceChildren: Array<_RefType['Node']> } );
        WithChildren: ( Omit<AnotherNodeWithAll, 'unionChild' | 'unionChildren' | 'interfaceChild' | 'interfaceChildren'> & { unionChild?: Maybe<_RefType['ChildUnion']>, unionChildren: Array<_RefType['ChildUnion']>, interfaceChild?: Maybe<_RefType['Node']>, interfaceChildren: Array<_RefType['Node']> } );
      };
    `);
    expect(result.content).toBeSimilarStringTo(`
      export type ResolversTypes = {
        MyType: ResolverTypeWrapper<Omit<MyType, 'otherType' | 'unionChild'> & { otherType?: Maybe<ResolversTypes['MyOtherType']>, unionChild?: Maybe<ResolversTypes['ChildUnion']> }>;
        String: ResolverTypeWrapper<Scalars['String']['output']>;
        Child: ResolverTypeWrapper<Omit<Child, 'parent'> & { parent?: Maybe<ResolversTypes['MyType']> }>;
        MyOtherType: ResolverTypeWrapper<MyNamespace.MyCustomOtherType>;
        ChildUnion: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['ChildUnion']>;
        Query: ResolverTypeWrapper<Record<PropertyKey, never>>;
        Subscription: ResolverTypeWrapper<Record<PropertyKey, never>>;
        Node: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['Node']>;
        ID: ResolverTypeWrapper<Scalars['ID']['output']>;
        SomeNode: ResolverTypeWrapper<SomeNode>;
        AnotherNode: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['AnotherNode']>;
        WithChild: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['WithChild']>;
        WithChildren: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['WithChildren']>;
        AnotherNodeWithChild: ResolverTypeWrapper<InterfaceNamespace.AnotherNodeWithChildMapper>;
        AnotherNodeWithAll: ResolverTypeWrapper<Omit<AnotherNodeWithAll, 'unionChild' | 'unionChildren' | 'interfaceChild' | 'interfaceChildren'> & { unionChild?: Maybe<ResolversTypes['ChildUnion']>, unionChildren: Array<ResolversTypes['ChildUnion']>, interfaceChild?: Maybe<ResolversTypes['Node']>, interfaceChildren: Array<ResolversTypes['Node']> }>;
        MyUnion: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['MyUnion']>;
        MyScalar: ResolverTypeWrapper<Scalars['MyScalar']['output']>;
        Int: ResolverTypeWrapper<Scalars['Int']['output']>;
        Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
    export type ResolversParentTypes = {
      MyType: Omit<MyType, 'otherType' | 'unionChild'> & { otherType?: Maybe<ResolversParentTypes['MyOtherType']>, unionChild?: Maybe<ResolversParentTypes['ChildUnion']> };
      String: Scalars['String']['output'];
      Child: Omit<Child, 'parent'> & { parent?: Maybe<ResolversParentTypes['MyType']> };
      MyOtherType: MyNamespace.MyCustomOtherType;
      ChildUnion: ResolversUnionTypes<ResolversParentTypes>['ChildUnion'];
      Query: Record<PropertyKey, never>;
      Subscription: Record<PropertyKey, never>;
      Node: ResolversInterfaceTypes<ResolversParentTypes>['Node'];
      ID: Scalars['ID']['output'];
      SomeNode: SomeNode;
      AnotherNode: ResolversInterfaceTypes<ResolversParentTypes>['AnotherNode'];
      WithChild: ResolversInterfaceTypes<ResolversParentTypes>['WithChild'];
      WithChildren: ResolversInterfaceTypes<ResolversParentTypes>['WithChildren'];
      AnotherNodeWithChild: InterfaceNamespace.AnotherNodeWithChildMapper;
      AnotherNodeWithAll: Omit<AnotherNodeWithAll, 'unionChild' | 'unionChildren' | 'interfaceChild' | 'interfaceChildren'> & { unionChild?: Maybe<ResolversParentTypes['ChildUnion']>, unionChildren: Array<ResolversParentTypes['ChildUnion']>, interfaceChild?: Maybe<ResolversParentTypes['Node']>, interfaceChildren: Array<ResolversParentTypes['Node']> };
      MyUnion: ResolversUnionTypes<ResolversParentTypes>['MyUnion'];
      MyScalar: Scalars['MyScalar']['output'];
      Int: Scalars['Int']['output'];
      Boolean: Scalars['Boolean']['output'];
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
    expect(result.content).not.toBeSimilarStringTo(`export type ResolversUnionTypes`);
    expect(result.content).not.toBeSimilarStringTo(`export type ResolversParentUnionTypes`);
    expect(result.content).not.toBeSimilarStringTo(`export type ResolversInterfaceTypes`);
    expect(result.content).toBeSimilarStringTo(`
      export type ResolversTypes = {
        MyType: ResolverTypeWrapper<MyNamespace.MyDefaultMapper>;
        String: ResolverTypeWrapper<MyNamespace.MyDefaultMapper>;
        Child: ResolverTypeWrapper<MyNamespace.MyDefaultMapper>;
        MyOtherType: ResolverTypeWrapper<MyNamespace.MyDefaultMapper>;
        ChildUnion: ResolverTypeWrapper<MyNamespace.MyDefaultMapper>;
        Query: ResolverTypeWrapper<Record<PropertyKey, never>>;
        Subscription: ResolverTypeWrapper<Record<PropertyKey, never>>;
        Node: ResolverTypeWrapper<MyNamespace.MyDefaultMapper>;
        ID: ResolverTypeWrapper<MyNamespace.MyDefaultMapper>;
        SomeNode: ResolverTypeWrapper<MyNamespace.MyDefaultMapper>;
        AnotherNode: ResolverTypeWrapper<MyNamespace.MyDefaultMapper>;
        WithChild: ResolverTypeWrapper<MyNamespace.MyDefaultMapper>;
        WithChildren: ResolverTypeWrapper<MyNamespace.MyDefaultMapper>;
        AnotherNodeWithChild: ResolverTypeWrapper<MyNamespace.MyDefaultMapper>;
        AnotherNodeWithAll: ResolverTypeWrapper<MyNamespace.MyDefaultMapper>;
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
        Query: Record<PropertyKey, never>;
        Subscription: Record<PropertyKey, never>;
        Node: MyNamespace.MyDefaultMapper;
        ID: MyNamespace.MyDefaultMapper;
        SomeNode: MyNamespace.MyDefaultMapper;
        AnotherNode: MyNamespace.MyDefaultMapper;
        WithChild: MyNamespace.MyDefaultMapper;
        WithChildren: MyNamespace.MyDefaultMapper;
        AnotherNodeWithChild: MyNamespace.MyDefaultMapper;
        AnotherNodeWithAll: MyNamespace.MyDefaultMapper;
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
      export type ResolversUnionTypes<_RefType extends Record<string, unknown>> = {
        ChildUnion: ( Omit<Child, 'parent'> & { parent?: Maybe<_RefType['MyType']> } ) | ( MyOtherType );
        MyUnion: ( Omit<MyType, 'unionChild'> & { unionChild?: Maybe<_RefType['ChildUnion']> } ) | ( MyOtherType );
      };
    `);
    expect(result.content).toBeSimilarStringTo(`
      export type ResolversInterfaceTypes<_RefType extends Record<string, unknown>> = {
        Node: ( SomeNode );
        AnotherNode: ( Omit<AnotherNodeWithChild, 'unionChild' | 'interfaceChild'> & { unionChild?: Maybe<_RefType['ChildUnion']>, interfaceChild?: Maybe<_RefType['Node']> } ) | ( Omit<AnotherNodeWithAll, 'unionChild' | 'unionChildren' | 'interfaceChild' | 'interfaceChildren'> & { unionChild?: Maybe<_RefType['ChildUnion']>, unionChildren: Array<_RefType['ChildUnion']>, interfaceChild?: Maybe<_RefType['Node']>, interfaceChildren: Array<_RefType['Node']> } );
        WithChild: ( Omit<AnotherNodeWithChild, 'unionChild' | 'interfaceChild'> & { unionChild?: Maybe<_RefType['ChildUnion']>, interfaceChild?: Maybe<_RefType['Node']> } ) | ( Omit<AnotherNodeWithAll, 'unionChild' | 'unionChildren' | 'interfaceChild' | 'interfaceChildren'> & { unionChild?: Maybe<_RefType['ChildUnion']>, unionChildren: Array<_RefType['ChildUnion']>, interfaceChild?: Maybe<_RefType['Node']>, interfaceChildren: Array<_RefType['Node']> } );
        WithChildren: ( Omit<AnotherNodeWithAll, 'unionChild' | 'unionChildren' | 'interfaceChild' | 'interfaceChildren'> & { unionChild?: Maybe<_RefType['ChildUnion']>, unionChildren: Array<_RefType['ChildUnion']>, interfaceChild?: Maybe<_RefType['Node']>, interfaceChildren: Array<_RefType['Node']> } );
      };
    `);
    expect(result.content).toBeSimilarStringTo(`
      export type ResolversTypes = {
        MyType: ResolverTypeWrapper<Omit<MyType, 'unionChild'> & { unionChild?: Maybe<ResolversTypes['ChildUnion']> }>;
        String: ResolverTypeWrapper<Scalars['String']['output']>;
        Child: ResolverTypeWrapper<Omit<Child, 'parent'> & { parent?: Maybe<ResolversTypes['MyType']> }>;
        MyOtherType: ResolverTypeWrapper<MyOtherType>;
        ChildUnion: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['ChildUnion']>;
        Query: ResolverTypeWrapper<MyNamespace.MyRootType>;
        Subscription: ResolverTypeWrapper<MyNamespace.MyRootType>;
        Node: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['Node']>;
        ID: ResolverTypeWrapper<Scalars['ID']['output']>;
        SomeNode: ResolverTypeWrapper<SomeNode>;
        AnotherNode: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['AnotherNode']>;
        WithChild: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['WithChild']>;
        WithChildren: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['WithChildren']>;
        AnotherNodeWithChild: ResolverTypeWrapper<Omit<AnotherNodeWithChild, 'unionChild' | 'interfaceChild'> & { unionChild?: Maybe<ResolversTypes['ChildUnion']>, interfaceChild?: Maybe<ResolversTypes['Node']> }>;
        AnotherNodeWithAll: ResolverTypeWrapper<Omit<AnotherNodeWithAll, 'unionChild' | 'unionChildren' | 'interfaceChild' | 'interfaceChildren'> & { unionChild?: Maybe<ResolversTypes['ChildUnion']>, unionChildren: Array<ResolversTypes['ChildUnion']>, interfaceChild?: Maybe<ResolversTypes['Node']>, interfaceChildren: Array<ResolversTypes['Node']> }>;
        MyUnion: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['MyUnion']>;
        MyScalar: ResolverTypeWrapper<Scalars['MyScalar']['output']>;
        Int: ResolverTypeWrapper<Scalars['Int']['output']>;
        Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
    export type ResolversParentTypes = {
      MyType: Omit<MyType, 'unionChild'> & { unionChild?: Maybe<ResolversParentTypes['ChildUnion']> };
      String: Scalars['String']['output'];
      Child: Omit<Child, 'parent'> & { parent?: Maybe<ResolversParentTypes['MyType']> };
      MyOtherType: MyOtherType;
      ChildUnion: ResolversUnionTypes<ResolversParentTypes>['ChildUnion'];
      Query: MyNamespace.MyRootType;
      Subscription: MyNamespace.MyRootType;
      Node: ResolversInterfaceTypes<ResolversParentTypes>['Node'];
      ID: Scalars['ID']['output'];
      SomeNode: SomeNode;
      AnotherNode: ResolversInterfaceTypes<ResolversParentTypes>['AnotherNode'];
      WithChild: ResolversInterfaceTypes<ResolversParentTypes>['WithChild'];
      WithChildren: ResolversInterfaceTypes<ResolversParentTypes>['WithChildren'];
      AnotherNodeWithChild: Omit<AnotherNodeWithChild, 'unionChild' | 'interfaceChild'> & { unionChild?: Maybe<ResolversParentTypes['ChildUnion']>, interfaceChild?: Maybe<ResolversParentTypes['Node']> };
      AnotherNodeWithAll: Omit<AnotherNodeWithAll, 'unionChild' | 'unionChildren' | 'interfaceChild' | 'interfaceChildren'> & { unionChild?: Maybe<ResolversParentTypes['ChildUnion']>, unionChildren: Array<ResolversParentTypes['ChildUnion']>, interfaceChild?: Maybe<ResolversParentTypes['Node']>, interfaceChildren: Array<ResolversParentTypes['Node']> };
      MyUnion: ResolversUnionTypes<ResolversParentTypes>['MyUnion'];
      MyScalar: Scalars['MyScalar']['output'];
      Int: Scalars['Int']['output'];
      Boolean: Scalars['Boolean']['output'];
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
          AnotherNodeWithChild: './my-inteface#InterfaceNamespace#MyInterface<{T}>',
        },
      },
      { outputFile: '' }
    )) as Types.ComplexPluginOutput;

    expect(result.prepend).toContain(`import { MyNamespace } from './my-file';`);
    expect(result.content).toBeSimilarStringTo(`
      export type ResolversUnionTypes<_RefType extends Record<string, unknown>> = {
        ChildUnion: ( MyNamespace.MyDefaultMapper<Omit<Child, 'parent'> & { parent?: Maybe<_RefType['MyType']> }> ) | ( MyNamespace.MyDefaultMapper<MyOtherType> );
        MyUnion: ( MyNamespace.MyType<Omit<MyType, 'unionChild'> & { unionChild?: Maybe<_RefType['ChildUnion']> }> ) | ( MyNamespace.MyDefaultMapper<MyOtherType> );
      };
    `);
    expect(result.content).toBeSimilarStringTo(`
      export type ResolversInterfaceTypes<_RefType extends Record<string, unknown>> = {
        Node: ( MyNamespace.MyDefaultMapper<SomeNode> );
        AnotherNode: ( InterfaceNamespace.MyInterface<Omit<AnotherNodeWithChild, 'unionChild' | 'interfaceChild'> & { unionChild?: Maybe<_RefType['ChildUnion']>, interfaceChild?: Maybe<_RefType['Node']> }> ) | ( MyNamespace.MyDefaultMapper<Omit<AnotherNodeWithAll, 'unionChild' | 'unionChildren' | 'interfaceChild' | 'interfaceChildren'> & { unionChild?: Maybe<_RefType['ChildUnion']>, unionChildren: Array<_RefType['ChildUnion']>, interfaceChild?: Maybe<_RefType['Node']>, interfaceChildren: Array<_RefType['Node']> }> );
        WithChild: ( InterfaceNamespace.MyInterface<Omit<AnotherNodeWithChild, 'unionChild' | 'interfaceChild'> & { unionChild?: Maybe<_RefType['ChildUnion']>, interfaceChild?: Maybe<_RefType['Node']> }> ) | ( MyNamespace.MyDefaultMapper<Omit<AnotherNodeWithAll, 'unionChild' | 'unionChildren' | 'interfaceChild' | 'interfaceChildren'> & { unionChild?: Maybe<_RefType['ChildUnion']>, unionChildren: Array<_RefType['ChildUnion']>, interfaceChild?: Maybe<_RefType['Node']>, interfaceChildren: Array<_RefType['Node']> }> );
        WithChildren: ( MyNamespace.MyDefaultMapper<Omit<AnotherNodeWithAll, 'unionChild' | 'unionChildren' | 'interfaceChild' | 'interfaceChildren'> & { unionChild?: Maybe<_RefType['ChildUnion']>, unionChildren: Array<_RefType['ChildUnion']>, interfaceChild?: Maybe<_RefType['Node']>, interfaceChildren: Array<_RefType['Node']> }> );
      };
    `);
    expect(result.content).toBeSimilarStringTo(`
      export type ResolversTypes = {
        MyType: ResolverTypeWrapper<MyNamespace.MyType<Omit<MyType, 'unionChild'> & { unionChild?: Maybe<ResolversTypes['ChildUnion']> }>>;
        String: ResolverTypeWrapper<MyNamespace.MyDefaultMapper<Scalars['String']['output']>>;
        Child: ResolverTypeWrapper<MyNamespace.MyDefaultMapper<Omit<Child, 'parent'> & { parent?: Maybe<ResolversTypes['MyType']> }>>;
        MyOtherType: ResolverTypeWrapper<MyNamespace.MyDefaultMapper<MyOtherType>>;
        ChildUnion: MyNamespace.MyDefaultMapper<ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['ChildUnion']>>;
        Query: ResolverTypeWrapper<Record<PropertyKey, never>>;
        Subscription: ResolverTypeWrapper<Record<PropertyKey, never>>;
        Node: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['Node']>;
        ID: ResolverTypeWrapper<MyNamespace.MyDefaultMapper<Scalars['ID']['output']>>;
        SomeNode: ResolverTypeWrapper<MyNamespace.MyDefaultMapper<SomeNode>>;
        AnotherNode: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['AnotherNode']>;
        WithChild: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['WithChild']>;
        WithChildren: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['WithChildren']>;
        AnotherNodeWithChild: ResolverTypeWrapper<InterfaceNamespace.MyInterface<Omit<AnotherNodeWithChild, 'unionChild' | 'interfaceChild'> & { unionChild?: Maybe<ResolversTypes['ChildUnion']>, interfaceChild?: Maybe<ResolversTypes['Node']> }>>;
        AnotherNodeWithAll: ResolverTypeWrapper<MyNamespace.MyDefaultMapper<Omit<AnotherNodeWithAll, 'unionChild' | 'unionChildren' | 'interfaceChild' | 'interfaceChildren'> & { unionChild?: Maybe<ResolversTypes['ChildUnion']>, unionChildren: Array<ResolversTypes['ChildUnion']>, interfaceChild?: Maybe<ResolversTypes['Node']>, interfaceChildren: Array<ResolversTypes['Node']> }>>;
        MyUnion: MyNamespace.MyDefaultMapper<ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['MyUnion']>>;
        MyScalar: ResolverTypeWrapper<MyNamespace.MyDefaultMapper<Scalars['MyScalar']['output']>>;
        Int: ResolverTypeWrapper<MyNamespace.MyDefaultMapper<Scalars['Int']['output']>>;
        Boolean: ResolverTypeWrapper<MyNamespace.MyDefaultMapper<Scalars['Boolean']['output']>>;
      };
    `);
    expect(result.content).toBeSimilarStringTo(`
    export type ResolversParentTypes = {
      MyType: MyNamespace.MyType<Omit<MyType, 'unionChild'> & { unionChild?: Maybe<ResolversParentTypes['ChildUnion']> }>;
      String: MyNamespace.MyDefaultMapper<Scalars['String']['output']>;
      Child: MyNamespace.MyDefaultMapper<Omit<Child, 'parent'> & { parent?: Maybe<ResolversParentTypes['MyType']> }>;
      MyOtherType: MyNamespace.MyDefaultMapper<MyOtherType>;
      ChildUnion: MyNamespace.MyDefaultMapper<ResolversUnionTypes<ResolversParentTypes>['ChildUnion']>;
      Query: Record<PropertyKey, never>;
      Subscription: Record<PropertyKey, never>;
      Node: ResolversInterfaceTypes<ResolversParentTypes>['Node'];
      ID: MyNamespace.MyDefaultMapper<Scalars['ID']['output']>;
      SomeNode: MyNamespace.MyDefaultMapper<SomeNode>;
      AnotherNode: ResolversInterfaceTypes<ResolversParentTypes>['AnotherNode'];
      WithChild: ResolversInterfaceTypes<ResolversParentTypes>['WithChild'];
      WithChildren: ResolversInterfaceTypes<ResolversParentTypes>['WithChildren'];
      AnotherNodeWithChild: InterfaceNamespace.MyInterface<Omit<AnotherNodeWithChild, 'unionChild' | 'interfaceChild'> & { unionChild?: Maybe<ResolversParentTypes['ChildUnion']>, interfaceChild?: Maybe<ResolversParentTypes['Node']> }>;
      AnotherNodeWithAll: MyNamespace.MyDefaultMapper<Omit<AnotherNodeWithAll, 'unionChild' | 'unionChildren' | 'interfaceChild' | 'interfaceChildren'> & { unionChild?: Maybe<ResolversParentTypes['ChildUnion']>, unionChildren: Array<ResolversParentTypes['ChildUnion']>, interfaceChild?: Maybe<ResolversParentTypes['Node']>, interfaceChildren: Array<ResolversParentTypes['Node']> }>;
      MyUnion: MyNamespace.MyDefaultMapper<ResolversUnionTypes<ResolversParentTypes>['MyUnion']>;
      MyScalar: MyNamespace.MyDefaultMapper<Scalars['MyScalar']['output']>;
      Int: MyNamespace.MyDefaultMapper<Scalars['Int']['output']>;
      Boolean: MyNamespace.MyDefaultMapper<Scalars['Boolean']['output']>;
    };
    `);
  });
});
