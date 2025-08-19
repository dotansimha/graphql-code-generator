import '@graphql-codegen/testing';
import { generate } from './utils';

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

      type Account @key(fields: "id") {
        id: ID!
        name: String! @external
        displayName: String! @requires(fields: "name")
      }
    `;

    const content = await generate({
      schema: federatedSchema,
      config: {
        federation: true,
        mappers: {
          User: './mappers#UserMapper',
          Account: './mappers#AccountMapper',
        },
      },
    });

    // User should have it
    expect(content).toMatchInlineSnapshot(`
      "import { GraphQLResolveInfo } from 'graphql';
      import { UserMapper, AccountMapper } from './mappers';
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
      export type Resolver<TResult, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

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

      export type SubscriptionResolver<TResult, TKey extends string, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> =
        | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
        | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

      export type TypeResolveFn<TTypes, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (
        parent: TParent,
        context: TContext,
        info: GraphQLResolveInfo
      ) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

      export type IsTypeOfResolverFn<T = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

      export type NextResolverFn<T> = () => Promise<T>;

      export type DirectiveResolverFn<TResult = Record<PropertyKey, never>, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> = (
        next: NextResolverFn<TResult>,
        parent: TParent,
        args: TArgs,
        context: TContext,
        info: GraphQLResolveInfo
      ) => TResult | Promise<TResult>;

      /** Mapping of federation types */
      export type FederationTypes = {
        User: User;
        Account: Account;
      };

      /** Mapping of federation reference types */
      export type FederationReferenceTypes = {
        User:
          ( { __typename: 'User' }
          & GraphQLRecursivePick<FederationTypes['User'], {"id":true}> );
        Account:
          ( { __typename: 'Account' }
          & GraphQLRecursivePick<FederationTypes['Account'], {"id":true}>
          & ( Record<PropertyKey, never>
              | GraphQLRecursivePick<FederationTypes['Account'], {"name":true}> ) );
      };



      /** Mapping between all available schema types and the resolvers types */
      export type ResolversTypes = {
        Query: ResolverTypeWrapper<Record<PropertyKey, never>>;
        User: ResolverTypeWrapper<UserMapper>;
        ID: ResolverTypeWrapper<Scalars['ID']['output']>;
        String: ResolverTypeWrapper<Scalars['String']['output']>;
        UserProfile: ResolverTypeWrapper<Omit<UserProfile, 'user'> & { user: ResolversTypes['User'] }>;
        Account: ResolverTypeWrapper<AccountMapper>;
        Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
      };

      /** Mapping between all available schema types and the resolvers parents */
      export type ResolversParentTypes = {
        Query: Record<PropertyKey, never>;
        User: UserMapper;
        ID: Scalars['ID']['output'];
        String: Scalars['String']['output'];
        UserProfile: Omit<UserProfile, 'user'> & { user: ResolversParentTypes['User'] };
        Account: AccountMapper;
        Boolean: Scalars['Boolean']['output'];
      };

      export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
        me?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
      };

      export type UserResolvers<ContextType = any, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User'], FederationReferenceType extends FederationReferenceTypes['User'] = FederationReferenceTypes['User']> = {
        __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['User']> | FederationReferenceType, FederationReferenceType, ContextType>;
        id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
        name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
      };

      export type UserProfileResolvers<ContextType = any, ParentType extends ResolversParentTypes['UserProfile'] = ResolversParentTypes['UserProfile']> = {
        id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
        user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
      };

      export type AccountResolvers<ContextType = any, ParentType extends ResolversParentTypes['Account'] = ResolversParentTypes['Account'], FederationReferenceType extends FederationReferenceTypes['Account'] = FederationReferenceTypes['Account']> = {
        __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['Account']> | FederationReferenceType, FederationReferenceType, ContextType>;
        id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
        displayName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
      };

      export type Resolvers<ContextType = any> = {
        Query?: QueryResolvers<ContextType>;
        User?: UserResolvers<ContextType>;
        UserProfile?: UserProfileResolvers<ContextType>;
        Account?: AccountResolvers<ContextType>;
      };

      "
    `);
  });
});
