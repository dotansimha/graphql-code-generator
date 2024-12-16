import '@graphql-codegen/testing';
import { codegen } from '@graphql-codegen/core';
import { parse } from 'graphql';
import { TypeScriptResolversPluginConfig } from '../src/config.js';
import { plugin } from '../src/index.js';

function generate({ schema, config }: { schema: string; config: TypeScriptResolversPluginConfig }) {
  return codegen({
    filename: 'graphql.ts',
    schema: parse(schema),
    documents: [],
    plugins: [{ 'typescript-resolvers': {} }],
    config,
    pluginMap: { 'typescript-resolvers': { plugin } },
  });
}

describe('TypeScript Resolvers Plugin + Apollo Federation - mappers', () => {
  it('generates FederationTypes and use it for reference type', async () => {
    const federatedSchema = /* GraphQL */ `
      type Query {
        me: User
      }

      type User @key(fields: "id") {
        id: ID!
        name: String
      }

      type UserProfile {
        id: ID!
        user: User!
      }
    `;

    const content = await generate({
      schema: federatedSchema,
      config: {
        federation: true,
        mappers: {
          User: './mappers#UserMapper',
        },
      },
    });

    // User should have it
    expect(content).toMatchInlineSnapshot(`
      "import { GraphQLResolveInfo } from 'graphql';
      import { UserMapper } from './mappers';
      export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;


      export type ResolverTypeWrapper<T> = Promise<T> | T;

      export type ReferenceResolver<TResult, TReference, TContext> = (
            reference: TReference,
            context: TContext,
            info: GraphQLResolveInfo
          ) => Promise<TResult> | TResult;

            type ScalarCheck<T, S> = S extends true ? T : NullableCheck<T, S>;
            type NullableCheck<T, S> = Maybe<T> extends T ? Maybe<ListCheck<NonNullable<T>, S>> : ListCheck<T, S>;
            type ListCheck<T, S> = T extends (infer U)[] ? NullableCheck<U, S>[] : GraphQLRecursivePick<T, S>;
            export type GraphQLRecursivePick<T, S> = { [K in keyof T & keyof S]: ScalarCheck<T[K], S[K]> };
          

      export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
        resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
      };
      export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

      export type ResolverFn<TResult, TParent, TContext, TArgs> = (
        parent: TParent,
        args: TArgs,
        context: TContext,
        info: GraphQLResolveInfo
      ) => Promise<TResult> | TResult;

      export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
        parent: TParent,
        args: TArgs,
        context: TContext,
        info: GraphQLResolveInfo
      ) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

      export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
        parent: TParent,
        args: TArgs,
        context: TContext,
        info: GraphQLResolveInfo
      ) => TResult | Promise<TResult>;

      export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
        subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
        resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
      }

      export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
        subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
        resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
      }

      export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
        | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
        | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

      export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
        | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
        | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

      export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
        parent: TParent,
        context: TContext,
        info: GraphQLResolveInfo
      ) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

      export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

      export type NextResolverFn<T> = () => Promise<T>;

      export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
        next: NextResolverFn<TResult>,
        parent: TParent,
        args: TArgs,
        context: TContext,
        info: GraphQLResolveInfo
      ) => TResult | Promise<TResult>;

      /** Mapping of federation types */
      export type FederationTypes = {
        User: User;
      };



      /** Mapping between all available schema types and the resolvers types */
      export type ResolversTypes = {
        Query: ResolverTypeWrapper<{}>;
        User: ResolverTypeWrapper<UserMapper>;
        ID: ResolverTypeWrapper<Scalars['ID']['output']>;
        String: ResolverTypeWrapper<Scalars['String']['output']>;
        UserProfile: ResolverTypeWrapper<Omit<UserProfile, 'user'> & { user: ResolversTypes['User'] }>;
        Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
      };

      /** Mapping between all available schema types and the resolvers parents */
      export type ResolversParentTypes = {
        Query: {};
        User: UserMapper;
        ID: Scalars['ID']['output'];
        String: Scalars['String']['output'];
        UserProfile: Omit<UserProfile, 'user'> & { user: ResolversParentTypes['User'] };
        Boolean: Scalars['Boolean']['output'];
      };

      export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
        me?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
      };

      export type UserResolvers<ContextType = any, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User'], FederationType extends FederationTypes['User'] = FederationTypes['User']> = {
        __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['User']>, { __typename: 'User' } & GraphQLRecursivePick<FederationType, {"id":true}>, ContextType>;
        id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
        name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
        __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
      };

      export type UserProfileResolvers<ContextType = any, ParentType extends ResolversParentTypes['UserProfile'] = ResolversParentTypes['UserProfile']> = {
        id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
        user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
        __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
      };

      export type Resolvers<ContextType = any> = {
        Query?: QueryResolvers<ContextType>;
        User?: UserResolvers<ContextType>;
        UserProfile?: UserProfileResolvers<ContextType>;
      };

      "
    `);
  });
});
