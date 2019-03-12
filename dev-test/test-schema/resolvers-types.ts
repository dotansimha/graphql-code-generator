// tslint:disable
type Maybe<T> = T | null;
export type Query = {
  allUsers: Array<Maybe<User>>,
  userById?: Maybe<User>,
  answer: Array<number>,
};


export type QueryUserByIdArgs = {
  id: number
};

export type User = {
  id: number,
  name: string,
  email: string,
};

import { GraphQLResolveInfo } from 'graphql';

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent?: TParent,
  args?: TArgs,
  context?: TContext,
  info?: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type StitchingResolver<TResult, TParent, TContext, TArgs> = {
  fragment: string;
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};

export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
  | ResolverFn<TResult, TParent, TContext, TArgs>
  | StitchingResolver<TResult, TParent, TContext, TArgs>;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent?: TParent,
  args?: TArgs,
  context?: TContext,
  info?: GraphQLResolveInfo
) => AsyncIterator<TResult> | Promise<AsyncIterator<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent?: TParent,
  args?: TArgs,
  context?: TContext,
  info?: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface ISubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, TParent, TContext, TArgs>;
}

export type SubscriptionResolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => ISubscriptionResolverObject<TResult, TParent, TContext, TArgs>)
  | ISubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent?: TParent,
  context?: TContext,
  info?: GraphQLResolveInfo
) => Maybe<TTypes>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next?: NextResolverFn<TResult>,
  parent?: TParent,
  args?: TArgs,
  context?: TContext,
  info?: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface QueryResolvers<Context = any, ParentType = Query> {
  allUsers?: Resolver<Array<Maybe<User>>, ParentType, Context>,
  userById?: Resolver<Maybe<User>, ParentType, Context, QueryUserByIdArgs>,
  answer?: Resolver<Array<number>, ParentType, Context>,
}

export interface UserResolvers<Context = any, ParentType = User> {
  id?: Resolver<number, ParentType, Context>,
  name?: Resolver<string, ParentType, Context>,
  email?: Resolver<string, ParentType, Context>,
}

export type IResolvers<Context = any> = {
  Query?: QueryResolvers<Context>,
  User?: UserResolvers<Context>,
} & { [typeName: string] : { [ fieldName: string ]: ( Resolver<any, any, Context, any> | SubscriptionResolver<any, any, Context, any> ) } };

export type IDirectiveResolvers<Context = any> = {} & { [directiveName: string]: DirectiveResolverFn<any, any, Context, any> };
