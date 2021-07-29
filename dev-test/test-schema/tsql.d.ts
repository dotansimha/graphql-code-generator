declare module 'tsgql' {
  export type Maybe<T> = T | null;
  export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
  export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
  export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
  import { GraphQLResolveInfo } from 'graphql';
  /** All built-in and custom scalars, mapped to their actual values */
  export type Scalars = {
    ID: string;
    String: string;
    Boolean: boolean;
    Int: number;
    Float: number;
  };

  export type Query = {
    __typename?: 'Query';
    foo: Scalars['String'];
  };

  export type ResolverTypeWrapper<T> = Promise<T> | T;

  export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
    resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
  };

  export type LegacyStitchingResolver<TResult, TParent, TContext, TArgs> = {
    fragment: string;
    resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
  };

  export type NewStitchingResolver<TResult, TParent, TContext, TArgs> = {
    selectionSet: string;
    resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
  };
  export type StitchingResolver<TResult, TParent, TContext, TArgs> =
    | LegacyStitchingResolver<TResult, TParent, TContext, TArgs>
    | NewStitchingResolver<TResult, TParent, TContext, TArgs>;
  export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
    | ResolverFn<TResult, TParent, TContext, TArgs>
    | ResolverWithResolve<TResult, TParent, TContext, TArgs>
    | StitchingResolver<TResult, TParent, TContext, TArgs>;

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
  ) => AsyncIterator<TResult> | Promise<AsyncIterator<TResult>>;

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

  export type IsTypeOfResolverFn<T = {}, TContext = {}> = (
    obj: T,
    context: TContext,
    info: GraphQLResolveInfo
  ) => boolean | Promise<boolean>;

  export type NextResolverFn<T> = () => Promise<T>;

  export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
    next: NextResolverFn<TResult>,
    parent: TParent,
    args: TArgs,
    context: TContext,
    info: GraphQLResolveInfo
  ) => TResult | Promise<TResult>;

  /** Mapping between all available schema types and the resolvers types */
  export type ResolversTypes = {
    Query: ResolverTypeWrapper<{}>;
    String: ResolverTypeWrapper<Scalars['String']>;
    Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  };

  /** Mapping between all available schema types and the resolvers parents */
  export type ResolversParentTypes = {
    Query: {};
    String: Scalars['String'];
    Boolean: Scalars['Boolean'];
  };

  export type QueryResolvers<
    ContextType = any,
    ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']
  > = {
    foo?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  };

  export type Resolvers<ContextType = any> = {
    Query?: QueryResolvers<ContextType>;
  };

  /**
   * @deprecated
   * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
   */
  export type IResolvers<ContextType = any> = Resolvers<ContextType>;
}
declare module 'tsgql' {
  import { DocumentNode, parse } from 'graphql';
  export type Resolvers = {};

  export function typeDefs<TDocumentString extends string>(sources: TDocumentString): Resolvers {
    return parse(sources);
  }
}
