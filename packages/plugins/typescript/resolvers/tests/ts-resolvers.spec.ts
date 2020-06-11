import { validateTs } from '@graphql-codegen/testing';
import { buildSchema } from 'graphql';
import { plugin } from '../src';
import { plugin as tsPlugin } from '../../typescript/src/index';
import { schema, validate } from './common';
import { Types, mergeOutputs } from '@graphql-codegen/plugin-helpers';
import { ENUM_RESOLVERS_SIGNATURE } from '../src/visitor';

describe('TypeScript Resolvers Plugin', () => {
  describe('Backward Compatability', () => {
    it('Should generate IDirectiveResolvers by default', async () => {
      const result = await plugin(schema, [], {}, { outputFile: '' });
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
      const result = await plugin(schema, [], config, { outputFile: '' });
      expect(result.content).not.toContain(`export type IDirectiveResolvers`);
      expect(result.content).not.toContain(`export type DirectiveResolvers`);
      expect(result.content).toContain(`export type PREFIX_DirectiveResolvers`);
      await validate(result, config);
    });

    it('Should generate IResolvers by default', async () => {
      const result = await plugin(schema, [], {}, { outputFile: '' });
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
      const result = await plugin(schema, [], config, { outputFile: '' });
      expect(result.content).not.toContain(`export type IResolvers`);
      expect(result.content).not.toContain(`export type Resolvers`);
      expect(result.content).toContain(`export type PREFIX_Resolvers`);
      await validate(result, config);
    });

    it('Should generate IResolvers by default with deprecated warning', async () => {
      const result = await plugin(schema, [], {}, { outputFile: '' });
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
          import { makeExecutableSchema } from '@graphql-tools/schema';

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
          Query?: QueryResolvers<ContextType>;
          User?: UserResolvers<ContextType>;
        }>;
      `);

      validateTs(content);
    });
  });

  it('Should use StitchingResolver by default', async () => {
    const result = await plugin(schema, [], {}, { outputFile: '' });

    expect(result.content).toBeSimilarStringTo(`export type StitchingResolver<TResult, TParent, TContext, TArgs>`);
    expect(result.content).toBeSimilarStringTo(`
      export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
        | ResolverFn<TResult, TParent, TContext, TArgs>
        | StitchingResolver<TResult, TParent, TContext, TArgs>;
    `);

    await validate(result);
  });

  describe('Enums', () => {
    it('Should not generate enum internal values resolvers when enum doesnt have enumValues set', async () => {
      const testSchema = buildSchema(/* GraphQL */ `
        type Query {
          v: MyEnum
        }

        enum MyEnum {
          A
          B
          C
        }
      `);
      const config = {
        noSchemaStitching: true,
      };
      const result = await plugin(testSchema, [], config, { outputFile: '' });
      const mergedOutput = await validate(
        result,
        config,
        testSchema,
        `
        export const resolvers: Resolvers = {
          Query: {
            v: () => 'A',
          }
        }; 
      `
      );

      expect(mergedOutput).not.toContain(ENUM_RESOLVERS_SIGNATURE);
      expect(mergedOutput).not.toContain('EnumResolverSignature');
    });

    it('Should generate enum internal values resolvers when enum has enumValues set as object with explicit values', async () => {
      const testSchema = buildSchema(/* GraphQL */ `
        type Query {
          v: MyEnum
        }

        enum MyEnum {
          A
          B
          C
        }
      `);
      const config = {
        noSchemaStitching: true,
        enumValues: {
          MyEnum: {
            A: 'val_1',
            B: 'val_2',
            C: 'val_3',
          },
        },
      };
      const result = await plugin(testSchema, [], config, { outputFile: '' });

      const mergedOutput = await validate(
        result,
        config,
        testSchema,
        `
        export const resolvers: Resolvers = {
          MyEnum: {
            A: 'val_1',
            B: 'val_2',
            C: 'val_3',
          },
          Query: {
            v: () => 'val_1',
          }
        }; 
      `
      );

      expect(mergedOutput).not.toContain(ENUM_RESOLVERS_SIGNATURE);
      expect(mergedOutput).not.toContain('EnumResolverSignature');
      expect(mergedOutput).toContain(`export type MyEnumResolvers = { A: 'val_1', B: 'val_2', C: 'val_3' };`);
    });

    it('Should generate enum internal values resolvers when enum has enumValues set as external enum', async () => {
      const testSchema = buildSchema(/* GraphQL */ `
        type Query {
          v: MyEnum
        }

        enum MyEnum {
          A
          B
          C
        }
      `);
      const config = {
        noSchemaStitching: true,
        enumValues: {
          MyEnum: 'MyCustomEnum',
        },
      };
      const result = await plugin(testSchema, [], config, { outputFile: '' });

      const mergedOutput = await validate(
        result,
        config,
        testSchema,
        `
        enum MyCustomEnum {
          CUSTOM_A,
          CUSTOM_B,
          CUSTOM_C
        }

        export const resolvers: Resolvers = {
          MyEnum: {
            A: MyCustomEnum.CUSTOM_A,
            B: MyCustomEnum.CUSTOM_B,
            C: MyCustomEnum.CUSTOM_C,
          },
          Query: {
            v: () => MyCustomEnum.CUSTOM_A,
          }
        }; 
      `
      );

      expect(mergedOutput).toContain(ENUM_RESOLVERS_SIGNATURE);
      expect(mergedOutput).toContain('EnumResolverSignature');
      expect(mergedOutput).toContain(
        `export type MyEnumResolvers = EnumResolverSignature<{ A?: any, B?: any, C?: any }, ResolversTypes['MyEnum']>;`
      );
    });

    it('Should generate enum internal values resolvers when enum has mappers pointing to external enum', async () => {
      const testSchema = buildSchema(/* GraphQL */ `
        type Query {
          v: MyEnum
        }

        enum MyEnum {
          A
          B
          C
        }
      `);
      const config = {
        noSchemaStitching: true,
        mappers: {
          MyEnum: 'MyCustomEnum',
        },
      };
      const result = await plugin(testSchema, [], config, { outputFile: '' });

      const mergedOutput = await validate(
        result,
        config,
        testSchema,
        `
        enum MyCustomEnum {
          CUSTOM_A,
          CUSTOM_B,
          CUSTOM_C
        }

        export const resolvers: Resolvers = {
          MyEnum: {
            A: MyCustomEnum.CUSTOM_A,
            B: MyCustomEnum.CUSTOM_B,
            C: MyCustomEnum.CUSTOM_C,
          },
          Query: {
            v: () => MyCustomEnum.CUSTOM_A,
          }
        }; 
      `
      );

      expect(mergedOutput).toContain(ENUM_RESOLVERS_SIGNATURE);
      expect(mergedOutput).toContain('EnumResolverSignature');
      expect(mergedOutput).toContain(
        `export type MyEnumResolvers = EnumResolverSignature<{ A?: any, B?: any, C?: any }, ResolversTypes['MyEnum']>;`
      );
    });

    it('Should generate enum internal values resolvers when enum has enumValues set on a global level of all enums', async () => {
      const testSchema = buildSchema(/* GraphQL */ `
        type Query {
          v: MyEnum
        }

        enum MyEnum {
          A
          B
          C
        }
      `);
      const config = {
        noSchemaStitching: true,
        enumValues: './enums',
      };
      const result = await plugin(testSchema, [], config, { outputFile: '' });

      const mergedOutput = await validate(
        result,
        config,
        testSchema,
        `
        enum MyCustomEnum {
          CUSTOM_A,
          CUSTOM_B,
          CUSTOM_C
        }

        export const resolvers: Resolvers = {
          MyEnum: {
            A: MyCustomEnum.CUSTOM_A,
            B: MyCustomEnum.CUSTOM_B,
            C: MyCustomEnum.CUSTOM_C,
          },
          Query: {
            v: () => MyCustomEnum.CUSTOM_A,
          }
        }; 
      `
      );

      expect(mergedOutput).toContain(`import { MyEnum } from './enums'`);
      expect(mergedOutput).toContain(`export { MyEnum }`);
      expect(mergedOutput).toContain(ENUM_RESOLVERS_SIGNATURE);
      expect(mergedOutput).toContain('EnumResolverSignature');
      expect(mergedOutput).toContain(
        `export type MyEnumResolvers = EnumResolverSignature<{ A?: any, B?: any, C?: any }, ResolversTypes['MyEnum']>;`
      );
    });
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
    const result = await plugin(schema, [], {}, { outputFile: '' });

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
    const result = await plugin(testSchema, [], config, { outputFile: '' });
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
    expect(mergedOutputs).toContain(
      `something?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<QuerySomethingArgs, 'arg'>>;`
    );
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
    const result = await plugin(testSchema, [], config, { outputFile: '' });
    const tsContent = (await tsPlugin(testSchema, [], config, {
      outputFile: 'graphql.ts',
    })) as Types.ComplexPluginOutput;
    const mergedOutputs = mergeOutputs([result, tsContent]);

    expect(mergedOutputs).not.toContain(`A: A;`);
    expect(mergedOutputs).not.toContain(`A: GQL_A;`);
    expect(mergedOutputs).toContain(`NotMapped: GQL_NotMapped;`);
    expect(mergedOutputs).not.toContain(`NotMapped: NotMapped;`);
    expect(mergedOutputs).toContain(`B: GQL_B;`);
  });

  it('Should allow to generate optional __resolveType', async () => {
    const result = (await plugin(
      schema,
      [],
      { optionalResolveType: true },
      { outputFile: '' }
    )) as Types.ComplexPluginOutput;

    expect(result.content).toBeSimilarStringTo(`
      export type MyUnionResolvers<ContextType = any, ParentType extends ResolversParentTypes['MyUnion'] = ResolversParentTypes['MyUnion']> = {
        __resolveType?: TypeResolveFn<'MyType' | 'MyOtherType', ParentType, ContextType>;
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type NodeResolvers<ContextType = any, ParentType extends ResolversParentTypes['Node'] = ResolversParentTypes['Node']> = {
        __resolveType?: TypeResolveFn<'SomeNode', ParentType, ContextType>;
        id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
      };
    `);
  });

  it('Should generate basic type resolvers', async () => {
    const result = await plugin(schema, [], {}, { outputFile: '' });

    expect(result.content).toBeSimilarStringTo(`
    export type MyDirectiveDirectiveArgs = {   arg: Scalars['Int'];
    arg2: Scalars['String'];
    arg3: Scalars['Boolean']; };
    `);

    expect(result.content).toBeSimilarStringTo(`
    export type MyDirectiveDirectiveResolver<Result, Parent, ContextType = any, Args = MyDirectiveDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;`);

    expect(result.content).toBeSimilarStringTo(`
      export type MyOtherTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['MyOtherType'] = ResolversParentTypes['MyOtherType']> = {
        bar?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
        __isTypeOf?: IsTypeOfResolverFn<ParentType>;
      };
    `);

    expect(result.content)
      .toBeSimilarStringTo(`export interface MyScalarScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['MyScalar'], any> {
      name: 'MyScalar';
    }`);

    expect(result.content).toBeSimilarStringTo(`
      export type MyTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['MyType'] = ResolversParentTypes['MyType']> = {
        foo?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
        otherType?: Resolver<Maybe<ResolversTypes['MyOtherType']>, ParentType, ContextType>;
        withArgs?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MyTypeWithArgsArgs, 'arg2'>>;
        __isTypeOf?: IsTypeOfResolverFn<ParentType>;
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
        __isTypeOf?: IsTypeOfResolverFn<ParentType>;
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type SubscriptionResolvers<ContextType = any, ParentType extends ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription']> = {
        somethingChanged?: SubscriptionResolver<Maybe<ResolversTypes['MyOtherType']>, "somethingChanged", ParentType, ContextType>;
      };
    `);

    await validate(result);
  });

  it('Should generate basic type resolvers with avoidOptionals', async () => {
    const result = (await plugin(
      schema,
      [],
      { avoidOptionals: true },
      { outputFile: '' }
    )) as Types.ComplexPluginOutput;

    expect(result.content).toBeSimilarStringTo(`
    export type MyDirectiveDirectiveArgs = {   arg: Scalars['Int'];
    arg2: Scalars['String'];
    arg3: Scalars['Boolean']; };`);

    expect(result.content).toBeSimilarStringTo(`
    export type MyDirectiveDirectiveResolver<Result, Parent, ContextType = any, Args = MyDirectiveDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;`);

    expect(result.content).toBeSimilarStringTo(`
      export type MyOtherTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['MyOtherType'] = ResolversParentTypes['MyOtherType']> = {
        bar: Resolver<ResolversTypes['String'], ParentType, ContextType>;
        __isTypeOf?: IsTypeOfResolverFn<ParentType>;
      };
    `);

    expect(result.content)
      .toBeSimilarStringTo(`export interface MyScalarScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['MyScalar'], any> {
      name: 'MyScalar';
    }`);

    expect(result.content).toBeSimilarStringTo(`
      export type MyTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['MyType'] = ResolversParentTypes['MyType']> = {
        foo: Resolver<ResolversTypes['String'], ParentType, ContextType>;
        otherType: Resolver<Maybe<ResolversTypes['MyOtherType']>, ParentType, ContextType>;
        withArgs: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MyTypeWithArgsArgs, 'arg2'>>;
        __isTypeOf?: IsTypeOfResolverFn<ParentType>;
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
        id: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
        something: Resolver<ResolversTypes['MyType'], ParentType, ContextType>;
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type SomeNodeResolvers<ContextType = any, ParentType extends ResolversParentTypes['SomeNode'] = ResolversParentTypes['SomeNode']> = {
        id: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
        __isTypeOf?: IsTypeOfResolverFn<ParentType>;
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type SubscriptionResolvers<ContextType = any, ParentType extends ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription']> = {
        somethingChanged: SubscriptionResolver<Maybe<ResolversTypes['MyOtherType']>, "somethingChanged", ParentType, ContextType>;
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
    export type MyDirectiveDirectiveArgs = {   arg: Scalars['Int'];
    arg2: Scalars['String'];
    arg3: Scalars['Boolean']; };
    `);

    expect(result.content).toBeSimilarStringTo(`
    export type MyDirectiveDirectiveResolver<Result, Parent, ContextType = MyCustomCtx, Args = MyDirectiveDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;`);

    expect(result.content).toBeSimilarStringTo(`
      export type MyOtherTypeResolvers<ContextType = MyCustomCtx, ParentType extends ResolversParentTypes['MyOtherType'] = ResolversParentTypes['MyOtherType']> = {
        bar?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
        __isTypeOf?: IsTypeOfResolverFn<ParentType>;
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type MyTypeResolvers<ContextType = MyCustomCtx, ParentType extends ResolversParentTypes['MyType'] = ResolversParentTypes['MyType']> = {
        foo?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
        otherType?: Resolver<Maybe<ResolversTypes['MyOtherType']>, ParentType, ContextType>;
        withArgs?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MyTypeWithArgsArgs, 'arg2'>>;
        __isTypeOf?: IsTypeOfResolverFn<ParentType>;
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type MyUnionResolvers<ContextType = MyCustomCtx, ParentType extends ResolversParentTypes['MyUnion'] = ResolversParentTypes['MyUnion']> = {
        __resolveType: TypeResolveFn<'MyType' | 'MyOtherType', ParentType, ContextType>;
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type NodeResolvers<ContextType = MyCustomCtx, ParentType extends ResolversParentTypes['Node'] = ResolversParentTypes['Node']> = {
        __resolveType: TypeResolveFn<'SomeNode', ParentType, ContextType>;
        id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type QueryResolvers<ContextType = MyCustomCtx, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
        something?: Resolver<ResolversTypes['MyType'], ParentType, ContextType>;
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type SomeNodeResolvers<ContextType = MyCustomCtx, ParentType extends ResolversParentTypes['SomeNode'] = ResolversParentTypes['SomeNode']> = {
        id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
        __isTypeOf?: IsTypeOfResolverFn<ParentType>;
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type SubscriptionResolvers<ContextType = MyCustomCtx, ParentType extends ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription']> = {
        somethingChanged?: SubscriptionResolver<Maybe<ResolversTypes['MyOtherType']>, "somethingChanged", ParentType, ContextType>;
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
    export type MyDirectiveDirectiveArgs = {   arg: Scalars['Int'];
    arg2: Scalars['String'];
    arg3: Scalars['Boolean']; };
    `);

    expect(result.content).toBeSimilarStringTo(`
    export type MyDirectiveDirectiveResolver<Result, Parent, ContextType = MyCustomCtx, Args = MyDirectiveDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;`);

    expect(result.content).toBeSimilarStringTo(`
      export type MyOtherTypeResolvers<ContextType = MyCustomCtx, ParentType extends ResolversParentTypes['MyOtherType'] = ResolversParentTypes['MyOtherType']> = {
        bar?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
        __isTypeOf?: IsTypeOfResolverFn<ParentType>;
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type MyTypeResolvers<ContextType = MyCustomCtx, ParentType extends ResolversParentTypes['MyType'] = ResolversParentTypes['MyType']> = {
        foo?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
        otherType?: Resolver<Maybe<ResolversTypes['MyOtherType']>, ParentType, ContextType>;
        withArgs?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MyTypeWithArgsArgs, 'arg2'>>;
        __isTypeOf?: IsTypeOfResolverFn<ParentType>;
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type MyUnionResolvers<ContextType = MyCustomCtx, ParentType extends ResolversParentTypes['MyUnion'] = ResolversParentTypes['MyUnion']> = {
        __resolveType: TypeResolveFn<'MyType' | 'MyOtherType', ParentType, ContextType>;
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type NodeResolvers<ContextType = MyCustomCtx, ParentType extends ResolversParentTypes['Node'] = ResolversParentTypes['Node']> = {
        __resolveType: TypeResolveFn<'SomeNode', ParentType, ContextType>;
        id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type QueryResolvers<ContextType = MyCustomCtx, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
        something?: Resolver<ResolversTypes['MyType'], ParentType, ContextType>;
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type SomeNodeResolvers<ContextType = MyCustomCtx, ParentType extends ResolversParentTypes['SomeNode'] = ResolversParentTypes['SomeNode']> = {
        id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
        __isTypeOf?: IsTypeOfResolverFn<ParentType>;
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type SubscriptionResolvers<ContextType = MyCustomCtx, ParentType extends ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription']> = {
        somethingChanged?: SubscriptionResolver<Maybe<ResolversTypes['MyOtherType']>, "somethingChanged", ParentType, ContextType>;
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
    export type MyDirectiveDirectiveArgs = {   arg: Scalars['Int'];
    arg2: Scalars['String'];
    arg3: Scalars['Boolean']; };
    `);

    expect(result.content).toBeSimilarStringTo(`
    export type MyDirectiveDirectiveResolver<Result, Parent, ContextType = ContextType, Args = MyDirectiveDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;`);

    expect(result.content).toBeSimilarStringTo(`
      export type MyOtherTypeResolvers<ContextType = ContextType, ParentType extends ResolversParentTypes['MyOtherType'] = ResolversParentTypes['MyOtherType']> = {
        bar?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
        __isTypeOf?: IsTypeOfResolverFn<ParentType>;
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type MyTypeResolvers<ContextType = ContextType, ParentType extends ResolversParentTypes['MyType'] = ResolversParentTypes['MyType']> = {
        foo?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
        otherType?: Resolver<Maybe<ResolversTypes['MyOtherType']>, ParentType, ContextType>;
        withArgs?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MyTypeWithArgsArgs, 'arg2'>>;
        __isTypeOf?: IsTypeOfResolverFn<ParentType>;
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type MyUnionResolvers<ContextType = ContextType, ParentType extends ResolversParentTypes['MyUnion'] = ResolversParentTypes['MyUnion']> = {
        __resolveType: TypeResolveFn<'MyType' | 'MyOtherType', ParentType, ContextType>;
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type NodeResolvers<ContextType = ContextType, ParentType extends ResolversParentTypes['Node'] = ResolversParentTypes['Node']> = {
        __resolveType: TypeResolveFn<'SomeNode', ParentType, ContextType>;
        id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type QueryResolvers<ContextType = ContextType, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
        something?: Resolver<ResolversTypes['MyType'], ParentType, ContextType>;
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type SomeNodeResolvers<ContextType = ContextType, ParentType extends ResolversParentTypes['SomeNode'] = ResolversParentTypes['SomeNode']> = {
        id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
        __isTypeOf?: IsTypeOfResolverFn<ParentType>;
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type SubscriptionResolvers<ContextType = ContextType, ParentType extends ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription']> = {
        somethingChanged?: SubscriptionResolver<Maybe<ResolversTypes['MyOtherType']>, "somethingChanged", ParentType, ContextType>;
      };
    `);

    await validate(result);
  });

  it('should generate named custom field level context type', async () => {
    const result = (await plugin(
      schema,
      [],
      {
        fieldContextTypes: [
          'MyType.foo#./my-file#ContextTypeOne',
          'Query.something#./my-file#ContextTypeTwo',
          'MyType.otherType#SpecialContextType',
        ],
      },
      { outputFile: '' }
    )) as Types.ComplexPluginOutput;

    expect(result.prepend).toContain(`import { ContextTypeOne, ContextTypeTwo } from './my-file';`);

    expect(result.content).toBeSimilarStringTo(`
      export type MyTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['MyType'] = ResolversParentTypes['MyType']> = {
        foo?: Resolver<ResolversTypes['String'], ParentType, ContextTypeOne>;
        otherType?: Resolver<Maybe<ResolversTypes['MyOtherType']>, ParentType, SpecialContextType>;
        withArgs?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MyTypeWithArgsArgs, 'arg2'>>;
        __isTypeOf?: IsTypeOfResolverFn<ParentType>;
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
        something?: Resolver<ResolversTypes['MyType'], ParentType, ContextTypeTwo>;
      };
    `);
  });

  it('Should generate the correct imports when schema has scalars', async () => {
    const testSchema = buildSchema(`scalar MyScalar`);
    const result = await plugin(testSchema, [], {}, { outputFile: '' });

    expect(result.prepend).toContain(
      `import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';`
    );
    await validate(result, {}, schema);
  });

  it('Should generate the correct imports when schema has no scalars', async () => {
    const testSchema = buildSchema(`type MyType { f: String }`);
    const result = await plugin(testSchema, [], {}, { outputFile: '' });

    expect(result.prepend).not.toContain(`import { GraphQLResolveInfo, GraphQLScalarTypeConfig } from 'graphql';`);
    await validate(result, {}, testSchema);
  });

  it('Should generate the correct imports when customResolveInfo defined in config', async () => {
    const testSchema = buildSchema(`scalar MyScalar`);
    const result = (await plugin(
      testSchema,
      [],
      {
        customResolveInfo: './my-type#MyGraphQLResolveInfo',
      },
      { outputFile: '' }
    )) as Types.ComplexPluginOutput;

    expect(result.prepend).toContain(`import { GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';`);
    expect(result.prepend).toContain(`import { MyGraphQLResolveInfo as GraphQLResolveInfo } from './my-type';`);
    await validate(result, {}, testSchema);
  });

  describe('Should generate the correct imports when customResolverFn defined in config', () => {
    it('./my-type#MyResolverFn', async () => {
      const testSchema = buildSchema(`scalar MyScalar`);
      const result = (await plugin(
        testSchema,
        [],
        {
          customResolverFn: './my-type#MyResolverFn',
        },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;

      expect(result.prepend).toContain(`import { MyResolverFn as ResolverFn } from './my-type';`);
      expect(result.prepend).toContain(`export { ResolverFn };`);
      await validate(result, {}, testSchema);
    });

    it('./my-type#ResolverFn', async () => {
      const testSchema = buildSchema(`scalar MyScalar`);
      const result = (await plugin(
        testSchema,
        [],
        {
          customResolverFn: './my-type#ResolverFn',
        },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;

      expect(result.prepend).toContain(`import { ResolverFn } from './my-type';`);
      expect(result.prepend).toContain(`export { ResolverFn };`);
      await validate(result, {}, testSchema);
    });

    it(`definition directly`, async () => {
      const testSchema = buildSchema(`scalar MyScalar`);
      const fnDefinition = `(
        parent: TParent,
        args: TArgs,
        context: TContext,
        info: GraphQLResolveInfo & { nestedStuff: GraphQLResolveInfo }
      ) => Promise<TResult> | TResult;
      `;
      const result = (await plugin(
        testSchema,
        [],
        {
          customResolverFn: fnDefinition,
        },
        { outputFile: '' }
      )) as Types.ComplexPluginOutput;

      expect(result.prepend).toContain(`export type ResolverFn<TResult, TParent, TContext, TArgs> = ${fnDefinition}`);
      await validate(result, {}, testSchema);
    });

    it(`ok with default`, async () => {
      const testSchema = buildSchema(`scalar MyScalar`);
      const defaultResolverFn = `
export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;`;
      const result = await plugin(testSchema, [], {}, { outputFile: '' });

      expect(result.content).toContain(defaultResolverFn);
      await validate(result, {}, testSchema);
    });
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
    const content = await plugin(testSchema, [], {}, { outputFile: 'graphql.ts' });

    expect(content.content).toBeSimilarStringTo(`CCCUnion: ResolversTypes['CCCFoo'] | ResolversTypes['CCCBar']`); // In ResolversTypes
    expect(content.content).toBeSimilarStringTo(`
    export type CccUnionResolvers<ContextType = any, ParentType extends ResolversParentTypes['CCCUnion'] = ResolversParentTypes['CCCUnion']> = {
      __resolveType: TypeResolveFn<'CCCFoo' | 'CCCBar', ParentType, ContextType>;
    };
    `);

    await validateTs(mergeOutputs([tsContent, content]));
  });

  it('Should generate the correct resolver args type names when typesPrefix is specified', async () => {
    const testSchema = buildSchema(`type MyType { f(a: String): String }`);
    const config = { typesPrefix: 'T' };
    const result = await plugin(testSchema, [], config, { outputFile: '' });

    expect(result.content).toBeSimilarStringTo(
      `f?: Resolver<Maybe<TResolversTypes['String']>, ParentType, ContextType, RequireFields<TMyTypeFArgs, never>>;`
    );
    await validate(result, config, testSchema);
  });

  // dotansimha/graphql-code-generator#3322
  it('should make list of all-optional arguments include undefined types', async () => {
    const testSchema = buildSchema(`type MyType { f(a: String, b: Int): String }`);
    const result = await plugin(testSchema, [], {}, { outputFile: '' });

    expect(result.content).toBeSimilarStringTo(
      `f?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MyTypeFArgs, never>>;`
    );
    await validate(result, {}, testSchema);
  });

  // dotansimha/graphql-code-generator#3322
  it('should include generic wrapper type only when necessary', async () => {
    const testSchema = buildSchema(`type MyType { f: String }`);
    const result = await plugin(testSchema, [], {}, { outputFile: '' });

    expect(result.content).toBeSimilarStringTo(
      `f?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;`
    );
    await validate(result, {}, testSchema);
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
        Date?: GraphQLScalarType;
        Query?: QueryResolvers<ContextType>;
        Node?: NodeResolvers;
        PostOrUser?: PostOrUserResolvers;
        Post?: PostResolvers<ContextType>;
        User?: UserResolvers<ContextType>;
      };
    `);

    expect(content.content).toBeSimilarStringTo(`
      export type DirectiveResolvers<ContextType = any> = {
        modify?: ModifyDirectiveResolver<any, any, ContextType>;
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
        import { makeExecutableSchema } from '@graphql-tools/schema';

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
        import { makeExecutableSchema } from '@graphql-tools/schema';

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
    const content = await plugin(testSchema, [], {}, { outputFile: 'graphql.ts' });

    expect(content.content).toBeSimilarStringTo(`
      export type ResolversTypes = {
        String: ResolverTypeWrapper<Scalars['String']>;
        Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
        Subscription: ResolverTypeWrapper<{}>;
        Query: ResolverTypeWrapper<{}>;
        Mutation: ResolverTypeWrapper<{}>;
        Post: ResolverTypeWrapper<Post>;
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
    const content = await plugin(testSchema, [], {}, { outputFile: 'graphql.ts' });

    expect(content.content).toBeSimilarStringTo(`
      export type ResolversParentTypes = {
        String: Scalars['String'];
        Boolean: Scalars['Boolean'];
        Subscription: {};
        Query: {};
        Mutation: {};
        Post: Post;
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
        String: ResolverTypeWrapper<Scalars['String']>;
        Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
        Subscription: ResolverTypeWrapper<RootValueType>;
        Query: ResolverTypeWrapper<RootValueType>;
        Mutation: ResolverTypeWrapper<RootValueType>;
        Post: ResolverTypeWrapper<Post>;
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
        String: ResolverTypeWrapper<Scalars['String']>;
        Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
        MySubscription: ResolverTypeWrapper<MyRoot>;
        MyQuery: ResolverTypeWrapper<MyRoot>;
        MyMutation: ResolverTypeWrapper<MyRoot>;
        Post: ResolverTypeWrapper<Post>;
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

    const result = await plugin(schemaWithNoImplementors, [], {}, { outputFile: '' });

    expect(result.content).toBeSimilarStringTo(`
      export type NodeResolvers<ContextType = any, ParentType extends ResolversParentTypes['Node'] = ResolversParentTypes['Node']> = {
        __resolveType: TypeResolveFn<null, ParentType, ContextType>;
        id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
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
    const resolversContent = (await plugin(
      testSchema,
      [],
      {},
      { outputFile: 'graphql.ts' }
    )) as Types.ComplexPluginOutput;

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

  describe('issues', () => {
    it('should work correctly with enumPrefix: false - issue #2679', async () => {
      const testSchema = buildSchema(/* GraphQL */ `
        type Query {
          t: Test
        }

        enum Test {
          A
          B
          C
        }
      `);

      const config = {
        typesPrefix: 'I',
        enumPrefix: false,
        namingConvention: 'keep',
        constEnums: true,
      };
      const output = await plugin(testSchema, [], config, { outputFile: 'graphql.ts' });
      const o = await validate(output, config, testSchema);

      expect(o).toBeSimilarStringTo(`
      export const enum Test {
        A = 'A',
        B = 'B',
        C = 'C'
      };`);
      expect(o).toBeSimilarStringTo(`
      export type IResolversTypes = {
        String: ResolverTypeWrapper<Scalars['String']>;
        Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
        Query: ResolverTypeWrapper<{}>;
        Test: Test;
      };`);
    });

    it('should keep non-optional arguments non-optional - issue #2323', async () => {
      const testSchema = buildSchema(/* GraphQL */ `
        enum OrderBy {
          name
          id
        }

        input Filter {
          contain: String
        }

        type Node {
          id: ID!
          name: String!
        }

        type Connection {
          nodes: [Node]
        }

        type Query {
          list(after: String, orderBy: OrderBy = name, filter: Filter!): Connection!
        }
      `);

      const output = (await plugin(
        testSchema,
        [],
        {
          avoidOptionals: false,
          maybeValue: 'T | undefined',
        } as any,
        { outputFile: 'graphql.ts' }
      )) as Types.ComplexPluginOutput;

      // filter should be non-optional
      expect(output.content).toBeSimilarStringTo(`
        export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
          list?: Resolver<ResolversTypes['Connection'], ParentType, ContextType, RequireFields<QueryListArgs, 'orderBy' | 'filter'>>;
        };
      `);
    });

    it('#3257 - should not import mapper when its already imported because of enumValues', async () => {
      const testSchema = buildSchema(/* GraphQL */ `
        schema {
          query: Query
        }

        type Query {
          role: [ProjectRoleDetail!]!
        }

        enum ProjectRole {
          PROJECT_MANAGER
          ETC
        }

        type ProjectRoleDetail {
          code: ProjectRole!
          name: String!
        }
      `);

      const config = {
        noSchemaStitching: true,
        contextType: '@src/context#Context',
        useIndexSignature: true,
        avoidOptionals: true,
        mappers: {
          ProjectRoleDetail: '../entities#ProjectRole',
        },
        enumValues: {
          ProjectRole: '../entities#ProjectRole',
        },
      };

      const tsContent = (await tsPlugin(testSchema, [], config, {
        outputFile: 'graphql.ts',
      })) as Types.ComplexPluginOutput;
      const output = await plugin(testSchema, [], config, { outputFile: 'graphql.ts' });

      expect(output.prepend.filter(t => t.includes('import')).length).toBe(2);
      expect(output.prepend.filter(t => t.includes('ProjectRole')).length).toBe(0);
      expect(tsContent.prepend.filter(t => t.includes('ProjectRole')).length).toBe(1);
      expect(tsContent.prepend.includes(`import { ProjectRole } from '../entities';`)).toBeTruthy();
      expect(output.prepend.includes(`import { ProjectRole } from '../entities';`)).toBeFalsy();
    });

    it('#3264 - enumValues is not being applied to directive resolver', async () => {
      const testSchema = buildSchema(/* GraphQL */ `
        directive @auth(
          role: UserRole = ADMIN
        ) on OBJECT | FIELD_DEFINITION | ARGUMENT_DEFINITION | INPUT_FIELD_DEFINITION

        enum UserRole {
          ADMIN
          USER
        }

        schema {
          query: Query
        }

        type Query {
          me: User!
        }

        type User {
          id: ID!
          username: String!
          email: String!
          role: UserRole!
        }
      `);

      const output = (await plugin(
        testSchema,
        [],
        {
          noSchemaStitching: true,
          typesPrefix: 'Gql',
          maybeValue: 'T | undefined',
          enumValues: {
            UserRole: '@org/package#UserRole',
          },
        } as any,
        { outputFile: 'graphql.ts' }
      )) as Types.ComplexPluginOutput;

      expect(output.content).toContain(`export type GqlAuthDirectiveArgs = {   role?: Maybe<UserRole>; };`);
      expect(output.content).toContain(
        `export type GqlAuthDirectiveResolver<Result, Parent, ContextType = any, Args = GqlAuthDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;`
      );
    });
  });
});
