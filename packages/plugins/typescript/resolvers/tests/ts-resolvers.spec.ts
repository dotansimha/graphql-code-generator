import { validateTs } from '@graphql-codegen/testing';
import { buildSchema } from 'graphql';
import { plugin } from '../src';
import { plugin as tsPlugin } from '../../typescript/src/index';
import { schema, validate } from './common';
import { Types, mergeOutputs } from '@graphql-codegen/plugin-helpers';

describe('TypeScript Resolvers Plugin', () => {
  describe('Backward Compatability', () => {
    it('Should generate IDirectiveResolvers by default', async () => {
      const result = (await plugin(schema, [], {}, { outputFile: '' })) as Types.ComplexPluginOutput;
      expect(result.content).toBeSimilarStringTo(`
      /**
       * @deprecated
       * Use "DirectiveResolvers" root object instead. If you wish to get "IDirectiveResolvers", add "typesPrefix: I" to your config.
      */
      export type IDirectiveResolvers<ContextType = any> = DirectiveResolvers<ContextType>;`);
      await validate(result);
    });

    it('Should not generate IDirectiveResolvers when prefix is overwritten', async () => {
      const config = { typesPrefix: 'PREFIX_' };
      const result = (await plugin(schema, [], config, { outputFile: '' })) as Types.ComplexPluginOutput;
      expect(result.content).not.toContain(`export type IDirectiveResolvers`);
      expect(result.content).not.toContain(`export type DirectiveResolvers`);
      expect(result.content).toContain(`export type PREFIX_DirectiveResolvers`);
      await validate(result, config);
    });

    it('Should generate IResolvers by default', async () => {
      const result = (await plugin(schema, [], {}, { outputFile: '' })) as Types.ComplexPluginOutput;
      expect(result.content).toBeSimilarStringTo(`
      /**
       * @deprecated
       * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
      */
      export type IResolvers<ContextType = any> = Resolvers<ContextType>;`);
      await validate(result);
    });

    it('Should not generate IResolvers when prefix is overwritten', async () => {
      const config = { typesPrefix: 'PREFIX_' };
      const result = (await plugin(schema, [], config, { outputFile: '' })) as Types.ComplexPluginOutput;
      expect(result.content).not.toContain(`export type IResolvers`);
      expect(result.content).not.toContain(`export type Resolvers`);
      expect(result.content).toContain(`export type PREFIX_Resolvers`);
      await validate(result, config);
    });

    it('Should generate IResolvers by default with deprecated warning', async () => {
      const result = (await plugin(schema, [], {}, { outputFile: '' })) as Types.ComplexPluginOutput;
      expect(result.content).toBeSimilarStringTo(`
      /**
       * @deprecated
       * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
      */
      export type IResolvers<ContextType = any> = Resolvers<ContextType>;`);
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
      const resolversContent = (await plugin(
        testSchema,
        [],
        {
          contextType: 'Context',
          useIndexSignature: true,
        },
        {
          outputFile: 'graphql.ts',
        }
      )) as Types.ComplexPluginOutput;
      const content = mergeOutputs([
        tsContent,
        resolversContent,
        `
          import { makeExecutableSchema } from 'graphql-tools';
  
          interface Context {
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
      ]);

      expect(content).toBeSimilarStringTo(`
        export type Resolvers<ContextType = Context> = ResolversObject<{
          Query?: QueryResolvers<ContextType>,
          User?: UserResolvers<ContextType>,
        }>;
      `);

      validateTs(content);
    });
  });

  it('Should use StitchingResolver by default', async () => {
    const result = (await plugin(schema, [], {}, { outputFile: '' })) as Types.ComplexPluginOutput;

    expect(result.content).toBeSimilarStringTo(`
      export type StitchingResolver<TResult, TParent, TContext, TArgs> = {
        fragment: string;
        resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
      };
    `);
    expect(result.content).toBeSimilarStringTo(`
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

  it('Should allow to override ResolverTypeWrapper signature', async () => {
    const result = (await plugin(
      schema,
      [],
      {
        noSchemaStitching: true,
        resolverTypeWrapperSignature: 'Promise<DeepPartial<T>> | DeepPartial<T>',
      },
      { outputFile: '' }
    )) as Types.ComplexPluginOutput;

    expect(result.content).toContain(`export type ResolverTypeWrapper<T> = Promise<DeepPartial<T>> | DeepPartial<T>;`);
  });

  it('Should have default value for ResolverTypeWrapper signature', async () => {
    const result = (await plugin(
      schema,
      [],
      {
        noSchemaStitching: true,
      },
      { outputFile: '' }
    )) as Types.ComplexPluginOutput;

    expect(result.content).toContain(`export type ResolverTypeWrapper<T> = Promise<T> | T;`);
  });

  it('Should not warn when noSchemaStitching is not defined', async () => {
    const spy = jest.spyOn(console, 'warn').mockImplementation();
    const result = (await plugin(schema, [], {}, { outputFile: '' })) as Types.ComplexPluginOutput;

    expect(spy).not.toHaveBeenCalled();

    spy.mockRestore();

    await validate(result);
  });

  it('Should disable StitchingResolver on demand', async () => {
    const result = (await plugin(
      schema,
      [],
      {
        noSchemaStitching: true,
      },
      { outputFile: '' }
    )) as Types.ComplexPluginOutput;

    expect(result.content).not.toBeSimilarStringTo(`
      export type StitchingResolver<TResult, TParent, TContext, TArgs> = {
        fragment: string;
        resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
      };
    `);
    expect(result.content).not.toBeSimilarStringTo(`
      export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
        | ResolverFn<TResult, TParent, TContext, TArgs>
        | StitchingResolver<TResult, TParent, TContext, TArgs>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
        ResolverFn<TResult, TParent, TContext, TArgs>;
    `);

    await validate(result);
  });

  it('Default values of args and compatibility with typescript plugin', async () => {
    const testSchema = buildSchema(/* GraphQL */ `
      type Query {
        something(arg: String = "default_value"): String
      }
    `);

    const config: any = { noSchemaStitching: true };
    const result = (await plugin(testSchema, [], config, { outputFile: '' })) as Types.ComplexPluginOutput;
    const mergedOutputs = mergeOutputs([
      result,
      {
        content: `
    const resolvers: QueryResolvers = {
      something: (root, args, context, info) => {
        return args.arg; // This should work becuase "args.arg" is now forced
      }
    };`,
      },
    ]);

    expect(mergedOutputs).toContain(`export type RequireFields`);
    expect(mergedOutputs).toContain(`something?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<QuerySomethingArgs, 'arg'>>,`);
    validate(mergedOutputs);
  });

  it('Test for enum usage in resolvers (to verify compatibility with enumValues)', async () => {
    const testSchema = buildSchema(/* GraphQL */ `
      type Query {
        a: A
      }

      enum A {
        X
        Y
        Z
      }

      enum NotMapped {
        X
        Y
      }

      type B {
        a: String
      }
    `);

    const config = {
      enumValues: {
        A: 'MyA',
      },
      typesPrefix: 'GQL_',
    };
    const result = (await plugin(testSchema, [], config, { outputFile: '' })) as Types.ComplexPluginOutput;
    const tsContent = (await tsPlugin(testSchema, [], config, { outputFile: 'graphql.ts' })) as Types.ComplexPluginOutput;
    const mergedOutputs = mergeOutputs([result, tsContent]);

    expect(mergedOutputs).toContain(`A: A,`);
    expect(mergedOutputs).not.toContain(`A: GQL_A,`);
    expect(mergedOutputs).toContain(`NotMapped: GQL_NotMapped,`);
    expect(mergedOutputs).not.toContain(`NotMapped: NotMapped,`);
    expect(mergedOutputs).toContain(`B: GQL_B,`);
  });

  it('Should generate basic type resolvers', async () => {
    const result = (await plugin(schema, [], {}, { outputFile: '' })) as Types.ComplexPluginOutput;

    expect(result.content).toBeSimilarStringTo(`
    export type MyDirectiveDirectiveResolver<Result, Parent, ContextType = any, Args = {   arg?: Maybe<Scalars['Int']>,
      arg2?: Maybe<Scalars['String']>, arg3?: Maybe<Scalars['Boolean']> }> = DirectiveResolverFn<Result, Parent, ContextType, Args>;`);

    expect(result.content).toBeSimilarStringTo(`
      export type MyOtherTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['MyOtherType'] = ResolversParentTypes['MyOtherType']> = {
        bar?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
      };
    `);

    expect(result.content).toBeSimilarStringTo(`export interface MyScalarScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['MyScalar'], any> {
      name: 'MyScalar'
    }`);

    expect(result.content).toBeSimilarStringTo(`
      export type MyTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['MyType'] = ResolversParentTypes['MyType']> = {
        foo?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
        otherType?: Resolver<Maybe<ResolversTypes['MyOtherType']>, ParentType, ContextType>,
        withArgs?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, MyTypeWithArgsArgs>,
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type MyUnionResolvers<ContextType = any, ParentType extends ResolversParentTypes['MyUnion'] = ResolversParentTypes['MyUnion']> = {
        __resolveType: TypeResolveFn<'MyType' | 'MyOtherType', ParentType, ContextType>
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type NodeResolvers<ContextType = any, ParentType extends ResolversParentTypes['Node'] = ResolversParentTypes['Node']> = {
        __resolveType: TypeResolveFn<'SomeNode', ParentType, ContextType>,
        id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>,
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
        something?: Resolver<ResolversTypes['MyType'], ParentType, ContextType>,
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type SomeNodeResolvers<ContextType = any, ParentType extends ResolversParentTypes['SomeNode'] = ResolversParentTypes['SomeNode']> = {
        id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>,
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type SubscriptionResolvers<ContextType = any, ParentType extends ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription']> = {
        somethingChanged?: SubscriptionResolver<Maybe<ResolversTypes['MyOtherType']>, "somethingChanged", ParentType, ContextType>,
      };
    `);

    await validate(result);
  });

  it('Should generate basic type resolvers with avoidOptionals', async () => {
    const result = (await plugin(schema, [], { avoidOptionals: true }, { outputFile: '' })) as Types.ComplexPluginOutput;

    expect(result.content).toBeSimilarStringTo(`
    export type MyDirectiveDirectiveResolver<Result, Parent, ContextType = any, Args = {   arg: Maybe<Scalars['Int']>,
      arg2: Maybe<Scalars['String']>, arg3: Maybe<Scalars['Boolean']> }> = DirectiveResolverFn<Result, Parent, ContextType, Args>;`);

    expect(result.content).toBeSimilarStringTo(`
      export type MyOtherTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['MyOtherType'] = ResolversParentTypes['MyOtherType']> = {
        bar: Resolver<ResolversTypes['String'], ParentType, ContextType>,
      };
    `);

    expect(result.content).toBeSimilarStringTo(`export interface MyScalarScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['MyScalar'], any> {
      name: 'MyScalar'
    }`);

    expect(result.content).toBeSimilarStringTo(`
      export type MyTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['MyType'] = ResolversParentTypes['MyType']> = {
        foo: Resolver<ResolversTypes['String'], ParentType, ContextType>,
        otherType: Resolver<Maybe<ResolversTypes['MyOtherType']>, ParentType, ContextType>,
        withArgs: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, MyTypeWithArgsArgs>,
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type MyUnionResolvers<ContextType = any, ParentType extends ResolversParentTypes['MyUnion'] = ResolversParentTypes['MyUnion']> = {
        __resolveType: TypeResolveFn<'MyType' | 'MyOtherType', ParentType, ContextType>
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type NodeResolvers<ContextType = any, ParentType extends ResolversParentTypes['Node'] = ResolversParentTypes['Node']> = {
        __resolveType: TypeResolveFn<'SomeNode', ParentType, ContextType>,
        id: Resolver<ResolversTypes['ID'], ParentType, ContextType>,
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
        something: Resolver<ResolversTypes['MyType'], ParentType, ContextType>,
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type SomeNodeResolvers<ContextType = any, ParentType extends ResolversParentTypes['SomeNode'] = ResolversParentTypes['SomeNode']> = {
        id: Resolver<ResolversTypes['ID'], ParentType, ContextType>,
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type SubscriptionResolvers<ContextType = any, ParentType extends ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription']> = {
        somethingChanged: SubscriptionResolver<Maybe<ResolversTypes['MyOtherType']>, "somethingChanged", ParentType, ContextType>,
      };
    `);

    await validate(result);
  });

  it('Should allow to override context with simple identifier', async () => {
    const result = (await plugin(
      schema,
      [],
      {
        contextType: 'MyCustomCtx',
      },
      { outputFile: '' }
    )) as Types.ComplexPluginOutput;

    expect(result.content).toBeSimilarStringTo(`
    export type MyDirectiveDirectiveResolver<Result, Parent, ContextType = MyCustomCtx, Args = {   arg?: Maybe<Scalars['Int']>,
      arg2?: Maybe<Scalars['String']>, arg3?: Maybe<Scalars['Boolean']> }> = DirectiveResolverFn<Result, Parent, ContextType, Args>;`);

    expect(result.content).toBeSimilarStringTo(`
      export type MyOtherTypeResolvers<ContextType = MyCustomCtx, ParentType extends ResolversParentTypes['MyOtherType'] = ResolversParentTypes['MyOtherType']> = {
        bar?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type MyTypeResolvers<ContextType = MyCustomCtx, ParentType extends ResolversParentTypes['MyType'] = ResolversParentTypes['MyType']> = {
        foo?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
        otherType?: Resolver<Maybe<ResolversTypes['MyOtherType']>, ParentType, ContextType>,
        withArgs?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, MyTypeWithArgsArgs>,
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type MyUnionResolvers<ContextType = MyCustomCtx, ParentType extends ResolversParentTypes['MyUnion'] = ResolversParentTypes['MyUnion']> = {
        __resolveType: TypeResolveFn<'MyType' | 'MyOtherType', ParentType, ContextType>
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type NodeResolvers<ContextType = MyCustomCtx, ParentType extends ResolversParentTypes['Node'] = ResolversParentTypes['Node']> = {
        __resolveType: TypeResolveFn<'SomeNode', ParentType, ContextType>,
        id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>,
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type QueryResolvers<ContextType = MyCustomCtx, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
        something?: Resolver<ResolversTypes['MyType'], ParentType, ContextType>,
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type SomeNodeResolvers<ContextType = MyCustomCtx, ParentType extends ResolversParentTypes['SomeNode'] = ResolversParentTypes['SomeNode']> = {
        id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>,
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type SubscriptionResolvers<ContextType = MyCustomCtx, ParentType extends ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription']> = {
        somethingChanged?: SubscriptionResolver<Maybe<ResolversTypes['MyOtherType']>, "somethingChanged", ParentType, ContextType>,
      };
    `);

    await validate(mergeOutputs([result, `type MyCustomCtx = {};`]));
  });

  it('Should with correctly with addUnderscoreToArgsType set to true', async () => {
    const result = (await plugin(
      schema,
      [],
      {
        addUnderscoreToArgsType: true,
      },
      { outputFile: '' }
    )) as Types.ComplexPluginOutput;

    expect(result.content).toContain('MyType_WithArgsArgs');
    expect(result.content).not.toContain('MyTypeWithArgsArgs');

    await validate(mergeOutputs([result]));
  });

  it('Should allow to override context with mapped context type', async () => {
    const result = (await plugin(
      schema,
      [],
      {
        contextType: './my-file#MyCustomCtx',
      },
      { outputFile: '' }
    )) as Types.ComplexPluginOutput;

    expect(result.prepend).toContain(`import { MyCustomCtx } from './my-file';`);

    expect(result.content).toBeSimilarStringTo(`
    export type MyDirectiveDirectiveResolver<Result, Parent, ContextType = MyCustomCtx, Args = {   arg?: Maybe<Scalars['Int']>,
      arg2?: Maybe<Scalars['String']>, arg3?: Maybe<Scalars['Boolean']> }> = DirectiveResolverFn<Result, Parent, ContextType, Args>;`);

    expect(result.content).toBeSimilarStringTo(`
      export type MyOtherTypeResolvers<ContextType = MyCustomCtx, ParentType extends ResolversParentTypes['MyOtherType'] = ResolversParentTypes['MyOtherType']> = {
        bar?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type MyTypeResolvers<ContextType = MyCustomCtx, ParentType extends ResolversParentTypes['MyType'] = ResolversParentTypes['MyType']> = {
        foo?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
        otherType?: Resolver<Maybe<ResolversTypes['MyOtherType']>, ParentType, ContextType>,
        withArgs?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, MyTypeWithArgsArgs>,
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type MyUnionResolvers<ContextType = MyCustomCtx, ParentType extends ResolversParentTypes['MyUnion'] = ResolversParentTypes['MyUnion']> = {
        __resolveType: TypeResolveFn<'MyType' | 'MyOtherType', ParentType, ContextType>
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type NodeResolvers<ContextType = MyCustomCtx, ParentType extends ResolversParentTypes['Node'] = ResolversParentTypes['Node']> = {
        __resolveType: TypeResolveFn<'SomeNode', ParentType, ContextType>,
        id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>,
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type QueryResolvers<ContextType = MyCustomCtx, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
        something?: Resolver<ResolversTypes['MyType'], ParentType, ContextType>,
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type SomeNodeResolvers<ContextType = MyCustomCtx, ParentType extends ResolversParentTypes['SomeNode'] = ResolversParentTypes['SomeNode']> = {
        id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>,
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type SubscriptionResolvers<ContextType = MyCustomCtx, ParentType extends ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription']> = {
        somethingChanged?: SubscriptionResolver<Maybe<ResolversTypes['MyOtherType']>, "somethingChanged", ParentType, ContextType>,
      };
    `);

    await validate(result);
  });

  it('Should allow to override context with mapped context type as default export', async () => {
    const result = (await plugin(
      schema,
      [],
      {
        contextType: './my-file#default',
      },
      { outputFile: '' }
    )) as Types.ComplexPluginOutput;

    expect(result.prepend).toContain(`import ContextType from './my-file';`);

    expect(result.content).toBeSimilarStringTo(`
    export type MyDirectiveDirectiveResolver<Result, Parent, ContextType = ContextType, Args = {   arg?: Maybe<Scalars['Int']>,
      arg2?: Maybe<Scalars['String']>, arg3?: Maybe<Scalars['Boolean']> }> = DirectiveResolverFn<Result, Parent, ContextType, Args>;`);

    expect(result.content).toBeSimilarStringTo(`
      export type MyOtherTypeResolvers<ContextType = ContextType, ParentType extends ResolversParentTypes['MyOtherType'] = ResolversParentTypes['MyOtherType']> = {
        bar?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type MyTypeResolvers<ContextType = ContextType, ParentType extends ResolversParentTypes['MyType'] = ResolversParentTypes['MyType']> = {
        foo?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
        otherType?: Resolver<Maybe<ResolversTypes['MyOtherType']>, ParentType, ContextType>,
        withArgs?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, MyTypeWithArgsArgs>,
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type MyUnionResolvers<ContextType = ContextType, ParentType extends ResolversParentTypes['MyUnion'] = ResolversParentTypes['MyUnion']> = {
        __resolveType: TypeResolveFn<'MyType' | 'MyOtherType', ParentType, ContextType>
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type NodeResolvers<ContextType = ContextType, ParentType extends ResolversParentTypes['Node'] = ResolversParentTypes['Node']> = {
        __resolveType: TypeResolveFn<'SomeNode', ParentType, ContextType>,
        id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>,
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type QueryResolvers<ContextType = ContextType, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
        something?: Resolver<ResolversTypes['MyType'], ParentType, ContextType>,
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type SomeNodeResolvers<ContextType = ContextType, ParentType extends ResolversParentTypes['SomeNode'] = ResolversParentTypes['SomeNode']> = {
        id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>,
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type SubscriptionResolvers<ContextType = ContextType, ParentType extends ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription']> = {
        somethingChanged?: SubscriptionResolver<Maybe<ResolversTypes['MyOtherType']>, "somethingChanged", ParentType, ContextType>,
      };
    `);

    await validate(result);
  });

  it('Should generate the correct imports when schema has scalars', async () => {
    const testSchema = buildSchema(`scalar MyScalar`);
    const result = (await plugin(testSchema, [], {}, { outputFile: '' })) as Types.ComplexPluginOutput;

    expect(result.prepend).toContain(`import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';`);
    await validate(result, {}, schema);
  });

  it('Should generate the correct imports when schema has no scalars', async () => {
    const testSchema = buildSchema(`type MyType { f: String }`);
    const result = (await plugin(testSchema, [], {}, { outputFile: '' })) as Types.ComplexPluginOutput;

    expect(result.prepend).not.toContain(`import { GraphQLResolveInfo, GraphQLScalarTypeConfig } from 'graphql';`);
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

    const tsContent = (await tsPlugin(testSchema, [], {}, { outputFile: 'graphql.ts' })) as Types.ComplexPluginOutput;
    const content = (await plugin(testSchema, [], {}, { outputFile: 'graphql.ts' })) as Types.ComplexPluginOutput;

    expect(content.content).toBeSimilarStringTo(`CCCUnion: ResolversTypes['CCCFoo'] | ResolversTypes['CCCBar']`); // In ResolversTypes
    expect(content.content).toBeSimilarStringTo(`
    export type CccUnionResolvers<ContextType = any, ParentType extends ResolversParentTypes['CCCUnion'] = ResolversParentTypes['CCCUnion']> = {
      __resolveType: TypeResolveFn<'CCCFoo' | 'CCCBar', ParentType, ContextType>
    };
    `);

    await validateTs(mergeOutputs([tsContent, content]));
  });

  it('Should generate the correct resolver args type names when typesPrefix is specified', async () => {
    const testSchema = buildSchema(`type MyType { f(a: String): String }`);
    const config = { typesPrefix: 'T' };
    const result = (await plugin(testSchema, [], config, { outputFile: '' })) as Types.ComplexPluginOutput;

    expect(result.content).toBeSimilarStringTo(`f?: Resolver<Maybe<TResolversTypes['String']>, ParentType, ContextType, TMyTypeFArgs>,`);
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

    const content = (await plugin(
      testSchema,
      [],
      { scalars: { Date: 'Date' } },
      {
        outputFile: 'graphql.ts',
      }
    )) as Types.ComplexPluginOutput;

    expect(content.content).toBeSimilarStringTo(`
      export type Resolvers<ContextType = any> = {
        Date?: GraphQLScalarType,
        Node?: NodeResolvers,
        Post?: PostResolvers<ContextType>,
        PostOrUser?: PostOrUserResolvers,
        Query?: QueryResolvers<ContextType>,
        User?: UserResolvers<ContextType>,
      };
    `);

    expect(content.content).toBeSimilarStringTo(`
      export type DirectiveResolvers<ContextType = any> = {
        modify?: ModifyDirectiveResolver<any, any, ContextType>,
      };
    `);
  });

  it('should not create DirectiveResolvers if there is no directive defined in the schema', async () => {
    const testSchema = buildSchema(/* GraphQL */ `
      type Query {
        foo: String
      }
    `);

    const content = (await plugin(
      testSchema,
      [],
      { scalars: { Date: 'Date' } },
      {
        outputFile: 'graphql.ts',
      }
    )) as Types.ComplexPluginOutput;

    expect(content.content).not.toBeSimilarStringTo(`
      export type DirectiveResolvers<ContextType = any> = {};
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

    const tsContent = (await tsPlugin(testSchema, [], {}, { outputFile: 'graphql.ts' })) as Types.ComplexPluginOutput;
    const resolversContent = (await plugin(
      testSchema,
      [],
      {
        contextType: 'AppContext',
        useIndexSignature: true,
      },
      {
        outputFile: 'graphql.ts',
      }
    )) as Types.ComplexPluginOutput;
    const content = mergeOutputs([
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
    ]);

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
    const content = mergeOutputs([
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
    ]);

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
    const content = (await plugin(testSchema, [], {}, { outputFile: 'graphql.ts' })) as Types.ComplexPluginOutput;

    expect(content.content).toBeSimilarStringTo(`
      export type ResolversTypes = {
        Query: ResolverTypeWrapper<{}>,
        Post: ResolverTypeWrapper<Post>,
        String: ResolverTypeWrapper<Scalars['String']>,
        Mutation: ResolverTypeWrapper<{}>,
        Subscription: ResolverTypeWrapper<{}>,
        Boolean: ResolverTypeWrapper<Scalars['Boolean']>,
      };
    `);
  });

  it('should generate ResolversParentTypes', async () => {
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
    const content = (await plugin(testSchema, [], {}, { outputFile: 'graphql.ts' })) as Types.ComplexPluginOutput;

    expect(content.content).toBeSimilarStringTo(`
      export type ResolversParentTypes = {
        Query: {},
        Post: Post,
        String: Scalars['String'],
        Mutation: {},
        Subscription: {},
        Boolean: Scalars['Boolean'],
      };
    `);
  });

  it('should use correct value when rootValueType mapped as default', async () => {
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
    const content = (await plugin(
      testSchema,
      [],
      {
        rootValueType: 'my-file#default',
      },
      { outputFile: 'graphql.ts' }
    )) as Types.ComplexPluginOutput;

    expect(content.content).toBeSimilarStringTo(`
      export type ResolversTypes = {
        Query: ResolverTypeWrapper<RootValueType>,
        Post: ResolverTypeWrapper<Post>,
        String: ResolverTypeWrapper<Scalars['String']>,
        Mutation: ResolverTypeWrapper<RootValueType>,
        Subscription: ResolverTypeWrapper<RootValueType>,
        Boolean: ResolverTypeWrapper<Scalars['Boolean']>,
      };
    `);

    expect(content.prepend).toContain(`import RootValueType from 'my-file';`);
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
    const content = (await plugin(
      testSchema,
      [],
      {
        rootValueType: 'MyRoot',
      },
      { outputFile: 'graphql.ts' }
    )) as Types.ComplexPluginOutput;

    expect(content.content).toBeSimilarStringTo(`
      export type ResolversTypes = {
        MyQuery: ResolverTypeWrapper<MyRoot>,
        Post: ResolverTypeWrapper<Post>,
        String: ResolverTypeWrapper<Scalars['String']>,
        MyMutation: ResolverTypeWrapper<MyRoot>,
        MySubscription: ResolverTypeWrapper<MyRoot>,
        Boolean: ResolverTypeWrapper<Scalars['Boolean']>,
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
    const content = mergeOutputs([
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
    ]);

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

    const result = (await plugin(schemaWithNoImplementors, [], {}, { outputFile: '' })) as Types.ComplexPluginOutput;

    expect(result.content).toBeSimilarStringTo(`
      export type NodeResolvers<ContextType = any, ParentType extends ResolversParentTypes['Node'] = ResolversParentTypes['Node']> = {
        __resolveType: TypeResolveFn<null, ParentType, ContextType>,
        id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>,
      };
    `);
  });
  it('should use MaybePromise in ResolverTypeWrapper', async () => {
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
    const content = (await plugin(
      testSchema,
      [],
      {
        rootValueType: 'MyRoot',
        asyncResolverTypes: true,
      } as any,
      { outputFile: 'graphql.ts' }
    )) as Types.ComplexPluginOutput;

    expect(content.content).toBeSimilarStringTo(`
      export type ResolverTypeWrapper<T> = Promise<T> | T;
    `);
  });

  it.skip('should support all use-cases of subscription resolvers', async () => {
    const testSchema = buildSchema(/* GraphQL */ `
      type Subscription {
        postAdded: Post
      }

      type Query {
        posts: [Post]
      }

      type Post {
        author: String
        comment: String
      }
    `);

    const tsContent = await tsPlugin(testSchema, [], {}, { outputFile: 'graphql.ts' });
    const resolversContent = (await plugin(testSchema, [], {}, { outputFile: 'graphql.ts' })) as Types.ComplexPluginOutput;

    const validateResolvers = (code: string) => {
      validateTs(
        mergeOutputs([
          tsContent,
          resolversContent,
          `
            import { PubSub } from 'graphql-subscriptions';
        
            const pubsub = new PubSub();
            const POST_ADDED = 'POST_ADDED';
          `,
          code,
        ])
      );
    };

    // if `subscribe` returns anything
    // `resolve` should be defined
    // and `parent` should be any
    expect(() => {
      validateResolvers(`
      type PubSubEvent = {
        text: string;
        user: string;
      };
  
      const resolvers: Resolvers = {
        Subscription: {
          postAdded: {
            subscribe: () => pubsub.asyncIterator<PubSubEvent>(POST_ADDED),
            resolve: parent => {
              return {
                comment: parent.text,
                author: parent.user
              };
            }
          }
        }
      };
    `);
    }).not.toThrow();

    // if `subscribe` returns anything
    // `resolve` should be defined
    // and `parent` should be any
    // but resolver is missing...
    expect(() => {
      validateResolvers(`
      import { PubSub } from 'graphql-subscriptions';
      
      const pubsub = new PubSub();
      const POST_ADDED = 'POST_ADDED';
      
      type PubSubEvent = {
        text: string;
        user: string;
      };
  
      const resolvers: Resolvers = {
        Subscription: {
          postAdded: {
            subscribe: () => pubsub.asyncIterator<PubSubEvent>(POST_ADDED)
            // resolvers is missing!
          }
        }
      };
    `);
    }).toThrow();

    // if `subscribe` returns { postAdded: PostAdded }
    // `resolve` should be optional
    expect(() => {
      validateResolvers(`
      import { PubSub } from 'graphql-subscriptions';
      
      const pubsub = new PubSub();
      const POST_ADDED = 'POST_ADDED';
      
      type PubSubEvent = {
        postAdded: {
          comment: string;
          author: string;
        }
      };
  
      const resolvers: Resolvers = {
        Subscription: {
          postAdded: {
            subscribe: () => pubsub.asyncIterator<PubSubEvent>(POST_ADDED),
          },
        }
      };
    `);
    }).not.toThrow();

    // if `subscribe` returns { postAdded: PostAdded }
    // and `parent` should be { postAdded: PostAdded }
    expect(() => {
      validateResolvers(`
      import { PubSub } from 'graphql-subscriptions';
      
      const pubsub = new PubSub();
      const POST_ADDED = 'POST_ADDED';
      
      type PubSubEvent = {
        postAdded: {
          comment: string;
          author: string;
        }
      };
  
      const resolvers: Resolvers = {
        Subscription: {
          postAdded: {
            subscribe: () => pubsub.asyncIterator<PubSubEvent>(POST_ADDED),
            resolve: event => event.postAdded
          },
        }
      };
    `);
    }).not.toThrow();

    // if `subscribe` returns { postAdded: Foo }
    // `resolve` shouldn't be optional
    expect(() => {
      validateResolvers(`
      import { PubSub } from 'graphql-subscriptions';
      
      const pubsub = new PubSub();
      const POST_ADDED = 'POST_ADDED';
      
      type PubSubEvent = {
        postAdded: {
          text: string;
          user: string;
        }
      };
  
      const resolvers: Resolvers = {
        Subscription: {
          postAdded: {
            subscribe: () => pubsub.asyncIterator<PubSubEvent>(POST_ADDED),
          },
        }
      };
    `);
    }).toThrow();

    // if `subscribe` returns { postAdded: Foo }
    // and `parent` should be { postAdded: Foo }
    expect(() => {
      validateResolvers(`
      import { PubSub } from 'graphql-subscriptions';
      
      const pubsub = new PubSub();
      const POST_ADDED = 'POST_ADDED';
      
      type PubSubEvent = {
        postAdded: {
          text: string;
          user: string;
        }
      };
  
      const resolvers: Resolvers = {
        Subscription: {
          postAdded: {
            subscribe: () => pubsub.asyncIterator<PubSubEvent>(POST_ADDED),
            resolve: (event) => {
              return {
                comment: event.text,
                author: event.user
              };
            }
          },
        }
      };
    `);
    }).not.toThrow();

    // if `subscribe` returns PostAdded
    // `resolve` should be optional
    expect(() => {
      validateResolvers(`
      import { PubSub } from 'graphql-subscriptions';
      
      const pubsub = new PubSub();
      const POST_ADDED = 'POST_ADDED';
      
      type PubSubEvent = {
        comment: string;
        author: string;
      };
  
      const resolvers: Resolvers = {
        Subscription: {
          postAdded: {
            subscribe: () => pubsub.asyncIterator<PubSubEvent>(POST_ADDED),
          },
        }
      };
    `);
    }).not.toThrow();

    // if `subscribe` returns PostAdded
    // `parent` should be of type PostAdded
    expect(() => {
      validateResolvers(`
      import { PubSub } from 'graphql-subscriptions';
      
      const pubsub = new PubSub();
      const POST_ADDED = 'POST_ADDED';
      
      type PubSubEvent = {
        comment: string;
        author: string;
      };
  
      const resolvers: Resolvers = {
        Subscription: {
          postAdded: {
            subscribe: () => pubsub.asyncIterator<PubSubEvent>(POST_ADDED),
            resolve: event => event
          },
        }
      };
    `);
    }).not.toThrow();
  });
});
