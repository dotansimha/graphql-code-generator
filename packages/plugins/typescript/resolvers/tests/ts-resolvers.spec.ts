import { mergeOutputs, Types } from '@graphql-codegen/plugin-helpers';
import { resolversTestingSchema, resolversTestingValidate, validateTs } from '@graphql-codegen/testing';
import { buildSchema } from 'graphql';
import { plugin as tsPlugin } from '../../typescript/src/index.js';
import { plugin } from '../src/index.js';
import { ENUM_RESOLVERS_SIGNATURE } from '../src/visitor.js';

describe('TypeScript Resolvers Plugin', () => {
  describe('Backward Compatability', () => {
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

  it('Should use StitchingResolver when its active on config', async () => {
    const result = await plugin(resolversTestingSchema, [], { noSchemaStitching: false }, { outputFile: '' });

    expect(result.content).toBeSimilarStringTo(`export type StitchingResolver<TResult, TParent, TContext, TArgs>`);
    expect(result.content).toBeSimilarStringTo(`
      export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
        | ResolverFn<TResult, TParent, TContext, TArgs>
        | ResolverWithResolve<TResult, TParent, TContext, TArgs>
        | StitchingResolver<TResult, TParent, TContext, TArgs>;
    `);

    await resolversTestingValidate(result);
  });

  describe('Config', () => {
    it('onlyResolveTypeForInterfaces - should allow to have only resolveType for interfaces', async () => {
      const config = {
        onlyResolveTypeForInterfaces: true,
      };
      const result = await plugin(resolversTestingSchema, [], config, { outputFile: '' });
      const content = await resolversTestingValidate(result, config, resolversTestingSchema);

      expect(content).toBeSimilarStringTo(`
      export type NodeResolvers<ContextType = any, ParentType extends ResolversParentTypes['Node'] = ResolversParentTypes['Node']> = {
        __resolveType: TypeResolveFn<'SomeNode', ParentType, ContextType>;
      };`);
    });

    it('optionalInfoArgument - should allow to have optional info argument', async () => {
      const config = {
        noSchemaStitching: true,
        useIndexSignature: true,
        optionalInfoArgument: true,
      };
      const result = await plugin(resolversTestingSchema, [], config, { outputFile: '' });

      const content = await resolversTestingValidate(result, config, resolversTestingSchema);

      expect(content).not.toContain(`info: `);
      expect(content).toContain(`info?: `);
      expect(content).toMatchSnapshot();
    });

    it('allowParentTypeOverride - should allow to have less strict resolvers by overrding parent type', async () => {
      const config = {
        noSchemaStitching: true,
        useIndexSignature: true,
        allowParentTypeOverride: true,
      };
      const result = await plugin(resolversTestingSchema, [], config, { outputFile: '' });

      const content = await resolversTestingValidate(
        result,
        config,
        resolversTestingSchema,
        `
        export const myTypeResolvers: MyTypeResolvers<{}, { parentOverride: boolean }> = {
          foo: (parentValue) => {
            const a: boolean = parentValue.parentOverride;

            return a.toString();
          }
        };
      `
      );

      expect(content).not.toContain(`ParentType extends `);
      expect(content).toContain(`ParentType = `);
      expect(content).toMatchSnapshot();
    });

    it('namespacedImportName - should work correctly with imported namespaced type', async () => {
      const config = {
        noSchemaStitching: true,
        useIndexSignature: true,
        namespacedImportName: 'Types',
      };
      const result = await plugin(resolversTestingSchema, [], config, { outputFile: '' });
      const content = mergeOutputs([result]);
      expect(content).toMatchSnapshot();
    });

    it('directiveResolverMappings - should generate correct types (inline definition)', async () => {
      const config = {
        noSchemaStitching: true,
        directiveResolverMappings: {
          authenticated: `
(
  parent: TParent,
  args: TArgs,
  context: AuthenticatedContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;`,
        },
      };
      const result = await plugin(resolversTestingSchema, [], config, { outputFile: '' });
      expect(result.content).toBeSimilarStringTo(`
export type ResolverFnAuthenticated<TResult, TParent, TContext, TArgs> =
(
  parent: TParent,
  args: TArgs,
  context: AuthenticatedContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type ResolverAuthenticatedWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFnAuthenticated<TResult, TParent, TContext, TArgs>;
};
export type ResolverAuthenticated<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFnAuthenticated<TResult, TParent, TContext, TArgs> | ResolverAuthenticatedWithResolve<TResult, TParent, TContext, TArgs>;
`);
      expect(result.content).toBeSimilarStringTo(`
export type MyTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['MyType'] = ResolversParentTypes['MyType']> = {
  foo?: ResolverAuthenticated<ResolversTypes['String'], ParentType, ContextType>;
  otherType?: Resolver<Maybe<ResolversTypes['MyOtherType']>, ParentType, ContextType>;
  withArgs?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MyTypeWithArgsArgs, 'arg2'>>;
  unionChild?: Resolver<Maybe<ResolversTypes['ChildUnion']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};
      `);
    });

    it('makeResolverTypeCallable - should remove ResolverWithResolve type from resolver union', async () => {
      const result = await plugin(resolversTestingSchema, [], { makeResolverTypeCallable: true }, { outputFile: '' });

      expect(result.content).toBeSimilarStringTo(`
      export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
      ResolverFn<TResult, TParent, TContext, TArgs>;
    `);

      expect(result.content).not.toBeSimilarStringTo(`
      export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
      ResolverFn<TResult, TParent, TContext, TArgs>
      | ResolverWithResolve<TResult, TParent, TContext, TArgs>;
    `);

      await resolversTestingValidate(result);
    });

    it('makeResolverTypeCallable - adds ResolverWithResolve type to resolver union when set to false', async () => {
      const result = await plugin(resolversTestingSchema, [], { makeResolverTypeCallable: false }, { outputFile: '' });

      expect(result.content).not.toBeSimilarStringTo(`
      export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
      ResolverFn<TResult, TParent, TContext, TArgs>;
    `);

      expect(result.content).toBeSimilarStringTo(`
      export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
      ResolverFn<TResult, TParent, TContext, TArgs>
      | ResolverWithResolve<TResult, TParent, TContext, TArgs>;
    `);

      await resolversTestingValidate(result);
    });
  });

  it('directiveResolverMappings - should generate correct types (import definition)', async () => {
    const config = {
      noSchemaStitching: true,
      directiveResolverMappings: {
        authenticated: `../resolver-types.ts#AuthenticatedResolver`,
      },
    };
    const result = await plugin(resolversTestingSchema, [], config, { outputFile: '' });
    expect(result.prepend).toContain(
      "import { AuthenticatedResolver as ResolverFnAuthenticated } from '../resolver-types.ts';"
    );
    expect(result.prepend).toContain('export { ResolverFnAuthenticated };');
    expect(result.content).toBeSimilarStringTo(`
export type ResolverAuthenticatedWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFnAuthenticated<TResult, TParent, TContext, TArgs>;
};
export type ResolverAuthenticated<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFnAuthenticated<TResult, TParent, TContext, TArgs> | ResolverAuthenticatedWithResolve<TResult, TParent, TContext, TArgs>;
`);
    expect(result.content).toBeSimilarStringTo(`
export type MyTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['MyType'] = ResolversParentTypes['MyType']> = {
foo?: ResolverAuthenticated<ResolversTypes['String'], ParentType, ContextType>;
otherType?: Resolver<Maybe<ResolversTypes['MyOtherType']>, ParentType, ContextType>;
withArgs?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MyTypeWithArgsArgs, 'arg2'>>;
unionChild?: Resolver<Maybe<ResolversTypes['ChildUnion']>, ParentType, ContextType>;
__isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};
    `);
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
      const mergedOutput = await resolversTestingValidate(
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

      const mergedOutput = await resolversTestingValidate(
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

      const mergedOutput = await resolversTestingValidate(
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

      const mergedOutput = await resolversTestingValidate(
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

      const mergedOutput = await resolversTestingValidate(
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

  it('Should allow to override ResolverTypeWrapper signature', async () => {
    const result = (await plugin(
      resolversTestingSchema,
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
      resolversTestingSchema,
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
    const result = await plugin(resolversTestingSchema, [], {}, { outputFile: '' });

    expect(spy).not.toHaveBeenCalled();

    spy.mockRestore();

    await resolversTestingValidate(result);
  });

  it('Should disable StitchingResolver on demand', async () => {
    const result = (await plugin(
      resolversTestingSchema,
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
        | ResolverWithResolve<TResult, TParent, TContext, TArgs>
        | StitchingResolver<TResult, TParent, TContext, TArgs>;
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
        ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;
    `);

    await resolversTestingValidate(result);
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
  });

  it('Test for enum usage in resolvers (to verify compatibility with enumValues)', async () => {
    const testSchema = buildSchema(/* GraphQL */ `
      type Query {
        a: A
        c: C
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

      enum C {
        Y
        Z
      }
    `);

    const config = {
      enumValues: {
        A: 'MyA',
        C: '../enums.js#MyC',
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
    expect(mergedOutputs).not.toContain(`C: GQL_MyC;`);
    expect(mergedOutputs).toContain(`NotMapped: GQL_NotMapped;`);
    expect(mergedOutputs).not.toContain(`NotMapped: NotMapped;`);
    expect(mergedOutputs).toContain(`A: MyA;`);
    expect(mergedOutputs).toContain(`B: GQL_B;`);
    expect(mergedOutputs).toContain(`C: C;`);
    expect(mergedOutputs).toContain(`import { MyC as C } from '../enums.js';`);
  });

  it('Should allow to generate optional __resolveType', async () => {
    const result = (await plugin(
      resolversTestingSchema,
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
    const result = await plugin(resolversTestingSchema, [], {}, { outputFile: '' });

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
    }`);

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

  it('Should allow to override context with simple identifier', async () => {
    const result = (await plugin(
      resolversTestingSchema,
      [],
      {
        contextType: 'MyCustomCtx',
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
    export type MyDirectiveDirectiveResolver<Result, Parent, ContextType = MyCustomCtx, Args = MyDirectiveDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;`);

    expect(result.content).toBeSimilarStringTo(`
      export type MyOtherTypeResolvers<ContextType = MyCustomCtx, ParentType extends ResolversParentTypes['MyOtherType'] = ResolversParentTypes['MyOtherType']> = {
        bar?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
        __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type MyTypeResolvers<ContextType = MyCustomCtx, ParentType extends ResolversParentTypes['MyType'] = ResolversParentTypes['MyType']> = {
        foo?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
        otherType?: Resolver<Maybe<ResolversTypes['MyOtherType']>, ParentType, ContextType>;
        withArgs?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MyTypeWithArgsArgs, 'arg2'>>;
        unionChild?: Resolver<Maybe<ResolversTypes['ChildUnion']>, ParentType, ContextType>;
        __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
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
        __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type SubscriptionResolvers<ContextType = MyCustomCtx, ParentType extends ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription']> = {
        somethingChanged?: SubscriptionResolver<Maybe<ResolversTypes['MyOtherType']>, "somethingChanged", ParentType, ContextType>;
      };
    `);

    await resolversTestingValidate(mergeOutputs([result, `type MyCustomCtx = {};`]));
  });

  it('Should with correctly with addUnderscoreToArgsType set to true', async () => {
    const result = (await plugin(
      resolversTestingSchema,
      [],
      {
        addUnderscoreToArgsType: true,
      },
      { outputFile: '' }
    )) as Types.ComplexPluginOutput;

    expect(result.content).toContain('MyType_WithArgsArgs');
    expect(result.content).not.toContain('MyTypeWithArgsArgs');

    await resolversTestingValidate(mergeOutputs([result]));
  });

  it('Should allow to override context with mapped context type', async () => {
    const result = (await plugin(
      resolversTestingSchema,
      [],
      {
        contextType: './my-file#MyCustomCtx',
      },
      { outputFile: '' }
    )) as Types.ComplexPluginOutput;

    expect(result.prepend).toContain(`import { MyCustomCtx } from './my-file';`);

    expect(result.content).toBeSimilarStringTo(`
    export type MyDirectiveDirectiveArgs = {
      arg: Scalars['Int']['input'];
      arg2: Scalars['String']['input'];
      arg3: Scalars['Boolean']['input'];
    };
    `);

    expect(result.content).toBeSimilarStringTo(`
    export type MyDirectiveDirectiveResolver<Result, Parent, ContextType = MyCustomCtx, Args = MyDirectiveDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;`);

    expect(result.content).toBeSimilarStringTo(`
      export type MyOtherTypeResolvers<ContextType = MyCustomCtx, ParentType extends ResolversParentTypes['MyOtherType'] = ResolversParentTypes['MyOtherType']> = {
        bar?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
        __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type MyTypeResolvers<ContextType = MyCustomCtx, ParentType extends ResolversParentTypes['MyType'] = ResolversParentTypes['MyType']> = {
        foo?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
        otherType?: Resolver<Maybe<ResolversTypes['MyOtherType']>, ParentType, ContextType>;
        withArgs?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MyTypeWithArgsArgs, 'arg2'>>;
        unionChild?: Resolver<Maybe<ResolversTypes['ChildUnion']>, ParentType, ContextType>;
        __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
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
        __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type SubscriptionResolvers<ContextType = MyCustomCtx, ParentType extends ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription']> = {
        somethingChanged?: SubscriptionResolver<Maybe<ResolversTypes['MyOtherType']>, "somethingChanged", ParentType, ContextType>;
      };
    `);

    await resolversTestingValidate(result);
  });

  it('Should allow to override context with mapped context type', async () => {
    const result = (await plugin(
      resolversTestingSchema,
      [],
      {
        contextType: './my-file#MyCustomCtx',
      },
      { outputFile: '' }
    )) as Types.ComplexPluginOutput;

    expect(result.prepend).toContain(`import { MyCustomCtx } from './my-file';`);

    expect(result.content).toBeSimilarStringTo(`
    export type MyDirectiveDirectiveArgs = {
      arg: Scalars['Int']['input'];
      arg2: Scalars['String']['input'];
      arg3: Scalars['Boolean']['input'];
    };
    `);

    expect(result.content).toBeSimilarStringTo(`
    export type MyDirectiveDirectiveResolver<Result, Parent, ContextType = MyCustomCtx, Args = MyDirectiveDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;`);

    expect(result.content).toBeSimilarStringTo(`
      export type MyOtherTypeResolvers<ContextType = MyCustomCtx, ParentType extends ResolversParentTypes['MyOtherType'] = ResolversParentTypes['MyOtherType']> = {
        bar?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
        __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type MyTypeResolvers<ContextType = MyCustomCtx, ParentType extends ResolversParentTypes['MyType'] = ResolversParentTypes['MyType']> = {
        foo?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
        otherType?: Resolver<Maybe<ResolversTypes['MyOtherType']>, ParentType, ContextType>;
        withArgs?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MyTypeWithArgsArgs, 'arg2'>>;
        unionChild?: Resolver<Maybe<ResolversTypes['ChildUnion']>, ParentType, ContextType>;
        __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
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
        __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type SubscriptionResolvers<ContextType = MyCustomCtx, ParentType extends ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription']> = {
        somethingChanged?: SubscriptionResolver<Maybe<ResolversTypes['MyOtherType']>, "somethingChanged", ParentType, ContextType>;
      };
    `);

    await resolversTestingValidate(result);
  });
  it('Should allow to override context with mapped context type as default export', async () => {
    const result = (await plugin(
      resolversTestingSchema,
      [],
      {
        contextType: './my-file#default',
      },
      { outputFile: '' }
    )) as Types.ComplexPluginOutput;

    expect(result.prepend).toContain(`import ContextType from './my-file';`);

    expect(result.content).toBeSimilarStringTo(`
    export type MyDirectiveDirectiveArgs = {
      arg: Scalars['Int']['input'];
      arg2: Scalars['String']['input'];
      arg3: Scalars['Boolean']['input'];
    };
    `);

    expect(result.content).toBeSimilarStringTo(`
    export type MyDirectiveDirectiveResolver<Result, Parent, ContextType = ContextType, Args = MyDirectiveDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;`);

    expect(result.content).toBeSimilarStringTo(`
      export type MyOtherTypeResolvers<ContextType = ContextType, ParentType extends ResolversParentTypes['MyOtherType'] = ResolversParentTypes['MyOtherType']> = {
        bar?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
        __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type MyTypeResolvers<ContextType = ContextType, ParentType extends ResolversParentTypes['MyType'] = ResolversParentTypes['MyType']> = {
        foo?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
        otherType?: Resolver<Maybe<ResolversTypes['MyOtherType']>, ParentType, ContextType>;
        withArgs?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MyTypeWithArgsArgs, 'arg2'>>;
        unionChild?: Resolver<Maybe<ResolversTypes['ChildUnion']>, ParentType, ContextType>;
        __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
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
        __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type SubscriptionResolvers<ContextType = ContextType, ParentType extends ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription']> = {
        somethingChanged?: SubscriptionResolver<Maybe<ResolversTypes['MyOtherType']>, "somethingChanged", ParentType, ContextType>;
      };
    `);

    await resolversTestingValidate(result);
  });
  it('Should allow to override context with mapped context type as default export with type import', async () => {
    const result = (await plugin(
      resolversTestingSchema,
      [],
      {
        contextType: './my-file#default',
        useTypeImports: true,
      },
      { outputFile: '' }
    )) as Types.ComplexPluginOutput;

    expect(result.prepend).toContain(`import type { default as ContextType } from './my-file';`);

    expect(result.content).toBeSimilarStringTo(`
    export type MyDirectiveDirectiveArgs = {
      arg: Scalars['Int']['input'];
      arg2: Scalars['String']['input'];
      arg3: Scalars['Boolean']['input'];
    };
    `);

    expect(result.content).toBeSimilarStringTo(`
    export type MyDirectiveDirectiveResolver<Result, Parent, ContextType = ContextType, Args = MyDirectiveDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;`);

    expect(result.content).toBeSimilarStringTo(`
      export type MyOtherTypeResolvers<ContextType = ContextType, ParentType extends ResolversParentTypes['MyOtherType'] = ResolversParentTypes['MyOtherType']> = {
        bar?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
        __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type MyTypeResolvers<ContextType = ContextType, ParentType extends ResolversParentTypes['MyType'] = ResolversParentTypes['MyType']> = {
        foo?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
        otherType?: Resolver<Maybe<ResolversTypes['MyOtherType']>, ParentType, ContextType>;
        withArgs?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MyTypeWithArgsArgs, 'arg2'>>;
        unionChild?: Resolver<Maybe<ResolversTypes['ChildUnion']>, ParentType, ContextType>;
        __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
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
        __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type SubscriptionResolvers<ContextType = ContextType, ParentType extends ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription']> = {
        somethingChanged?: SubscriptionResolver<Maybe<ResolversTypes['MyOtherType']>, "somethingChanged", ParentType, ContextType>;
      };
    `);

    await resolversTestingValidate(result);
  });

  it('should generate named custom field level context type', async () => {
    const result = (await plugin(
      resolversTestingSchema,
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
        unionChild?: Resolver<Maybe<ResolversTypes['ChildUnion']>, ParentType, ContextType>;
        __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
        something?: Resolver<ResolversTypes['MyType'], ParentType, ContextTypeTwo>;
      };
    `);
  });

  it('should generate named custom field level context type for field with directive', async () => {
    const result = (await plugin(
      resolversTestingSchema,
      [],
      {
        directiveContextTypes: ['authenticated#./my-file#AuthenticatedContext'],
      },
      { outputFile: '' }
    )) as Types.ComplexPluginOutput;

    expect(result.prepend).toContain(`import { AuthenticatedContext } from './my-file';`);

    expect(result.content).toBeSimilarStringTo(`
      export type MyTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['MyType'] = ResolversParentTypes['MyType']> = {
        foo?: Resolver<ResolversTypes['String'], ParentType, AuthenticatedContext<ContextType>>;
        otherType?: Resolver<Maybe<ResolversTypes['MyOtherType']>, ParentType, ContextType>;
        withArgs?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MyTypeWithArgsArgs, 'arg2'>>;
        unionChild?: Resolver<Maybe<ResolversTypes['ChildUnion']>, ParentType, ContextType>;
        __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
      };
    `);
  });

  it('should generate named custom field level context type for field with directive and context type', async () => {
    const result = (await plugin(
      resolversTestingSchema,
      [],
      {
        directiveContextTypes: ['authenticated#./my-file#AuthenticatedContext'],
        contextType: './my-file#MyCustomCtx',
      },
      { outputFile: '' }
    )) as Types.ComplexPluginOutput;

    expect(result.prepend).toContain(`import { MyCustomCtx, AuthenticatedContext } from './my-file';`);

    expect(result.content).toBeSimilarStringTo(`
      export type MyTypeResolvers<ContextType = MyCustomCtx, ParentType extends ResolversParentTypes['MyType'] = ResolversParentTypes['MyType']> = {
        foo?: Resolver<ResolversTypes['String'], ParentType, AuthenticatedContext<ContextType>>;
        otherType?: Resolver<Maybe<ResolversTypes['MyOtherType']>, ParentType, ContextType>;
        withArgs?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MyTypeWithArgsArgs, 'arg2'>>;
        unionChild?: Resolver<Maybe<ResolversTypes['ChildUnion']>, ParentType, ContextType>;
        __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
      };
    `);
  });

  it('should generate named custom field level context type for field with directive and field context type', async () => {
    const result = (await plugin(
      resolversTestingSchema,
      [],
      {
        directiveContextTypes: ['authenticated#./my-file#AuthenticatedContext'],
        fieldContextTypes: ['MyType.foo#./my-file#ContextTypeOne'],
      },
      { outputFile: '' }
    )) as Types.ComplexPluginOutput;

    expect(result.prepend).toContain(`import { ContextTypeOne, AuthenticatedContext } from './my-file';`);

    expect(result.content).toBeSimilarStringTo(`
      export type MyTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['MyType'] = ResolversParentTypes['MyType']> = {
        foo?: Resolver<ResolversTypes['String'], ParentType, AuthenticatedContext<ContextTypeOne>>;
        otherType?: Resolver<Maybe<ResolversTypes['MyOtherType']>, ParentType, ContextType>;
        withArgs?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MyTypeWithArgsArgs, 'arg2'>>;
        unionChild?: Resolver<Maybe<ResolversTypes['ChildUnion']>, ParentType, ContextType>;
        __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
      };
    `);
  });

  it('Should generate the correct imports when schema has scalars', async () => {
    const testSchema = buildSchema(`scalar MyScalar`);
    const result = await plugin(testSchema, [], {}, { outputFile: '' });

    expect(result.prepend).toContain(
      `import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';`
    );
    await resolversTestingValidate(result, {}, resolversTestingSchema);
  });

  it('Should generate the correct imports when schema has no scalars', async () => {
    const testSchema = buildSchema(`type MyType { f: String }`);
    const result = await plugin(testSchema, [], {}, { outputFile: '' });

    expect(result.prepend).not.toContain(`import { GraphQLResolveInfo, GraphQLScalarTypeConfig } from 'graphql';`);
    await resolversTestingValidate(result, {}, testSchema);
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
    await resolversTestingValidate(result, {}, testSchema);
  });

  it('#8852 - should generate the correct imports when customResolveInfo defined in config with type import', async () => {
    const testSchema = buildSchema(`scalar MyScalar`);
    const result = (await plugin(
      testSchema,
      [],
      {
        customResolveInfo: './my-type#MyGraphQLResolveInfo',
        useTypeImports: true,
      },
      { outputFile: '' }
    )) as Types.ComplexPluginOutput;

    expect(result.prepend).toContain(`import type { GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';`);
    expect(result.prepend).toContain(`import type { MyGraphQLResolveInfo as GraphQLResolveInfo } from './my-type';`);
    await resolversTestingValidate(result, {}, testSchema);
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
      await resolversTestingValidate(result, {}, testSchema);
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
      await resolversTestingValidate(result, {}, testSchema);
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
      await resolversTestingValidate(result, {}, testSchema);
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
      await resolversTestingValidate(result, {}, testSchema);
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

    const tsContent = await tsPlugin(testSchema, [], {}, { outputFile: 'graphql.ts' });
    const content = await plugin(testSchema, [], {}, { outputFile: 'graphql.ts' });

    expect(tsContent.content).toBeSimilarStringTo(`
      export type CccFoo = {
        __typename?: 'CCCFoo';
        foo: Scalars['String']['output'];
      };
    `);
    expect(tsContent.content).toBeSimilarStringTo(`
      export type CccBar = {
        __typename?: 'CCCBar';
        bar: Scalars['String']['output'];
      };
    `);

    expect(content.content).toBeSimilarStringTo(`
      export type ResolversUnionTypes<_RefType extends Record<string, unknown>> = {
        CCCUnion: ( CccFoo ) | ( CccBar );
      };
    `);
    expect(content.content).toBeSimilarStringTo(`
    /** Mapping between all available schema types and the resolvers types */
    export type ResolversTypes = {
      CCCFoo: ResolverTypeWrapper<CccFoo>;
      String: ResolverTypeWrapper<Scalars['String']['output']>;
      CCCBar: ResolverTypeWrapper<CccBar>;
      Query: ResolverTypeWrapper<{}>;
      CCCUnion: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['CCCUnion']>;
      Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
    };
    `);
    expect(content.content).toBeSimilarStringTo(`
      export type ResolversParentTypes = {
        CCCFoo: CccFoo;
        String: Scalars['String']['output'];
        CCCBar: CccBar;
        Query: {};
        CCCUnion: ResolversUnionTypes<ResolversParentTypes>['CCCUnion'];
        Boolean: Scalars['Boolean']['output'];
      };
    `);
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
    const o = await resolversTestingValidate(result, config, testSchema);

    expect(o).toContain(
      `f?: Resolver<Maybe<TResolversTypes['String']>, ParentType, ContextType, Partial<TMyTypeFArgs>>;`
    );
  });

  // dotansimha/graphql-code-generator#3322
  it('should make list of all-optional arguments include undefined types', async () => {
    const testSchema = buildSchema(`type MyType { f(a: String, b: Int): String }`);
    const result = await plugin(testSchema, [], {}, { outputFile: '' });

    expect(result.content).toBeSimilarStringTo(
      `f?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, Partial<MyTypeFArgs>>;`
    );
    await resolversTestingValidate(result, {}, testSchema);
  });

  // dotansimha/graphql-code-generator#3322
  it('should include generic wrapper type only when necessary', async () => {
    const testSchema = buildSchema(`type MyType { f: String }`);
    const result = await plugin(testSchema, [], {}, { outputFile: '' });

    expect(result.content).toBeSimilarStringTo(
      `f?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;`
    );
    await resolversTestingValidate(result, {}, testSchema);
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
        Node?: NodeResolvers<ContextType>;
        PostOrUser?: PostOrUserResolvers<ContextType>;
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
        Subscription: ResolverTypeWrapper<{}>;
        Query: ResolverTypeWrapper<{}>;
        Mutation: ResolverTypeWrapper<{}>;
        String: ResolverTypeWrapper<Scalars['String']['output']>;
        Post: ResolverTypeWrapper<Post>;
        Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
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
        Subscription: {};
        Query: {};
        Mutation: {};
        String: Scalars['String']['output'];
        Post: Post;
        Boolean: Scalars['Boolean']['output'];
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
        Subscription: ResolverTypeWrapper<RootValueType>;
        Query: ResolverTypeWrapper<RootValueType>;
        Mutation: ResolverTypeWrapper<RootValueType>;
        String: ResolverTypeWrapper<Scalars['String']['output']>;
        Post: ResolverTypeWrapper<Post>;
        Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
      };
    `);

    expect(content.prepend).toContain(`import RootValueType from 'my-file';`);
  });

  it('should use correct value when rootValueType mapped as default with type import', async () => {
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
        useTypeImports: true,
      },
      { outputFile: 'graphql.ts' }
    )) as Types.ComplexPluginOutput;

    expect(content.prepend).toContain(`import type { default as RootValueType } from 'my-file';`);
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
        MySubscription: ResolverTypeWrapper<MyRoot>;
        MyQuery: ResolverTypeWrapper<MyRoot>;
        MyMutation: ResolverTypeWrapper<MyRoot>;
        String: ResolverTypeWrapper<Scalars['String']['output']>;
        Post: ResolverTypeWrapper<Post>;
        Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
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
    it('#4687 - incorrect suffix when used with typesSuffix', async () => {
      const testSchema = buildSchema(/* GraphQL */ `
        type User {
          _id: ID!
        }
        type Query {
          user(_id: ID!): User
          user2(_id: ID): User
          me: User
        }
      `);

      const config = {
        typesSuffix: 'QL',
      };
      const output = await plugin(testSchema, [], config, { outputFile: 'graphql.ts' });
      const o = await resolversTestingValidate(output, config, testSchema);
      expect(o).not.toContain(
        `user?: Resolver<Maybe<ResolversTypesQL['User']>, ParentType, ContextType, RequireFields<QueryQLuserArgs, '_id'>>;`
      );
      expect(o).toContain(
        `user?: Resolver<Maybe<ResolversTypesQL['User']>, ParentType, ContextType, RequireFields<QueryUserArgsQL, '_id'>>;`
      );
      expect(o).toContain(`me?: Resolver<Maybe<ResolversTypesQL['User']>, ParentType, ContextType>;`);
      expect(o).toContain(
        `user2?: Resolver<Maybe<ResolversTypesQL['User']>, ParentType, ContextType, Partial<QueryUser2ArgsQL>>;`
      );
    });
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
      const o = await resolversTestingValidate(output, config, testSchema);

      expect(o).toBeSimilarStringTo(`
      export const enum Test {
        A = 'A',
        B = 'B',
        C = 'C'
      };`);
      expect(o).toBeSimilarStringTo(`
      export type IResolversTypes = {
        Query: ResolverTypeWrapper<{}>;
        Test: Test;
        Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
        String: ResolverTypeWrapper<Scalars['String']['output']>;
      };`);
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
          ProjectRole: '../entities#AnotherProjectRole',
        },
      };

      const tsContent = (await tsPlugin(testSchema, [], config, {
        outputFile: 'graphql.ts',
      })) as Types.ComplexPluginOutput;
      const output = await plugin(testSchema, [], config, { outputFile: 'graphql.ts' });

      expect(output.prepend.filter(t => t.includes('import')).length).toBe(2);
      expect(output.prepend.filter(t => t.includes('ProjectRole')).length).toBe(0);
      expect(tsContent.prepend.filter(t => t.includes('ProjectRole')).length).toBe(1);
      expect(output.content.includes('AnotherProjectRole')).toBeFalsy();
      expect(
        tsContent.prepend.includes(`import { AnotherProjectRole as ProjectRole } from '../entities';`)
      ).toBeTruthy();
      expect(output.prepend.includes(`import { AnotherProjectRole as ProjectRole } from '../entities';`)).toBeFalsy();
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

      expect(output.content).toContain(`export type GqlAuthDirectiveArgs = {\n  role?: Maybe<UserRole>;\n};`);
      expect(output.content).toContain(
        `export type GqlAuthDirectiveResolver<Result, Parent, ContextType = any, Args = GqlAuthDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;`
      );
    });
  });

  it('Should generate resolvers with replaced internalResolversPrefix if specified', async () => {
    const result = (await plugin(
      resolversTestingSchema,
      [],
      { internalResolversPrefix: '' },
      { outputFile: '' }
    )) as Types.ComplexPluginOutput;

    expect(result.content).not.toContain('__resolveType');
    expect(result.content).toContain('resolveType');
    expect(result.content).not.toContain('__isTypeOf');
    expect(result.content).toContain('isTypeOf');

    expect(result.content).toBeSimilarStringTo(`
      export type MyUnionResolvers<ContextType = any, ParentType extends ResolversParentTypes['MyUnion'] = ResolversParentTypes['MyUnion']> = {
        resolveType: TypeResolveFn<'MyType' | 'MyOtherType', ParentType, ContextType>;
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type NodeResolvers<ContextType = any, ParentType extends ResolversParentTypes['Node'] = ResolversParentTypes['Node']> = {
        resolveType: TypeResolveFn<'SomeNode', ParentType, ContextType>;
        id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
      };
    `);

    await resolversTestingValidate(result);
  });
});
