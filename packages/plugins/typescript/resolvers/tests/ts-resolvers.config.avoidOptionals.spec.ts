import { resolversTestingSchema, resolversTestingValidate } from '@graphql-codegen/testing';
import { buildSchema } from 'graphql';
import type { Types } from '@graphql-codegen/plugin-helpers';
import { plugin } from '../src/index.js';

describe('TypeScript Resolvers Plugin - config.avoidOptionals', () => {
  it('should generate basic type resolvers if config.avoidOptionals = true', async () => {
    const result = (await plugin(
      resolversTestingSchema,
      [],
      { avoidOptionals: true },
      { outputFile: '' }
    )) as Types.ComplexPluginOutput;

    expect(result.content).toBeSimilarStringTo(`
    export type MyDirectiveDirectiveArgs = {
      arg: Scalars['Int']['input'];
      arg2: Scalars['String']['input'];
      arg3: Scalars['Boolean']['input'];
    };`);

    expect(result.content).toBeSimilarStringTo(`
    export type MyDirectiveDirectiveResolver<Result, Parent, ContextType = any, Args = MyDirectiveDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;`);

    expect(result.content).toBeSimilarStringTo(`
      export type MyOtherTypeResolvers<ContextType = any, ParentType extends ResolversParentTypes['MyOtherType'] = ResolversParentTypes['MyOtherType']> = {
        bar: Resolver<ResolversTypes['String'], ParentType, ContextType>;
        __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
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
        unionChild: Resolver<Maybe<ResolversTypes['ChildUnion']>, ParentType, ContextType>;
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
        something: Resolver<ResolversTypes['MyType'], ParentType, ContextType>;
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type SomeNodeResolvers<ContextType = any, ParentType extends ResolversParentTypes['SomeNode'] = ResolversParentTypes['SomeNode']> = {
        id: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
        __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type SubscriptionResolvers<ContextType = any, ParentType extends ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription']> = {
        somethingChanged: SubscriptionResolver<Maybe<ResolversTypes['MyOtherType']>, "somethingChanged", ParentType, ContextType>;
      };
    `);

    await resolversTestingValidate(result);
  });

  it('#7005 - avoidOptionals should preserve optional resolvers', async () => {
    const testSchema = buildSchema(/* GraphQL */ `
      type Query {
        users(filter: UserFilterInput = {}): [User!]!
        ping: String!
      }

      input UserFilterInput {
        status: String = "ACTIVE"
      }

      type User {
        id: ID!
      }
    `);

    const output = (await plugin(
      testSchema,
      [],
      {
        avoidOptionals: {
          defaultValue: true,
          field: true,
          inputValue: true,
          object: true,
          resolvers: false,
        },
      } as any,
      { outputFile: 'graphql.ts' }
    )) as Types.ComplexPluginOutput;

    expect(output.content).toBeSimilarStringTo(`
      export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
        users?: Resolver<Array<ResolversTypes['User']>, ParentType, ContextType, RequireFields<QueryUsersArgs, 'filter'>>;
        ping?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
      };
    `);
  });

  it('#9438 - avoidOptionals should not wrap arguments with partial', async () => {
    const testSchema = buildSchema(/* GraphQL */ `
      type Query {
        users(filter: UserFilterInput): [User!]!
      }

      input UserFilterInput {
        status: String = "ACTIVE"
      }

      type User {
        id: ID!
      }
    `);

    const output = (await plugin(
      testSchema,
      [],
      {
        avoidOptionals: {
          defaultValue: true,
          field: true,
          inputValue: true,
          object: true,
          resolvers: false,
        },
      } as any,
      { outputFile: 'graphql.ts' }
    )) as Types.ComplexPluginOutput;

    expect(output.content).toBeSimilarStringTo(`
      export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
        users?: Resolver<Array<ResolversTypes['User']>, ParentType, ContextType, QueryUsersArgs>;
      };
    `);
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
});

describe('TypeScript Resolvers Plugin - config.avoidOptionals - query, mutation, subscription', () => {
  const testSchema = buildSchema(/* GraphQL */ `
    type Query {
      user: User
      currentAppVersion: String!
    }

    type Mutation {
      updateUser: User!
      flagUser: User!
    }

    type Subscription {
      userUpdates: User!
      appVersionUpdates: String!
    }

    type User {
      id: ID!
    }
  `);

  it('avoids non-optional Query fields if config.avoidOptionals.query = true', async () => {
    const output = (await plugin(
      testSchema,
      [],
      { avoidOptionals: { query: true } },
      { outputFile: 'graphql.ts' }
    )) as Types.ComplexPluginOutput;

    expect(output.content).toBeSimilarStringTo(`
      export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
        user: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
        currentAppVersion: Resolver<ResolversTypes['String'], ParentType, ContextType>;
      };
    `);

    expect(output.content).toBeSimilarStringTo(`
      export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
        updateUser?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
        flagUser?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
      };
    `);

    expect(output.content).toBeSimilarStringTo(`
      export type SubscriptionResolvers<ContextType = any, ParentType extends ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription']> = {
        userUpdates?: SubscriptionResolver<ResolversTypes['User'], "userUpdates", ParentType, ContextType>;
        appVersionUpdates?: SubscriptionResolver<ResolversTypes['String'], "appVersionUpdates", ParentType, ContextType>;
      };
    `);
  });

  it('avoids non-optional Mutation fields if config.avoidOptionals.mutation = true', async () => {
    const output = (await plugin(
      testSchema,
      [],
      { avoidOptionals: { mutation: true } },
      { outputFile: 'graphql.ts' }
    )) as Types.ComplexPluginOutput;

    expect(output.content).toBeSimilarStringTo(`
      export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
        user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
        currentAppVersion?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
      };
    `);

    expect(output.content).toBeSimilarStringTo(`
      export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
        updateUser: Resolver<ResolversTypes['User'], ParentType, ContextType>;
        flagUser: Resolver<ResolversTypes['User'], ParentType, ContextType>;
      };
    `);

    expect(output.content).toBeSimilarStringTo(`
      export type SubscriptionResolvers<ContextType = any, ParentType extends ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription']> = {
        userUpdates?: SubscriptionResolver<ResolversTypes['User'], "userUpdates", ParentType, ContextType>;
        appVersionUpdates?: SubscriptionResolver<ResolversTypes['String'], "appVersionUpdates", ParentType, ContextType>;
      };
    `);
  });

  it('avoids non-optional Subscription fields if config.avoidOptionals.subscription = true', async () => {
    const output = (await plugin(
      testSchema,
      [],
      { avoidOptionals: { subscription: true } },
      { outputFile: 'graphql.ts' }
    )) as Types.ComplexPluginOutput;

    expect(output.content).toBeSimilarStringTo(`
      export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
        user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
        currentAppVersion?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
      };
    `);

    expect(output.content).toBeSimilarStringTo(`
      export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
        updateUser?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
        flagUser?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
      };
    `);

    expect(output.content).toBeSimilarStringTo(`
      export type SubscriptionResolvers<ContextType = any, ParentType extends ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription']> = {
        userUpdates: SubscriptionResolver<ResolversTypes['User'], "userUpdates", ParentType, ContextType>;
        appVersionUpdates: SubscriptionResolver<ResolversTypes['String'], "appVersionUpdates", ParentType, ContextType>;
      };
    `);
  });
});
