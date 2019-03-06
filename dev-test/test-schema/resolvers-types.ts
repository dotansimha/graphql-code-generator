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

export type Resolver<Result, Parent = {}, Context = {}, Args = {}> = (
  parent?: Parent,
  args?: Args,
  context?: Context,
  info?: GraphQLResolveInfo
) => Promise<Result> | Result;

export type SubscriptionSubscribeFn<Result, Parent, Context, Args> = (
  parent?: Parent,
  args?: Args,
  context?: Context,
  info?: GraphQLResolveInfo
) => AsyncIterator<Result> | Promise<AsyncIterator<Result>>;

export type SubscriptionResolveFn<Result, Parent, Context, Args> = (
  parent?: Parent,
  args?: Args,
  context?: Context,
  info?: GraphQLResolveInfo
) => Result | Promise<Result>;

export interface ISubscriptionResolverObject<Result, Parent, Context, Args> {
  subscribe: SubscriptionSubscribeFn<Result, Parent, Context, Args>;
  resolve?: SubscriptionResolveFn<Result, Parent, Context, Args>;
}

export type SubscriptionResolver<Result, Parent = {}, Context = {}, Args = {}> =
  | ((...args: any[]) => ISubscriptionResolverObject<Result, Parent, Context, Args>)
  | ISubscriptionResolverObject<Result, Parent, Context, Args>;

export type TypeResolveFn<Types, Parent = {}, Context = {}> = (
  parent?: Parent,
  context?: Context,
  info?: GraphQLResolveInfo
) => Maybe<Types>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<Result = {}, Parent = {}, Context = {}, Args = {}> = (
  next?: NextResolverFn<Result>,
  parent?: Parent,
  args?: Args,
  context?: Context,
  info?: GraphQLResolveInfo
) => Result | Promise<Result>;

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
