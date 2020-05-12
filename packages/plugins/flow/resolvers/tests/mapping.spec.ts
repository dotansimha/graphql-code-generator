import '@graphql-codegen/testing';
import { schema } from '../../../typescript/resolvers/tests/common';
import { plugin } from '../src';
import { buildSchema } from 'graphql';
import { validateFlow as validate } from '../../flow/tests/validate-flow';
import { Types, mergeOutputs } from '@graphql-codegen/plugin-helpers';

describe('ResolversTypes', () => {
  it('Should build ResolversTypes object when there are no mappers', async () => {
    const result = await plugin(schema, [], {}, { outputFile: '' });

    expect(result.content).toBeSimilarStringTo(`
    export type ResolversTypes = {
      String: ResolverTypeWrapper<$ElementType<Scalars, 'String'>>,
      Boolean: ResolverTypeWrapper<$ElementType<Scalars, 'Boolean'>>,
      MyType: ResolverTypeWrapper<MyType>,
      MyOtherType: ResolverTypeWrapper<MyOtherType>,
      Query: ResolverTypeWrapper<{}>,
      Subscription: ResolverTypeWrapper<{}>,
      Node: $ElementType<ResolversTypes, 'SomeNode'>,
      ID: ResolverTypeWrapper<$ElementType<Scalars, 'ID'>>,
      SomeNode: ResolverTypeWrapper<SomeNode>,
      MyUnion: $ElementType<ResolversTypes, 'MyType'> | $ElementType<ResolversTypes, 'MyOtherType'>,
      MyScalar: ResolverTypeWrapper<$ElementType<Scalars, 'MyScalar'>>,
      Int: ResolverTypeWrapper<$ElementType<Scalars, 'Int'>>,
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
      String: ResolverTypeWrapper<number>,
      Boolean: ResolverTypeWrapper<$ElementType<Scalars, 'Boolean'>>,
      MyType: ResolverTypeWrapper<MyTypeDb>,
      MyOtherType: ResolverTypeWrapper<$Diff<MyOtherType, { bar: * }> & { bar: $ElementType<ResolversTypes, 'String'> }>,
      Query: ResolverTypeWrapper<{}>,
      Subscription: ResolverTypeWrapper<{}>,
      Node: $ElementType<ResolversTypes, 'SomeNode'>,
      ID: ResolverTypeWrapper<$ElementType<Scalars, 'ID'>>,
      SomeNode: ResolverTypeWrapper<SomeNode>,
      MyUnion: $ElementType<ResolversTypes, 'MyType'> | $ElementType<ResolversTypes, 'MyOtherType'>,
      MyScalar: ResolverTypeWrapper<$ElementType<Scalars, 'MyScalar'>>,
      Int: ResolverTypeWrapper<$ElementType<Scalars, 'Int'>>,
    };`);
  });

  it('Should build ResolversTypes with defaultMapper set', async () => {
    const result = (await plugin(
      schema,
      [],
      {
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
      String: ResolverTypeWrapper<string>,
      Boolean: ResolverTypeWrapper<any>,
      MyType: ResolverTypeWrapper<MyTypeDb>,
      MyOtherType: ResolverTypeWrapper<any>,
      Query: ResolverTypeWrapper<{}>,
      Subscription: ResolverTypeWrapper<{}>,
      Node: $ElementType<ResolversTypes, 'SomeNode'>,
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
        mappers: {
          MyType: './my-module#MyTypeDb',
        },
      },
      { outputFile: '' }
    )) as Types.ComplexPluginOutput;

    expect(result.content).toBeSimilarStringTo(`
    export type ResolversTypes = {
      String: ResolverTypeWrapper<$ElementType<Scalars, 'String'>>,
      Boolean: ResolverTypeWrapper<$ElementType<Scalars, 'Boolean'>>,
      MyType: ResolverTypeWrapper<MyTypeDb>,
      MyOtherType: ResolverTypeWrapper<MyOtherType>,
      Query: ResolverTypeWrapper<{}>,
      Subscription: ResolverTypeWrapper<{}>,
      Node: $ElementType<ResolversTypes, 'SomeNode'>,
      ID: ResolverTypeWrapper<$ElementType<Scalars, 'ID'>>,
      SomeNode: ResolverTypeWrapper<SomeNode>,
      MyUnion: $ElementType<ResolversTypes, 'MyType'> | $ElementType<ResolversTypes, 'MyOtherType'>,
      MyScalar: ResolverTypeWrapper<$ElementType<Scalars, 'MyScalar'>>,
      Int: ResolverTypeWrapper<$ElementType<Scalars, 'Int'>>,
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
    const result = (await plugin(
      schema,
      [],
      {
        mappers: {
          MyOtherType: './my-file#MyCustomOtherType',
        },
      },
      { outputFile: '' }
    )) as Types.ComplexPluginOutput;

    expect(result.prepend).toContain(`import { type MyCustomOtherType } from './my-file';`);

    expect(result.content).toBeSimilarStringTo(`
    export type MyDirectiveDirectiveArgs = {   arg: $ElementType<Scalars, 'Int'>,
    arg2: $ElementType<Scalars, 'String'>, arg3: $ElementType<Scalars, 'Boolean'>, };
    `);

    expect(result.content).toBeSimilarStringTo(`
    export type MyDirectiveDirectiveResolver<Result, Parent, ContextType = any, Args = MyDirectiveDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;`);

    expect(result.content).toBeSimilarStringTo(`
        export type MyOtherTypeResolvers<ContextType = any, ParentType = $ElementType<ResolversParentTypes, 'MyOtherType'>> = {
          bar?: Resolver<$ElementType<ResolversTypes, 'String'>, ParentType, ContextType>,
          __isTypeOf?: isTypeOfResolverFn<ParentType>,
        };
      `);

    expect(result.content).toBeSimilarStringTo(`
      export type MyScalarScalarConfig = {
        ...GraphQLScalarTypeConfig<$ElementType<ResolversTypes, 'MyScalar'>, any>, 
        name: 'MyScalar'
      };`);

    expect(result.content).toBeSimilarStringTo(`
      export type MyTypeResolvers<ContextType = any, ParentType = $ElementType<ResolversParentTypes, 'MyType'>> = {
        foo?: Resolver<$ElementType<ResolversTypes, 'String'>, ParentType, ContextType>,
        otherType?: Resolver<?$ElementType<ResolversTypes, 'MyOtherType'>, ParentType, ContextType>,
        withArgs?: Resolver<?$ElementType<ResolversTypes, 'String'>, ParentType, ContextType, $RequireFields<MyTypeWithArgsArgs, { arg2: * }>>,
        __isTypeOf?: isTypeOfResolverFn<ParentType>,
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type MyUnionResolvers<ContextType = any, ParentType = $ElementType<ResolversParentTypes, 'MyUnion'>> = {
        __resolveType: TypeResolveFn<'MyType' | 'MyOtherType', ParentType, ContextType>,
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type NodeResolvers<ContextType = any, ParentType = $ElementType<ResolversParentTypes, 'Node'>> = {
        __resolveType: TypeResolveFn<'SomeNode', ParentType, ContextType>,
        id?: Resolver<$ElementType<ResolversTypes, 'ID'>, ParentType, ContextType>,
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type QueryResolvers<ContextType = any, ParentType = $ElementType<ResolversParentTypes, 'Query'>> = {
        something?: Resolver<$ElementType<ResolversTypes, 'MyType'>, ParentType, ContextType>,
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type SomeNodeResolvers<ContextType = any, ParentType = $ElementType<ResolversParentTypes, 'SomeNode'>> = {
        id?: Resolver<$ElementType<ResolversTypes, 'ID'>, ParentType, ContextType>,
        __isTypeOf?: isTypeOfResolverFn<ParentType>,
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type SubscriptionResolvers<ContextType = any, ParentType = $ElementType<ResolversParentTypes, 'Subscription'>> = {
        somethingChanged?: SubscriptionResolver<?$ElementType<ResolversTypes, 'MyOtherType'>, "somethingChanged", ParentType, ContextType>,
      };
    `);
    await validate(result);
  });

  it('Should generate basic type resolvers with external mappers using same imported type', async () => {
    const result = (await plugin(
      schema,
      [],
      {
        mappers: {
          MyType: './my-file#MyCustomOtherType',
          MyOtherType: './my-file#MyCustomOtherType',
        },
      },
      { outputFile: '' }
    )) as Types.ComplexPluginOutput;

    expect(result.prepend).toContain(`import { type MyCustomOtherType } from './my-file';`);
    expect(result.content).toBeSimilarStringTo(`
    export type MyDirectiveDirectiveArgs = {   arg: $ElementType<Scalars, 'Int'>,
    arg2: $ElementType<Scalars, 'String'>, arg3: $ElementType<Scalars, 'Boolean'>, };
    `);

    expect(result.content).toBeSimilarStringTo(`
    export type MyDirectiveDirectiveResolver<Result, Parent, ContextType = any, Args = MyDirectiveDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;`);

    expect(result.content).toBeSimilarStringTo(`
        export type MyOtherTypeResolvers<ContextType = any, ParentType = $ElementType<ResolversParentTypes, 'MyOtherType'>> = {
          bar?: Resolver<$ElementType<ResolversTypes, 'String'>, ParentType, ContextType>,
          __isTypeOf?: isTypeOfResolverFn<ParentType>,
        };
      `);

    expect(result.content).toBeSimilarStringTo(`
      export type MyScalarScalarConfig = {
        ...GraphQLScalarTypeConfig<$ElementType<ResolversTypes, 'MyScalar'>, any>, 
        name: 'MyScalar'
      };`);

    expect(result.content).toBeSimilarStringTo(`
      export type MyTypeResolvers<ContextType = any, ParentType = $ElementType<ResolversParentTypes, 'MyType'>> = {
        foo?: Resolver<$ElementType<ResolversTypes, 'String'>, ParentType, ContextType>,
        otherType?: Resolver<?$ElementType<ResolversTypes, 'MyOtherType'>, ParentType, ContextType>,
        withArgs?: Resolver<?$ElementType<ResolversTypes, 'String'>, ParentType, ContextType, $RequireFields<MyTypeWithArgsArgs, { arg2: * }>>,
        __isTypeOf?: isTypeOfResolverFn<ParentType>,
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type MyUnionResolvers<ContextType = any, ParentType = $ElementType<ResolversParentTypes, 'MyUnion'>> = {
        __resolveType: TypeResolveFn<'MyType' | 'MyOtherType', ParentType, ContextType>,
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type NodeResolvers<ContextType = any, ParentType = $ElementType<ResolversParentTypes, 'Node'>> = {
        __resolveType: TypeResolveFn<'SomeNode', ParentType, ContextType>,
        id?: Resolver<$ElementType<ResolversTypes, 'ID'>, ParentType, ContextType>,
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type QueryResolvers<ContextType = any, ParentType = $ElementType<ResolversParentTypes, 'Query'>> = {
        something?: Resolver<$ElementType<ResolversTypes, 'MyType'>, ParentType, ContextType>,
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type SomeNodeResolvers<ContextType = any, ParentType = $ElementType<ResolversParentTypes, 'SomeNode'>> = {
        id?: Resolver<$ElementType<ResolversTypes, 'ID'>, ParentType, ContextType>,
        __isTypeOf?: isTypeOfResolverFn<ParentType>,
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type SubscriptionResolvers<ContextType = any, ParentType = $ElementType<ResolversParentTypes, 'Subscription'>> = {
        somethingChanged?: SubscriptionResolver<?$ElementType<ResolversTypes, 'MyOtherType'>, "somethingChanged", ParentType, ContextType>,
      };
    `);
    await validate(result);
  });

  it('Should generate the correct resolvers when used with mappers with interfaces', async () => {
    const spy = jest.spyOn(console, 'warn').mockImplementation();
    const result = (await plugin(
      schema,
      [],
      {
        mappers: {
          Node: 'MyNodeType',
        },
      },
      { outputFile: '' }
    )) as Types.ComplexPluginOutput;

    expect(result.content).toBeSimilarStringTo(`
    export type MyDirectiveDirectiveArgs = {   arg: $ElementType<Scalars, 'Int'>,
    arg2: $ElementType<Scalars, 'String'>, arg3: $ElementType<Scalars, 'Boolean'>, };
    `);

    expect(result.content).toBeSimilarStringTo(`
    export type MyDirectiveDirectiveResolver<Result, Parent, ContextType = any, Args = MyDirectiveDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;`);

    expect(result.content).toBeSimilarStringTo(`
      export type MyOtherTypeResolvers<ContextType = any, ParentType = $ElementType<ResolversParentTypes, 'MyOtherType'>> = {
        bar?: Resolver<$ElementType<ResolversTypes, 'String'>, ParentType, ContextType>,
        __isTypeOf?: isTypeOfResolverFn<ParentType>,
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
    export type MyScalarScalarConfig = {
      ...GraphQLScalarTypeConfig<$ElementType<ResolversTypes, 'MyScalar'>, any>, 
      name: 'MyScalar'
    };`);

    expect(result.content).toBeSimilarStringTo(`
      export type MyTypeResolvers<ContextType = any, ParentType = $ElementType<ResolversParentTypes, 'MyType'>> = {
        foo?: Resolver<$ElementType<ResolversTypes, 'String'>, ParentType, ContextType>,
        otherType?: Resolver<?$ElementType<ResolversTypes, 'MyOtherType'>, ParentType, ContextType>,
        withArgs?: Resolver<?$ElementType<ResolversTypes, 'String'>, ParentType, ContextType, $RequireFields<MyTypeWithArgsArgs, { arg2: * }>>,
        __isTypeOf?: isTypeOfResolverFn<ParentType>,
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type MyUnionResolvers<ContextType = any, ParentType = $ElementType<ResolversParentTypes, 'MyUnion'>> = {
        __resolveType: TypeResolveFn<'MyType' | 'MyOtherType', ParentType, ContextType>,
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type NodeResolvers<ContextType = any, ParentType = $ElementType<ResolversParentTypes, 'Node'>> = {
        __resolveType: TypeResolveFn<'SomeNode', ParentType, ContextType>,
        id?: Resolver<$ElementType<ResolversTypes, 'ID'>, ParentType, ContextType>,
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type QueryResolvers<ContextType = any, ParentType = $ElementType<ResolversParentTypes, 'Query'>> = {
        something?: Resolver<$ElementType<ResolversTypes, 'MyType'>, ParentType, ContextType>,
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type SomeNodeResolvers<ContextType = any, ParentType = $ElementType<ResolversParentTypes, 'SomeNode'>> = {
        id?: Resolver<$ElementType<ResolversTypes, 'ID'>, ParentType, ContextType>,
        __isTypeOf?: isTypeOfResolverFn<ParentType>,
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type SubscriptionResolvers<ContextType = any, ParentType = $ElementType<ResolversParentTypes, 'Subscription'>> = {
        somethingChanged?: SubscriptionResolver<?$ElementType<ResolversTypes, 'MyOtherType'>, "somethingChanged", ParentType, ContextType>,
      };
    `);
    await validate(mergeOutputs([result, `type MyNodeType = {};`]));

    spy.mockRestore();
  });

  it('Should generate basic type resolvers with defaultMapper set to any', async () => {
    const result = (await plugin(
      schema,
      [],
      {
        defaultMapper: 'any',
      },
      { outputFile: '' }
    )) as Types.ComplexPluginOutput;

    expect(result.content).toBeSimilarStringTo(`
    export type MyDirectiveDirectiveArgs = {   arg: $ElementType<Scalars, 'Int'>,
    arg2: $ElementType<Scalars, 'String'>, arg3: $ElementType<Scalars, 'Boolean'>, };
    `);

    expect(result.content).toBeSimilarStringTo(`
    export type MyDirectiveDirectiveResolver<Result, Parent, ContextType = any, Args = MyDirectiveDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;`);

    expect(result.content).toBeSimilarStringTo(`
      export type MyOtherTypeResolvers<ContextType = any, ParentType = $ElementType<ResolversParentTypes, 'MyOtherType'>> = {
        bar?: Resolver<$ElementType<ResolversTypes, 'String'>, ParentType, ContextType>,
        __isTypeOf?: isTypeOfResolverFn<ParentType>,
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
    export type MyScalarScalarConfig = {
      ...GraphQLScalarTypeConfig<$ElementType<ResolversTypes, 'MyScalar'>, any>, 
      name: 'MyScalar'
    };`);

    expect(result.content).toBeSimilarStringTo(`
      export type MyTypeResolvers<ContextType = any, ParentType = $ElementType<ResolversParentTypes, 'MyType'>> = {
        foo?: Resolver<$ElementType<ResolversTypes, 'String'>, ParentType, ContextType>,
        otherType?: Resolver<?$ElementType<ResolversTypes, 'MyOtherType'>, ParentType, ContextType>,
        withArgs?: Resolver<?$ElementType<ResolversTypes, 'String'>, ParentType, ContextType, $RequireFields<MyTypeWithArgsArgs, { arg2: * }>>,
        __isTypeOf?: isTypeOfResolverFn<ParentType>,
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type MyUnionResolvers<ContextType = any, ParentType = $ElementType<ResolversParentTypes, 'MyUnion'>> = {
        __resolveType: TypeResolveFn<'MyType' | 'MyOtherType', ParentType, ContextType>,
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type NodeResolvers<ContextType = any, ParentType = $ElementType<ResolversParentTypes, 'Node'>> = {
        __resolveType: TypeResolveFn<'SomeNode', ParentType, ContextType>,
        id?: Resolver<$ElementType<ResolversTypes, 'ID'>, ParentType, ContextType>,
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type QueryResolvers<ContextType = any, ParentType = $ElementType<ResolversParentTypes, 'Query'>> = {
        something?: Resolver<$ElementType<ResolversTypes, 'MyType'>, ParentType, ContextType>,
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type SomeNodeResolvers<ContextType = any, ParentType = $ElementType<ResolversParentTypes, 'SomeNode'>> = {
        id?: Resolver<$ElementType<ResolversTypes, 'ID'>, ParentType, ContextType>,
        __isTypeOf?: isTypeOfResolverFn<ParentType>,
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type SubscriptionResolvers<ContextType = any, ParentType = $ElementType<ResolversParentTypes, 'Subscription'>> = {
        somethingChanged?: SubscriptionResolver<?$ElementType<ResolversTypes, 'MyOtherType'>, "somethingChanged", ParentType, ContextType>,
      };
    `);
    await validate(result);
  });

  it('Should generate basic type resolvers with defaultMapper set to external identifier', async () => {
    const result = (await plugin(
      schema,
      [],
      {
        defaultMapper: './my-file#MyBaseType',
      },
      { outputFile: '' }
    )) as Types.ComplexPluginOutput;

    expect(result.prepend).toContain(`import { type MyBaseType } from './my-file';`);

    expect(result.content).toBeSimilarStringTo(`
    export type MyDirectiveDirectiveArgs = {   arg: $ElementType<Scalars, 'Int'>,
    arg2: $ElementType<Scalars, 'String'>, arg3: $ElementType<Scalars, 'Boolean'>, };
    `);

    expect(result.content).toBeSimilarStringTo(`
    export type MyDirectiveDirectiveResolver<Result, Parent, ContextType = any, Args = MyDirectiveDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;`);

    expect(result.content).toBeSimilarStringTo(`
      export type MyOtherTypeResolvers<ContextType = any, ParentType = $ElementType<ResolversParentTypes, 'MyOtherType'>> = {
        bar?: Resolver<$ElementType<ResolversTypes, 'String'>, ParentType, ContextType>,
        __isTypeOf?: isTypeOfResolverFn<ParentType>,
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
    export type MyScalarScalarConfig = {
      ...GraphQLScalarTypeConfig<$ElementType<ResolversTypes, 'MyScalar'>, any>, 
      name: 'MyScalar'
    };`);

    expect(result.content).toBeSimilarStringTo(`
      export type MyTypeResolvers<ContextType = any, ParentType = $ElementType<ResolversParentTypes, 'MyType'>> = {
        foo?: Resolver<$ElementType<ResolversTypes, 'String'>, ParentType, ContextType>,
        otherType?: Resolver<?$ElementType<ResolversTypes, 'MyOtherType'>, ParentType, ContextType>,
        withArgs?: Resolver<?$ElementType<ResolversTypes, 'String'>, ParentType, ContextType, $RequireFields<MyTypeWithArgsArgs, { arg2: * }>>,
        __isTypeOf?: isTypeOfResolverFn<ParentType>,
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type MyUnionResolvers<ContextType = any, ParentType = $ElementType<ResolversParentTypes, 'MyUnion'>> = {
        __resolveType: TypeResolveFn<'MyType' | 'MyOtherType', ParentType, ContextType>,
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type NodeResolvers<ContextType = any, ParentType = $ElementType<ResolversParentTypes, 'Node'>> = {
        __resolveType: TypeResolveFn<'SomeNode', ParentType, ContextType>,
        id?: Resolver<$ElementType<ResolversTypes, 'ID'>, ParentType, ContextType>,
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type QueryResolvers<ContextType = any, ParentType = $ElementType<ResolversParentTypes, 'Query'>> = {
        something?: Resolver<$ElementType<ResolversTypes, 'MyType'>, ParentType, ContextType>,
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type SomeNodeResolvers<ContextType = any, ParentType = $ElementType<ResolversParentTypes, 'SomeNode'>> = {
        id?: Resolver<$ElementType<ResolversTypes, 'ID'>, ParentType, ContextType>,
        __isTypeOf?: isTypeOfResolverFn<ParentType>,
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type SubscriptionResolvers<ContextType = any, ParentType = $ElementType<ResolversParentTypes, 'Subscription'>> = {
        somethingChanged?: SubscriptionResolver<?$ElementType<ResolversTypes, 'MyOtherType'>, "somethingChanged", ParentType, ContextType>,
      };
    `);
    await validate(result);
  });

  it('Should replace using Omit when non-mapped type is pointing to mapped type', async () => {
    const result = (await plugin(
      schema,
      [],
      {
        mappers: {
          MyOtherType: 'MyOtherTypeCustom',
        },
      },
      { outputFile: '' }
    )) as Types.ComplexPluginOutput;

    expect(result.content).toBeSimilarStringTo(`
    export type ResolversTypes = {
      String: ResolverTypeWrapper<$ElementType<Scalars, 'String'>>,
      Boolean: ResolverTypeWrapper<$ElementType<Scalars, 'Boolean'>>,
      MyType: ResolverTypeWrapper<$Diff<MyType, { otherType: * }> & { otherType: ?$ElementType<ResolversTypes, 'MyOtherType'> }>,
      MyOtherType: ResolverTypeWrapper<MyOtherTypeCustom>,
      Query: ResolverTypeWrapper<{}>,
      Subscription: ResolverTypeWrapper<{}>,
      Node: $ElementType<ResolversTypes, 'SomeNode'>,
      ID: ResolverTypeWrapper<$ElementType<Scalars, 'ID'>>,
      SomeNode: ResolverTypeWrapper<SomeNode>,
      MyUnion: $ElementType<ResolversTypes, 'MyType'> | $ElementType<ResolversTypes, 'MyOtherType'>,
      MyScalar: ResolverTypeWrapper<$ElementType<Scalars, 'MyScalar'>>,
      Int: ResolverTypeWrapper<$ElementType<Scalars, 'Int'>>,
    };`);
    await validate(mergeOutputs([result, `type MyOtherTypeCustom = {};`]));
  });

  it('Should not replace using Omit when non-mapped type is pointing to mapped type', async () => {
    const result = (await plugin(
      schema,
      [],
      {
        mappers: {
          MyOtherType: 'MyOtherTypeCustom',
        },
      },
      { outputFile: '' }
    )) as Types.ComplexPluginOutput;

    expect(result.content).toBeSimilarStringTo(`
    export type ResolversTypes = {
      String: ResolverTypeWrapper<$ElementType<Scalars, 'String'>>,
      Boolean: ResolverTypeWrapper<$ElementType<Scalars, 'Boolean'>>,
      MyType: ResolverTypeWrapper<$Diff<MyType, { otherType: *  }> & { otherType: ?$ElementType<ResolversTypes, 'MyOtherType'> }>,
      MyOtherType: ResolverTypeWrapper<MyOtherTypeCustom>,
      Query: ResolverTypeWrapper<{}>,
      Subscription: ResolverTypeWrapper<{}>,
      Node: $ElementType<ResolversTypes, 'SomeNode'>,
      ID: ResolverTypeWrapper<$ElementType<Scalars, 'ID'>>,
      SomeNode: ResolverTypeWrapper<SomeNode>,
      MyUnion: $ElementType<ResolversTypes, 'MyType'> | $ElementType<ResolversTypes, 'MyOtherType'>,
      MyScalar: ResolverTypeWrapper<$ElementType<Scalars, 'MyScalar'>>,
      Int: ResolverTypeWrapper<$ElementType<Scalars, 'Int'>>,
    };`);
    await validate(mergeOutputs([result, `type MyTypeCustom = {}; type MyOtherTypeCustom = {};`]));
  });

  it('Should build ResolversTypes with defaultMapper set using {T}', async () => {
    const result = (await plugin(
      schema,
      [],
      {
        defaultMapper: '$Shape<{T}>',
      },
      { outputFile: '' }
    )) as Types.ComplexPluginOutput;

    expect(result.content).toBeSimilarStringTo(`
    export type ResolversTypes = {
      String: ResolverTypeWrapper<$Shape<$ElementType<Scalars, 'String'>>>,
      Boolean: ResolverTypeWrapper<$Shape<$ElementType<Scalars, 'Boolean'>>>,
      MyType: ResolverTypeWrapper<$Shape<MyType>>,
      MyOtherType: ResolverTypeWrapper<$Shape<MyOtherType>>,
      Query: ResolverTypeWrapper<{}>,
      Subscription: ResolverTypeWrapper<{}>,
      Node: $ElementType<ResolversTypes, 'SomeNode'>,
      ID: ResolverTypeWrapper<$Shape<$ElementType<Scalars, 'ID'>>>,
      SomeNode: ResolverTypeWrapper<$Shape<SomeNode>>,
      MyUnion: $Shape<$ElementType<ResolversTypes, 'MyType'> | $ElementType<ResolversTypes, 'MyOtherType'>>,
      MyScalar: ResolverTypeWrapper<$Shape<$ElementType<Scalars, 'MyScalar'>>>,
      Int: ResolverTypeWrapper<$Shape<$ElementType<Scalars, 'Int'>>>,
    };`);
  });

  it('Should build ResolversTypes with defaultMapper set using {T} with external identifier', async () => {
    const result = (await plugin(
      schema,
      [],
      {
        defaultMapper: './my-wrapper#CustomPartial<{T}>',
      },
      { outputFile: '' }
    )) as Types.ComplexPluginOutput;

    expect(result.prepend).toContain(`import { type CustomPartial } from './my-wrapper';`);

    // export type ResolversTypes = {
    //   Query: ResolverTypeWrapper<{}>,
    //   MyType: ResolverTypeWrapper<CustomPartial<MyType>>,
    //   String: ResolverTypeWrapper<CustomPartial<$ElementType<Scalars, 'String'>>>,
    //   MyOtherType: ResolverTypeWrapper<CustomPartial<MyOtherType>>,
    //   Subscription: ResolverTypeWrapper<{}>,
    //   Boolean: ResolverTypeWrapper<CustomPartial<$ElementType<Scalars, 'Boolean'>>>,
    //   Node: ResolverTypeWrapper<CustomPartial<Node>>,
    //   ID: ResolverTypeWrapper<CustomPartial<$ElementType<Scalars, 'ID'>>>,
    //   SomeNode: ResolverTypeWrapper<CustomPartial<SomeNode>>,
    //   MyUnion: CustomPartial<$ElementType<ResolversTypes, 'MyType'> | $ElementType<ResolversTypes, 'MyOtherType'>>,
    //   MyScalar: ResolverTypeWrapper<CustomPartial<$ElementType<Scalars, 'MyScalar'>>>,
    //   Int: ResolverTypeWrapper<CustomPartial<$ElementType<Scalars, 'Int'>>>,
    // };

    expect(result.content).toBeSimilarStringTo(`
    export type ResolversTypes = {
      String: ResolverTypeWrapper<CustomPartial<$ElementType<Scalars, 'String'>>>,
      Boolean: ResolverTypeWrapper<CustomPartial<$ElementType<Scalars, 'Boolean'>>>,
      MyType: ResolverTypeWrapper<CustomPartial<MyType>>,
      MyOtherType: ResolverTypeWrapper<CustomPartial<MyOtherType>>,
      Query: ResolverTypeWrapper<{}>,
      Subscription: ResolverTypeWrapper<{}>,
      Node: $ElementType<ResolversTypes, 'SomeNode'>,
      ID: ResolverTypeWrapper<CustomPartial<$ElementType<Scalars, 'ID'>>>,
      SomeNode: ResolverTypeWrapper<CustomPartial<SomeNode>>,
      MyUnion: CustomPartial<$ElementType<ResolversTypes, 'MyType'> | $ElementType<ResolversTypes, 'MyOtherType'>>,
      MyScalar: ResolverTypeWrapper<CustomPartial<$ElementType<Scalars, 'MyScalar'>>>,
      Int: ResolverTypeWrapper<CustomPartial<$ElementType<Scalars, 'Int'>>>,
    };`);
  });
});
