import '@graphql-codegen/testing';
import { schema, validate } from './common';
import { plugin } from '../src';
import { buildSchema } from 'graphql';

describe('ResolversTypes', () => {
  it('Should build ResolversTypes object when there are no mappers', async () => {
    const result = await plugin(schema, [], {}, { outputFile: '' });

    expect(result).toBeSimilarStringTo(`
    export type ResolversTypes = {
      Query: Query,
      MyType: MyType,
      String: Scalars['String'],
      MyOtherType: MyOtherType,
      Subscription: Subscription,
      Boolean: Scalars['Boolean'],
      Node: Node,
      ID: Scalars['ID'],
      SomeNode: SomeNode,
      MyUnion: MyUnion,
      MyScalar: Scalars['MyScalar'],
      Int: Scalars['Int'],
    };`);
  });

  it('Should build ResolversTypes with simple mappers', async () => {
    const result = await plugin(
      schema,
      [],
      {
        mappers: {
          Query: 'MyQueryType',
          MyType: 'MyTypeDb',
          String: 'number',
        },
      },
      { outputFile: '' }
    );

    expect(result).toBeSimilarStringTo(`
    export type ResolversTypes = {
      Query: MyQueryType,
      MyType: MyTypeDb,
      String: number,
      MyOtherType: Omit<MyOtherType, 'bar'> & { bar: ResolversTypes['String'] },
      Subscription: Subscription,
      Boolean: Scalars['Boolean'],
      Node: Node,
      ID: Scalars['ID'],
      SomeNode: SomeNode,
      MyUnion: MyUnion,
      MyScalar: Scalars['MyScalar'],
      Int: Scalars['Int'],
    };`);
  });

  it('Should build ResolversTypes with defaultMapper set', async () => {
    const result = await plugin(
      schema,
      [],
      {
        mappers: {
          Query: 'MyQueryType',
          MyType: 'MyTypeDb',
          String: 'string',
        },
        defaultMapper: 'any',
      },
      { outputFile: '' }
    );

    expect(result).toBeSimilarStringTo(`
    export type ResolversTypes = {
      Query: MyQueryType,
      MyType: MyTypeDb,
      String: string,
      MyOtherType: any,
      Subscription: any,
      Boolean: any,
      Node: any,
      ID: any,
      SomeNode: any,
      MyUnion: any,
      MyScalar: any,
      Int: any,
    };`);
  });

  it('Should build ResolversTypes with external mappers', async () => {
    const result = await plugin(
      schema,
      [],
      {
        mappers: {
          Query: './my-module#CustomQueryRootType',
          MyType: 'MyTypeDb',
        },
      },
      { outputFile: '' }
    );

    expect(result).toBeSimilarStringTo(`
    export type ResolversTypes = {
      Query: CustomQueryRootType,
      MyType: MyTypeDb,
      String: Scalars['String'],
      MyOtherType: MyOtherType,
      Subscription: Subscription,
      Boolean: Scalars['Boolean'],
      Node: Node,
      ID: Scalars['ID'],
      SomeNode: SomeNode,
      MyUnion: MyUnion,
      MyScalar: Scalars['MyScalar'],
      Int: Scalars['Int'],
    };`);
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
    const result = await plugin(
      schema,
      [],
      {
        mappers: {
          MyOtherType: './my-file#MyCustomOtherType',
        },
      },
      { outputFile: '' }
    );

    expect(result).toBeSimilarStringTo(`import { MyCustomOtherType } from './my-file';`);
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
        }
      `);

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

  it('Should generate basic type resolvers with external mappers using same imported type', async () => {
    const result = await plugin(
      schema,
      [],
      {
        mappers: {
          MyType: './my-file#MyCustomOtherType',
          MyOtherType: './my-file#MyCustomOtherType',
        },
      },
      { outputFile: '' }
    );

    expect(result).toBeSimilarStringTo(`import { MyCustomOtherType } from './my-file';`);
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
        }
      `);

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

  it('Should generate the correct resolvers when used with mappers with interfaces', async () => {
    const result = await plugin(
      schema,
      [],
      {
        mappers: {
          Node: 'MyNodeType',
        },
      },
      { outputFile: '' }
    );

    expect(result).toBeSimilarStringTo(`
    export type MyDirectiveDirectiveResolver<Result, Parent, Context = any, Args = {   arg?: Maybe<Scalars['Int']>,
      arg2?: Maybe<Scalars['String']>, arg3?: Maybe<Scalars['Boolean']> }> = DirectiveResolverFn<Result, Parent, Context, Args>;`);

    expect(result).toBeSimilarStringTo(`
      export type MyOtherTypeResolvers<Context = any, ParentType = ResolversTypes['MyOtherType']> = {
        bar?: Resolver<ResolversTypes['String'], ParentType, Context>,
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export interface MyScalarScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['MyScalar'], any> {
        name: 'MyScalar'
      }
    `);

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
    await validate(`type MyNodeType = {};\n${result}`);
  });

  it('Should generate basic type resolvers with defaultMapper set to any', async () => {
    const result = await plugin(
      schema,
      [],
      {
        defaultMapper: 'any',
      },
      { outputFile: '' }
    );

    expect(result).toBeSimilarStringTo(`
    export type MyDirectiveDirectiveResolver<Result, Parent, Context = any, Args = {   arg?: Maybe<Scalars['Int']>,
      arg2?: Maybe<Scalars['String']>, arg3?: Maybe<Scalars['Boolean']> }> = DirectiveResolverFn<Result, Parent, Context, Args>;`);

    expect(result).toBeSimilarStringTo(`
      export type MyOtherTypeResolvers<Context = any, ParentType = ResolversTypes['MyOtherType']> = {
        bar?: Resolver<ResolversTypes['String'], ParentType, Context>,
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export interface MyScalarScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['MyScalar'], any> {
        name: 'MyScalar'
      }
    `);

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

  it('Should generate basic type resolvers with defaultMapper set to external identifier', async () => {
    const result = await plugin(
      schema,
      [],
      {
        defaultMapper: './my-file#MyBaseType',
      },
      { outputFile: '' }
    );

    expect(result).toContain(`import { MyBaseType } from './my-file';`);

    expect(result).toBeSimilarStringTo(`
    export type MyDirectiveDirectiveResolver<Result, Parent, Context = any, Args = {   arg?: Maybe<Scalars['Int']>,
      arg2?: Maybe<Scalars['String']>, arg3?: Maybe<Scalars['Boolean']> }> = DirectiveResolverFn<Result, Parent, Context, Args>;`);

    expect(result).toBeSimilarStringTo(`
      export type MyOtherTypeResolvers<Context = any, ParentType = ResolversTypes['MyOtherType']> = {
        bar?: Resolver<ResolversTypes['String'], ParentType, Context>,
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export interface MyScalarScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['MyScalar'], any> {
        name: 'MyScalar'
      }
    `);

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

  it('Should replace using Omit when non-mapped type is pointing to mapped type', async () => {
    const result = await plugin(
      schema,
      [],
      {
        mappers: {
          MyOtherType: 'MyOtherTypeCustom',
        },
      },
      { outputFile: '' }
    );

    expect(result).toBeSimilarStringTo(`
    export type ResolversTypes = {
      Query: Query,
      MyType: Omit<MyType, 'otherType'> & { otherType: Maybe<ResolversTypes['MyOtherType']> },
      String: Scalars['String'],
      MyOtherType: MyOtherTypeCustom,
      Subscription: Omit<Subscription, 'somethingChanged'> & { somethingChanged: Maybe<ResolversTypes['MyOtherType']> },
      Boolean: Scalars['Boolean'],
      Node: Node,
      ID: Scalars['ID'],
      SomeNode: SomeNode,
      MyUnion: MyUnion,
      MyScalar: Scalars['MyScalar'],
      Int: Scalars['Int'],
    };`);
    await validate(`type MyOtherTypeCustom = {}; ${result}`);
  });

  it('Should not replace using Omit when non-mapped type is pointing to mapped type', async () => {
    const result = await plugin(
      schema,
      [],
      {
        mappers: {
          MyOtherType: 'MyOtherTypeCustom',
          MyType: 'MyTypeCustom',
        },
      },
      { outputFile: '' }
    );

    expect(result).toBeSimilarStringTo(`
    export type ResolversTypes = {
      Query: Omit<Query, 'something'> & { something: ResolversTypes['MyType'] },
      MyType: MyTypeCustom,
      String: Scalars['String'],
      MyOtherType: MyOtherTypeCustom,
      Subscription: Omit<Subscription, 'somethingChanged'> & { somethingChanged: Maybe<ResolversTypes['MyOtherType']> },
      Boolean: Scalars['Boolean'],
      Node: Node,
      ID: Scalars['ID'],
      SomeNode: SomeNode,
      MyUnion: MyUnion,
      MyScalar: Scalars['MyScalar'],
      Int: Scalars['Int'],
    };`);
    await validate(`type MyTypeCustom = {}; type MyOtherTypeCustom = {}; ${result}`);
  });
});
