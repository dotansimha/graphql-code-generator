import '@graphql-codegen/testing';
import { schema } from '../../typescript-resolvers/tests/common';
import { plugin } from '../src';
import { buildSchema } from 'graphql';
import { validateFlow as validate } from '../../flow/tests/validate-flow';

describe('ResolversTypes', () => {
  it('Should build ResolversTypes object when there are no mappers', async () => {
    const result = await plugin(schema, [], {}, { outputFile: '' });

    expect(result).toBeSimilarStringTo(`
    export type ResolversTypes = {
      Query: Query,
      MyType: MyType,
      String: $ElementType<Scalars, 'String'>,
      MyOtherType: MyOtherType,
      Subscription: Subscription,
      Boolean: $ElementType<Scalars, 'Boolean'>,
      Node: Node,
      ID: $ElementType<Scalars, 'ID'>,
      SomeNode: SomeNode,
      MyUnion: MyUnion,
      MyScalar: $ElementType<Scalars, 'MyScalar'>,
      Int: $ElementType<Scalars, 'Int'>,
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
      MyOtherType: $Diff<MyOtherType, { bar: * }> & { bar: $ElementType<ResolversTypes, 'String'> },
      Subscription: Subscription,
      Boolean: $ElementType<Scalars, 'Boolean'>,
      Node: Node,
      ID: $ElementType<Scalars, 'ID'>,
      SomeNode: SomeNode,
      MyUnion: MyUnion,
      MyScalar: $ElementType<Scalars, 'MyScalar'>,
      Int: $ElementType<Scalars, 'Int'>,
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
      String: $ElementType<Scalars, 'String'>,
      MyOtherType: MyOtherType,
      Subscription: Subscription,
      Boolean: $ElementType<Scalars, 'Boolean'>,
      Node: Node,
      ID: $ElementType<Scalars, 'ID'>,
      SomeNode: SomeNode,
      MyUnion: MyUnion,
      MyScalar: $ElementType<Scalars, 'MyScalar'>,
      Int: $ElementType<Scalars, 'Int'>,
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

    expect(result).toBeSimilarStringTo(`import { type MyCustomOtherType } from './my-file';`);
    expect(result).toBeSimilarStringTo(`
    export type MyDirectiveDirectiveResolver<Result, Parent, Context = any, Args = {   arg?: ?$ElementType<Scalars, 'Int'>,
      arg2?: ?$ElementType<Scalars, 'String'>, arg3?: ?$ElementType<Scalars, 'Boolean'> }> = DirectiveResolverFn<Result, Parent, Context, Args>;`);

    expect(result).toBeSimilarStringTo(`
        export type MyOtherTypeResolvers<Context = any, ParentType = $ElementType<ResolversTypes, 'MyOtherType'>> = {
          bar?: Resolver<$ElementType<ResolversTypes, 'String'>, ParentType, Context>,
        };
      `);

    expect(result).toBeSimilarStringTo(`
      export type MyScalarScalarConfig = {
        ...GraphQLScalarTypeConfig<$ElementType<ResolversTypes, 'MyScalar'>, any>, 
        name: 'MyScalar'
      };`);

    expect(result).toBeSimilarStringTo(`
      export type MyTypeResolvers<Context = any, ParentType = $ElementType<ResolversTypes, 'MyType'>> = {
        foo?: Resolver<$ElementType<ResolversTypes, 'String'>, ParentType, Context>,
        otherType?: Resolver<?$ElementType<ResolversTypes, 'MyOtherType'>, ParentType, Context>,
        withArgs?: Resolver<?$ElementType<ResolversTypes, 'String'>, ParentType, Context, MyTypeWithArgsArgs>,
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type MyUnionResolvers<Context = any, ParentType = $ElementType<ResolversTypes, 'MyUnion'>> = {
        __resolveType: TypeResolveFn<'MyType' | 'MyOtherType', ParentType, Context>
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type NodeResolvers<Context = any, ParentType = $ElementType<ResolversTypes, 'Node'>> = {
        __resolveType: TypeResolveFn<'SomeNode', ParentType, Context>,
        id?: Resolver<$ElementType<ResolversTypes, 'ID'>, ParentType, Context>,
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type QueryResolvers<Context = any, ParentType = $ElementType<ResolversTypes, 'Query'>> = {
        something?: Resolver<$ElementType<ResolversTypes, 'MyType'>, ParentType, Context>,
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type SomeNodeResolvers<Context = any, ParentType = $ElementType<ResolversTypes, 'SomeNode'>> = {
        id?: Resolver<$ElementType<ResolversTypes, 'ID'>, ParentType, Context>,
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type SubscriptionResolvers<Context = any, ParentType = $ElementType<ResolversTypes, 'Subscription'>> = {
        somethingChanged?: SubscriptionResolver<?$ElementType<ResolversTypes, 'MyOtherType'>, ParentType, Context>,
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

    expect(result).toBeSimilarStringTo(`import { type MyCustomOtherType } from './my-file';`);
    expect(result).toBeSimilarStringTo(`
    export type MyDirectiveDirectiveResolver<Result, Parent, Context = any, Args = {   arg?: ?$ElementType<Scalars, 'Int'>,
      arg2?: ?$ElementType<Scalars, 'String'>, arg3?: ?$ElementType<Scalars, 'Boolean'> }> = DirectiveResolverFn<Result, Parent, Context, Args>;`);

    expect(result).toBeSimilarStringTo(`
        export type MyOtherTypeResolvers<Context = any, ParentType = $ElementType<ResolversTypes, 'MyOtherType'>> = {
          bar?: Resolver<$ElementType<ResolversTypes, 'String'>, ParentType, Context>,
        };
      `);

    expect(result).toBeSimilarStringTo(`
      export type MyScalarScalarConfig = {
        ...GraphQLScalarTypeConfig<$ElementType<ResolversTypes, 'MyScalar'>, any>, 
        name: 'MyScalar'
      };`);

    expect(result).toBeSimilarStringTo(`
      export type MyTypeResolvers<Context = any, ParentType = $ElementType<ResolversTypes, 'MyType'>> = {
        foo?: Resolver<$ElementType<ResolversTypes, 'String'>, ParentType, Context>,
        otherType?: Resolver<?$ElementType<ResolversTypes, 'MyOtherType'>, ParentType, Context>,
        withArgs?: Resolver<?$ElementType<ResolversTypes, 'String'>, ParentType, Context, MyTypeWithArgsArgs>,
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type MyUnionResolvers<Context = any, ParentType = $ElementType<ResolversTypes, 'MyUnion'>> = {
        __resolveType: TypeResolveFn<'MyType' | 'MyOtherType', ParentType, Context>
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type NodeResolvers<Context = any, ParentType = $ElementType<ResolversTypes, 'Node'>> = {
        __resolveType: TypeResolveFn<'SomeNode', ParentType, Context>,
        id?: Resolver<$ElementType<ResolversTypes, 'ID'>, ParentType, Context>,
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type QueryResolvers<Context = any, ParentType = $ElementType<ResolversTypes, 'Query'>> = {
        something?: Resolver<$ElementType<ResolversTypes, 'MyType'>, ParentType, Context>,
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type SomeNodeResolvers<Context = any, ParentType = $ElementType<ResolversTypes, 'SomeNode'>> = {
        id?: Resolver<$ElementType<ResolversTypes, 'ID'>, ParentType, Context>,
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type SubscriptionResolvers<Context = any, ParentType = $ElementType<ResolversTypes, 'Subscription'>> = {
        somethingChanged?: SubscriptionResolver<?$ElementType<ResolversTypes, 'MyOtherType'>, ParentType, Context>,
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
    export type MyDirectiveDirectiveResolver<Result, Parent, Context = any, Args = {   arg?: ?$ElementType<Scalars, 'Int'>,
      arg2?: ?$ElementType<Scalars, 'String'>, arg3?: ?$ElementType<Scalars, 'Boolean'> }> = DirectiveResolverFn<Result, Parent, Context, Args>;`);

    expect(result).toBeSimilarStringTo(`
      export type MyOtherTypeResolvers<Context = any, ParentType = $ElementType<ResolversTypes, 'MyOtherType'>> = {
        bar?: Resolver<$ElementType<ResolversTypes, 'String'>, ParentType, Context>,
      };
    `);

    expect(result).toBeSimilarStringTo(`
    export type MyScalarScalarConfig = {
      ...GraphQLScalarTypeConfig<$ElementType<ResolversTypes, 'MyScalar'>, any>, 
      name: 'MyScalar'
    };`);

    expect(result).toBeSimilarStringTo(`
      export type MyTypeResolvers<Context = any, ParentType = $ElementType<ResolversTypes, 'MyType'>> = {
        foo?: Resolver<$ElementType<ResolversTypes, 'String'>, ParentType, Context>,
        otherType?: Resolver<?$ElementType<ResolversTypes, 'MyOtherType'>, ParentType, Context>,
        withArgs?: Resolver<?$ElementType<ResolversTypes, 'String'>, ParentType, Context, MyTypeWithArgsArgs>,
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type MyUnionResolvers<Context = any, ParentType = $ElementType<ResolversTypes, 'MyUnion'>> = {
        __resolveType: TypeResolveFn<'MyType' | 'MyOtherType', ParentType, Context>
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type NodeResolvers<Context = any, ParentType = $ElementType<ResolversTypes, 'Node'>> = {
        __resolveType: TypeResolveFn<'SomeNode', ParentType, Context>,
        id?: Resolver<$ElementType<ResolversTypes, 'ID'>, ParentType, Context>,
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type QueryResolvers<Context = any, ParentType = $ElementType<ResolversTypes, 'Query'>> = {
        something?: Resolver<$ElementType<ResolversTypes, 'MyType'>, ParentType, Context>,
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type SomeNodeResolvers<Context = any, ParentType = $ElementType<ResolversTypes, 'SomeNode'>> = {
        id?: Resolver<$ElementType<ResolversTypes, 'ID'>, ParentType, Context>,
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type SubscriptionResolvers<Context = any, ParentType = $ElementType<ResolversTypes, 'Subscription'>> = {
        somethingChanged?: SubscriptionResolver<?$ElementType<ResolversTypes, 'MyOtherType'>, ParentType, Context>,
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
    export type MyDirectiveDirectiveResolver<Result, Parent, Context = any, Args = {   arg?: ?$ElementType<Scalars, 'Int'>,
      arg2?: ?$ElementType<Scalars, 'String'>, arg3?: ?$ElementType<Scalars, 'Boolean'> }> = DirectiveResolverFn<Result, Parent, Context, Args>;`);

    expect(result).toBeSimilarStringTo(`
      export type MyOtherTypeResolvers<Context = any, ParentType = $ElementType<ResolversTypes, 'MyOtherType'>> = {
        bar?: Resolver<$ElementType<ResolversTypes, 'String'>, ParentType, Context>,
      };
    `);

    expect(result).toBeSimilarStringTo(`
    export type MyScalarScalarConfig = {
      ...GraphQLScalarTypeConfig<$ElementType<ResolversTypes, 'MyScalar'>, any>, 
      name: 'MyScalar'
    };`);

    expect(result).toBeSimilarStringTo(`
      export type MyTypeResolvers<Context = any, ParentType = $ElementType<ResolversTypes, 'MyType'>> = {
        foo?: Resolver<$ElementType<ResolversTypes, 'String'>, ParentType, Context>,
        otherType?: Resolver<?$ElementType<ResolversTypes, 'MyOtherType'>, ParentType, Context>,
        withArgs?: Resolver<?$ElementType<ResolversTypes, 'String'>, ParentType, Context, MyTypeWithArgsArgs>,
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type MyUnionResolvers<Context = any, ParentType = $ElementType<ResolversTypes, 'MyUnion'>> = {
        __resolveType: TypeResolveFn<'MyType' | 'MyOtherType', ParentType, Context>
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type NodeResolvers<Context = any, ParentType = $ElementType<ResolversTypes, 'Node'>> = {
        __resolveType: TypeResolveFn<'SomeNode', ParentType, Context>,
        id?: Resolver<$ElementType<ResolversTypes, 'ID'>, ParentType, Context>,
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type QueryResolvers<Context = any, ParentType = $ElementType<ResolversTypes, 'Query'>> = {
        something?: Resolver<$ElementType<ResolversTypes, 'MyType'>, ParentType, Context>,
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type SomeNodeResolvers<Context = any, ParentType = $ElementType<ResolversTypes, 'SomeNode'>> = {
        id?: Resolver<$ElementType<ResolversTypes, 'ID'>, ParentType, Context>,
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type SubscriptionResolvers<Context = any, ParentType = $ElementType<ResolversTypes, 'Subscription'>> = {
        somethingChanged?: SubscriptionResolver<?$ElementType<ResolversTypes, 'MyOtherType'>, ParentType, Context>,
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

    expect(result).toContain(`import { type MyBaseType } from './my-file';`);

    expect(result).toBeSimilarStringTo(`
    export type MyDirectiveDirectiveResolver<Result, Parent, Context = any, Args = {   arg?: ?$ElementType<Scalars, 'Int'>,
      arg2?: ?$ElementType<Scalars, 'String'>, arg3?: ?$ElementType<Scalars, 'Boolean'> }> = DirectiveResolverFn<Result, Parent, Context, Args>;`);

    expect(result).toBeSimilarStringTo(`
      export type MyOtherTypeResolvers<Context = any, ParentType = $ElementType<ResolversTypes, 'MyOtherType'>> = {
        bar?: Resolver<$ElementType<ResolversTypes, 'String'>, ParentType, Context>,
      };
    `);

    expect(result).toBeSimilarStringTo(`
    export type MyScalarScalarConfig = {
      ...GraphQLScalarTypeConfig<$ElementType<ResolversTypes, 'MyScalar'>, any>, 
      name: 'MyScalar'
    };`);

    expect(result).toBeSimilarStringTo(`
      export type MyTypeResolvers<Context = any, ParentType = $ElementType<ResolversTypes, 'MyType'>> = {
        foo?: Resolver<$ElementType<ResolversTypes, 'String'>, ParentType, Context>,
        otherType?: Resolver<?$ElementType<ResolversTypes, 'MyOtherType'>, ParentType, Context>,
        withArgs?: Resolver<?$ElementType<ResolversTypes, 'String'>, ParentType, Context, MyTypeWithArgsArgs>,
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type MyUnionResolvers<Context = any, ParentType = $ElementType<ResolversTypes, 'MyUnion'>> = {
        __resolveType: TypeResolveFn<'MyType' | 'MyOtherType', ParentType, Context>
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type NodeResolvers<Context = any, ParentType = $ElementType<ResolversTypes, 'Node'>> = {
        __resolveType: TypeResolveFn<'SomeNode', ParentType, Context>,
        id?: Resolver<$ElementType<ResolversTypes, 'ID'>, ParentType, Context>,
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type QueryResolvers<Context = any, ParentType = $ElementType<ResolversTypes, 'Query'>> = {
        something?: Resolver<$ElementType<ResolversTypes, 'MyType'>, ParentType, Context>,
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type SomeNodeResolvers<Context = any, ParentType = $ElementType<ResolversTypes, 'SomeNode'>> = {
        id?: Resolver<$ElementType<ResolversTypes, 'ID'>, ParentType, Context>,
      };
    `);

    expect(result).toBeSimilarStringTo(`
      export type SubscriptionResolvers<Context = any, ParentType = $ElementType<ResolversTypes, 'Subscription'>> = {
        somethingChanged?: SubscriptionResolver<?$ElementType<ResolversTypes, 'MyOtherType'>, ParentType, Context>,
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
      MyType: $Diff<MyType, { otherType: * }> & { otherType: ?$ElementType<ResolversTypes, 'MyOtherType'> },
      String: $ElementType<Scalars, 'String'>,
      MyOtherType: MyOtherTypeCustom,
      Subscription: $Diff<Subscription, { somethingChanged: * }> & { somethingChanged: ?$ElementType<ResolversTypes, 'MyOtherType'> },
      Boolean: $ElementType<Scalars, 'Boolean'>,
      Node: Node,
      ID: $ElementType<Scalars, 'ID'>,
      SomeNode: SomeNode,
      MyUnion: MyUnion,
      MyScalar: $ElementType<Scalars, 'MyScalar'>,
      Int: $ElementType<Scalars, 'Int'>,
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
      Query: $Diff<Query, { something: * }> & { something: $ElementType<ResolversTypes, 'MyType'> },
      MyType: MyTypeCustom,
      String: $ElementType<Scalars, 'String'>,
      MyOtherType: MyOtherTypeCustom,
      Subscription: $Diff<Subscription, { somethingChanged: * }> & { somethingChanged: ?$ElementType<ResolversTypes, 'MyOtherType'> },
      Boolean: $ElementType<Scalars, 'Boolean'>,
      Node: Node,
      ID: $ElementType<Scalars, 'ID'>,
      SomeNode: SomeNode,
      MyUnion: MyUnion,
      MyScalar: $ElementType<Scalars, 'MyScalar'>,
      Int: $ElementType<Scalars, 'Int'>,
    };`);
    await validate(`type MyTypeCustom = {}; type MyOtherTypeCustom = {}; ${result}`);
  });

  it('Should build ResolversTypes with defaultMapper set using {T}', async () => {
    const result = await plugin(
      schema,
      [],
      {
        defaultMapper: '$Shape<{T}>',
      },
      { outputFile: '' }
    );

    expect(result).toBeSimilarStringTo(`
    export type ResolversTypes = {
      Query: $Shape<Query>,
      MyType: $Shape<MyType>,
      String: $ElementType<Scalars, 'String'>,
      MyOtherType: $Shape<MyOtherType>,
      Subscription: $Shape<Subscription>,
      Boolean: $ElementType<Scalars, 'Boolean'>,
      Node: $Shape<Node>,
      ID: $ElementType<Scalars, 'ID'>,
      SomeNode: $Shape<SomeNode>,
      MyUnion: $Shape<MyUnion>,
      MyScalar: $ElementType<Scalars, 'MyScalar'>,
      Int: $ElementType<Scalars, 'Int'>,
    };`);
  });

  it('Should build ResolversTypes with defaultMapper set using {T} with external identifier', async () => {
    const result = await plugin(
      schema,
      [],
      {
        defaultMapper: './my-wrapper#CustomPartial<{T}>',
      },
      { outputFile: '' }
    );

    expect(result).toBeSimilarStringTo(`import { type CustomPartial } from './my-wrapper';`);
    expect(result).toBeSimilarStringTo(`
    export type ResolversTypes = {
      Query: CustomPartial<Query>,
      MyType: CustomPartial<MyType>,
      String: $ElementType<Scalars, 'String'>,
      MyOtherType: CustomPartial<MyOtherType>,
      Subscription: CustomPartial<Subscription>,
      Boolean: $ElementType<Scalars, 'Boolean'>,
      Node: CustomPartial<Node>,
      ID: $ElementType<Scalars, 'ID'>,
      SomeNode: CustomPartial<SomeNode>,
      MyUnion: CustomPartial<MyUnion>,
      MyScalar: $ElementType<Scalars, 'MyScalar'>,
      Int: $ElementType<Scalars, 'Int'>,
    };`);
  });
});
