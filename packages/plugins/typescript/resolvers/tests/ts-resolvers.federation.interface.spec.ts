import '@graphql-codegen/testing';
import { generate } from './utils';

describe('TypeScript Resolvers Plugin + Apollo Federation - Interface', () => {
  it('generates __resolveReference for Interfaces with @key', async () => {
    const federatedSchema = /* GraphQL */ `
      type Query {
        me: Person
      }

      interface Person @key(fields: "id") {
        id: ID!
        name: PersonName!
      }

      type User implements Person @key(fields: "id") {
        id: ID!
        name: PersonName!
      }

      type Admin implements Person @key(fields: "id") {
        id: ID!
        name: PersonName!
        canImpersonate: Boolean!
      }

      type PersonName {
        first: String!
        last: String!
      }
    `;

    const content = await generate({
      schema: federatedSchema,
      config: {
        federation: true,
      },
    });

    expect(content).toMatchInlineSnapshot(`
      "import { GraphQLResolveInfo } from 'graphql';


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
        Person: Person;
        User: User;
        Admin: Admin;
      };

      /** Mapping of federation reference types */
      export type FederationReferenceTypes = {
        Person:
          ( { __typename: 'Person' }
          & GraphQLRecursivePick<FederationTypes['Person'], {"id":true}> );
        User:
          ( { __typename: 'User' }
          & GraphQLRecursivePick<FederationTypes['User'], {"id":true}> );
        Admin:
          ( { __typename: 'Admin' }
          & GraphQLRecursivePick<FederationTypes['Admin'], {"id":true}> );
      };


      /** Mapping of interface types */
      export type ResolversInterfaceTypes<_RefType extends Record<string, unknown>> = {
        Person:
          | ( User )
          | ( Admin )
        ;
      };

      /** Mapping between all available schema types and the resolvers types */
      export type ResolversTypes = {
        Query: ResolverTypeWrapper<Record<PropertyKey, never>>;
        Person: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['Person']>;
        ID: ResolverTypeWrapper<Scalars['ID']['output']>;
        User: ResolverTypeWrapper<User>;
        Admin: ResolverTypeWrapper<Admin>;
        Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
        PersonName: ResolverTypeWrapper<PersonName>;
        String: ResolverTypeWrapper<Scalars['String']['output']>;
      };

      /** Mapping between all available schema types and the resolvers parents */
      export type ResolversParentTypes = {
        Query: Record<PropertyKey, never>;
        Person: ResolversInterfaceTypes<ResolversParentTypes>['Person'];
        ID: Scalars['ID']['output'];
        User: User | FederationReferenceTypes['User'];
        Admin: Admin | FederationReferenceTypes['Admin'];
        Boolean: Scalars['Boolean']['output'];
        PersonName: PersonName;
        String: Scalars['String']['output'];
      };

      export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
        me?: Resolver<Maybe<ResolversTypes['Person']>, ParentType, ContextType>;
      };

      export type PersonResolvers<ContextType = any, ParentType extends ResolversParentTypes['Person'] = ResolversParentTypes['Person'], FederationReferenceType extends FederationReferenceTypes['Person'] = FederationReferenceTypes['Person']> = {
        __resolveType: TypeResolveFn<'User' | 'Admin', ParentType, ContextType>;
        __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['Person']> | FederationReferenceType, FederationReferenceType, ContextType>;
      };

      export type UserResolvers<ContextType = any, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User'], FederationReferenceType extends FederationReferenceTypes['User'] = FederationReferenceTypes['User']> = {
        __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['User']> | FederationReferenceType, FederationReferenceType, ContextType>;
        id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
        name?: Resolver<ResolversTypes['PersonName'], ParentType, ContextType>;
        __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
      };

      export type AdminResolvers<ContextType = any, ParentType extends ResolversParentTypes['Admin'] = ResolversParentTypes['Admin'], FederationReferenceType extends FederationReferenceTypes['Admin'] = FederationReferenceTypes['Admin']> = {
        __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['Admin']> | FederationReferenceType, FederationReferenceType, ContextType>;
        id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
        name?: Resolver<ResolversTypes['PersonName'], ParentType, ContextType>;
        canImpersonate?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
        __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
      };

      export type PersonNameResolvers<ContextType = any, ParentType extends ResolversParentTypes['PersonName'] = ResolversParentTypes['PersonName']> = {
        first?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
        last?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
      };

      export type Resolvers<ContextType = any> = {
        Query?: QueryResolvers<ContextType>;
        Person?: PersonResolvers<ContextType>;
        User?: UserResolvers<ContextType>;
        Admin?: AdminResolvers<ContextType>;
        PersonName?: PersonNameResolvers<ContextType>;
      };

      "
    `);
  });

  it('generates normal Interface fields with addInterfaceFieldResolverTypes:true', async () => {
    const federatedSchema = /* GraphQL */ `
      type Query {
        me: Person
      }

      interface Person @key(fields: "id") {
        id: ID!
        name: PersonName!
      }

      type User implements Person @key(fields: "id") {
        id: ID!
        name: PersonName!
      }

      type Admin implements Person @key(fields: "id") {
        id: ID!
        name: PersonName!
        canImpersonate: Boolean!
      }

      type PersonName {
        first: String!
        last: String!
      }
    `;

    const content = await generate({
      schema: federatedSchema,
      config: {
        federation: true,
        addInterfaceFieldResolverTypes: true,
      },
    });

    expect(content).toBeSimilarStringTo(`
      export type PersonResolvers<ContextType = any, ParentType extends ResolversParentTypes['Person'] = ResolversParentTypes['Person'], FederationReferenceType extends FederationReferenceTypes['Person'] = FederationReferenceTypes['Person']> = {
        __resolveType: TypeResolveFn<'User' | 'Admin', ParentType, ContextType>;
        __resolveReference?: ReferenceResolver<Maybe<ResolversTypes['Person']> | FederationReferenceType, FederationReferenceType, ContextType>;
        id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
        name?: Resolver<ResolversTypes['PersonName'], ParentType, ContextType>;
      };
    `);
  });
});
