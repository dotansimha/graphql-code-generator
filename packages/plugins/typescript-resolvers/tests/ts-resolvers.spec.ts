import '@graphql-codegen/testing';
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

  it('Should generate basic type resolvers', async () => {
    const result = await plugin(schema, [], {}, { outputFile: '' });

    expect(result).toBeSimilarStringTo(`
    export type MyDirectiveDirectiveResolver<Result, Parent, Context = any, Args = {   arg?: Maybe<Scalars['Int']>,
      arg2?: Maybe<Scalars['String']>, arg3?: Maybe<Scalars['Boolean']> }> = DirectiveResolverFn<Result, Parent, Context, Args>;`);

    expect(result).toBeSimilarStringTo(`
      export type MyOtherTypeResolvers<Context = any, ParentType = MyOtherType> = {
        bar?: Resolver<Scalars['String'], ParentType, Context>,
      };
    `);

    expect(result).toBeSimilarStringTo(`export interface MyScalarScalarConfig extends GraphQLScalarTypeConfig<Scalars['MyScalar'], any> {
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
        __resolveType: TypeResolveFn<'MyType' | 'MyOtherType', ParentType, Context>
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type NodeResolvers<Context = any, ParentType = Node> = {
        __resolveType: TypeResolveFn<'SomeNode', ParentType, Context>,
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

  it('Should generate basic type resolvers with avoidOptionals', async () => {
    const result = await plugin(schema, [], { avoidOptionals: true }, { outputFile: '' });

    expect(result).toBeSimilarStringTo(`
    export type MyDirectiveDirectiveResolver<Result, Parent, Context = any, Args = {   arg: Maybe<Scalars['Int']>,
      arg2: Maybe<Scalars['String']>, arg3: Maybe<Scalars['Boolean']> }> = DirectiveResolverFn<Result, Parent, Context, Args>;`);

    expect(result).toBeSimilarStringTo(`
      export type MyOtherTypeResolvers<Context = any, ParentType = MyOtherType> = {
        bar: Resolver<Scalars['String'], ParentType, Context>,
      };
    `);

    expect(result).toBeSimilarStringTo(`export interface MyScalarScalarConfig extends GraphQLScalarTypeConfig<Scalars['MyScalar'], any> {
      name: 'MyScalar'
    }`);

    expect(result).toBeSimilarStringTo(`
      export type MyTypeResolvers<Context = any, ParentType = MyType> = {
        foo: Resolver<Scalars['String'], ParentType, Context>,
        otherType: Resolver<Maybe<MyOtherType>, ParentType, Context>,
        withArgs: Resolver<Maybe<Scalars['String']>, ParentType, Context, MyTypeWithArgsArgs>,
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type MyUnionResolvers<Context = any, ParentType = MyUnion> = {
        __resolveType: TypeResolveFn<'MyType' | 'MyOtherType', ParentType, Context>
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type NodeResolvers<Context = any, ParentType = Node> = {
        __resolveType: TypeResolveFn<'SomeNode', ParentType, Context>,
        id: Resolver<Scalars['ID'], ParentType, Context>,
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type QueryResolvers<Context = any, ParentType = Query> = {
        something: Resolver<MyType, ParentType, Context>,
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type SomeNodeResolvers<Context = any, ParentType = SomeNode> = {
        id: Resolver<Scalars['ID'], ParentType, Context>,
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type SubscriptionResolvers<Context = any, ParentType = Subscription> = {
        somethingChanged: SubscriptionResolver<Maybe<MyOtherType>, ParentType, Context>,
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
      export type MyOtherTypeResolvers<Context = MyCustomContext, ParentType = MyOtherType> = {
        bar?: Resolver<Scalars['String'], ParentType, Context>,
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type MyTypeResolvers<Context = MyCustomContext, ParentType = MyType> = {
        foo?: Resolver<Scalars['String'], ParentType, Context>,
        otherType?: Resolver<Maybe<MyOtherType>, ParentType, Context>,
        withArgs?: Resolver<Maybe<Scalars['String']>, ParentType, Context, MyTypeWithArgsArgs>,
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type MyUnionResolvers<Context = MyCustomContext, ParentType = MyUnion> = {
        __resolveType: TypeResolveFn<'MyType' | 'MyOtherType', ParentType, Context>
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type NodeResolvers<Context = MyCustomContext, ParentType = Node> = {
        __resolveType: TypeResolveFn<'SomeNode', ParentType, Context>,
        id?: Resolver<Scalars['ID'], ParentType, Context>,
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type QueryResolvers<Context = MyCustomContext, ParentType = Query> = {
        something?: Resolver<MyType, ParentType, Context>,
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type SomeNodeResolvers<Context = MyCustomContext, ParentType = SomeNode> = {
        id?: Resolver<Scalars['ID'], ParentType, Context>,
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type SubscriptionResolvers<Context = MyCustomContext, ParentType = Subscription> = {
        somethingChanged?: SubscriptionResolver<Maybe<MyOtherType>, ParentType, Context>,
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
      export type MyOtherTypeResolvers<Context = MyCustomContext, ParentType = MyOtherType> = {
        bar?: Resolver<Scalars['String'], ParentType, Context>,
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type MyTypeResolvers<Context = MyCustomContext, ParentType = MyType> = {
        foo?: Resolver<Scalars['String'], ParentType, Context>,
        otherType?: Resolver<Maybe<MyOtherType>, ParentType, Context>,
        withArgs?: Resolver<Maybe<Scalars['String']>, ParentType, Context, MyTypeWithArgsArgs>,
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type MyUnionResolvers<Context = MyCustomContext, ParentType = MyUnion> = {
        __resolveType: TypeResolveFn<'MyType' | 'MyOtherType', ParentType, Context>
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type NodeResolvers<Context = MyCustomContext, ParentType = Node> = {
        __resolveType: TypeResolveFn<'SomeNode', ParentType, Context>,
        id?: Resolver<Scalars['ID'], ParentType, Context>,
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type QueryResolvers<Context = MyCustomContext, ParentType = Query> = {
        something?: Resolver<MyType, ParentType, Context>,
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type SomeNodeResolvers<Context = MyCustomContext, ParentType = SomeNode> = {
        id?: Resolver<Scalars['ID'], ParentType, Context>,
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type SubscriptionResolvers<Context = MyCustomContext, ParentType = Subscription> = {
        somethingChanged?: SubscriptionResolver<Maybe<MyOtherType>, ParentType, Context>,
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

  it('Should generate basic type resolvers with mapping', async () => {
    const result = await plugin(
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
        __resolveType: TypeResolveFn<'MyType' | 'MyOtherType', ParentType, Context>
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type NodeResolvers<Context = any, ParentType = Node> = {
        __resolveType: TypeResolveFn<'SomeNode', ParentType, Context>,
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
      export type MyOtherTypeResolvers<Context = any, ParentType = MyOtherType> = {
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
        otherType?: Resolver<Maybe<MyOtherType>, ParentType, Context>,
        withArgs?: Resolver<Maybe<Scalars['String']>, ParentType, Context, MyTypeWithArgsArgs>,
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type MyUnionResolvers<Context = any, ParentType = MyUnion> = {
        __resolveType: TypeResolveFn<'MyType' | 'MyOtherType', ParentType, Context>
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type NodeResolvers<Context = any, ParentType = MyNodeType> = {
        __resolveType: TypeResolveFn<'SomeNode', ParentType, Context>,
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
      export type MyOtherTypeResolvers<Context = any, ParentType = any> = {
        bar?: Resolver<any, ParentType, Context>,
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export interface MyScalarScalarConfig extends GraphQLScalarTypeConfig<Scalars['MyScalar'], any> {
        name: 'MyScalar'
      }
    `);

    expect(result).toBeSimilarStringTo(`
      export type MyTypeResolvers<Context = any, ParentType = any> = {
        foo?: Resolver<any, ParentType, Context>,
        otherType?: Resolver<Maybe<any>, ParentType, Context>,
        withArgs?: Resolver<Maybe<any>, ParentType, Context, MyTypeWithArgsArgs>,
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type MyUnionResolvers<Context = any, ParentType = any> = {
        __resolveType: TypeResolveFn<'MyType' | 'MyOtherType', ParentType, Context>
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type NodeResolvers<Context = any, ParentType = any> = {
        __resolveType: TypeResolveFn<'SomeNode', ParentType, Context>,
        id?: Resolver<any, ParentType, Context>,
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type QueryResolvers<Context = any, ParentType = any> = {
        something?: Resolver<any, ParentType, Context>,
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type SomeNodeResolvers<Context = any, ParentType = any> = {
        id?: Resolver<any, ParentType, Context>,
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type SubscriptionResolvers<Context = any, ParentType = any> = {
        somethingChanged?: SubscriptionResolver<Maybe<any>, ParentType, Context>,
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
      export type MyOtherTypeResolvers<Context = any, ParentType = MyBaseType> = {
        bar?: Resolver<MyBaseType, ParentType, Context>,
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export interface MyScalarScalarConfig extends GraphQLScalarTypeConfig<Scalars['MyScalar'], any> {
        name: 'MyScalar'
      }
    `);

    expect(result).toBeSimilarStringTo(`
      export type MyTypeResolvers<Context = any, ParentType = MyBaseType> = {
        foo?: Resolver<MyBaseType, ParentType, Context>,
        otherType?: Resolver<Maybe<MyBaseType>, ParentType, Context>,
        withArgs?: Resolver<Maybe<MyBaseType>, ParentType, Context, MyTypeWithArgsArgs>,
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type MyUnionResolvers<Context = any, ParentType = MyBaseType> = {
        __resolveType: TypeResolveFn<'MyType' | 'MyOtherType', ParentType, Context>
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type NodeResolvers<Context = any, ParentType = MyBaseType> = {
        __resolveType: TypeResolveFn<'SomeNode', ParentType, Context>,
        id?: Resolver<MyBaseType, ParentType, Context>,
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type QueryResolvers<Context = any, ParentType = MyBaseType> = {
        something?: Resolver<MyBaseType, ParentType, Context>,
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type SomeNodeResolvers<Context = any, ParentType = MyBaseType> = {
        id?: Resolver<MyBaseType, ParentType, Context>,
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type SubscriptionResolvers<Context = any, ParentType = MyBaseType> = {
        somethingChanged?: SubscriptionResolver<Maybe<MyBaseType>, ParentType, Context>,
      };
    `);
    await validate(result);
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
        export type MyOtherTypeResolvers<Context = any, ParentType = MyCustomOtherType> = {
          bar?: Resolver<Scalars['String'], ParentType, Context>,
        };
      `);

    expect(result).toBeSimilarStringTo(`export interface MyScalarScalarConfig extends GraphQLScalarTypeConfig<Scalars['MyScalar'], any> {
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
        __resolveType: TypeResolveFn<'MyType' | 'MyOtherType', ParentType, Context>
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type NodeResolvers<Context = any, ParentType = Node> = {
        __resolveType: TypeResolveFn<'SomeNode', ParentType, Context>,
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
        export type MyOtherTypeResolvers<Context = any, ParentType = MyCustomOtherType> = {
          bar?: Resolver<Scalars['String'], ParentType, Context>,
        };
      `);

    expect(result).toBeSimilarStringTo(`export interface MyScalarScalarConfig extends GraphQLScalarTypeConfig<Scalars['MyScalar'], any> {
      name: 'MyScalar'
        }
      `);

    expect(result).toBeSimilarStringTo(`
      export type MyTypeResolvers<Context = any, ParentType = MyCustomOtherType> = {
        foo?: Resolver<Scalars['String'], ParentType, Context>,
        otherType?: Resolver<Maybe<MyCustomOtherType>, ParentType, Context>,
        withArgs?: Resolver<Maybe<Scalars['String']>, ParentType, Context, MyTypeWithArgsArgs>,
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type MyUnionResolvers<Context = any, ParentType = MyUnion> = {
        __resolveType: TypeResolveFn<'MyType' | 'MyOtherType', ParentType, Context>
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type NodeResolvers<Context = any, ParentType = Node> = {
        __resolveType: TypeResolveFn<'SomeNode', ParentType, Context>,
        id?: Resolver<Scalars['ID'], ParentType, Context>,
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type QueryResolvers<Context = any, ParentType = Query> = {
        something?: Resolver<MyCustomOtherType, ParentType, Context>,
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

    expect(content).toBeSimilarStringTo(`
      export type QueryResolvers<Context = AppContext, ParentType = Query> = ResolversObject<{
        users?: Resolver<Array<User>, ParentType, Context>,
      }>;
    `);

    expect(content).toBeSimilarStringTo(`
      export type UserResolvers<Context = AppContext, ParentType = User> = ResolversObject<{
        id?: Resolver<Scalars['ID'], ParentType, Context>,
        name?: Resolver<Scalars['String'], ParentType, Context>,
      }>;
    `);

    expect(content).toBeSimilarStringTo(`
      export type Resolvers<Context = AppContext> = ResolversObject<{
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
    const resolversContent = await plugin(testSchema, [], {}, { outputFile: 'graphql.ts' });
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
              // Additional event labels can be passed to asyncIterator creation
              subscribe: () => pubsub.asyncIterator([POST_ADDED]),
            },
          },
          Mutation: {
            addPost: (root, args) => {
              pubsub.publish(POST_ADDED, { postAdded: args });
              return args;
            }
          },
        };
      `,
    ].join('\n');
    validateTs(content);
  });
});
