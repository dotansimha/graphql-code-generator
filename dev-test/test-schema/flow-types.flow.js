/* @flow */


export type Scalars = {
          ID: string,
  String: string,
  Boolean: boolean,
  Int: number,
  Float: number,
        };

export type Query = {
          allUsers: Array<?User>,
  userById?: ?User,
        };


export type QueryUserByIdArgs = {
          id: $ElementType<Scalars, 'Int'>
        };

export type User = {
          id: $ElementType<Scalars, 'Int'>,
  name: $ElementType<Scalars, 'String'>,
  email: $ElementType<Scalars, 'String'>,
        };

import { type GraphQLResolveInfo } from 'graphql';

export type ArrayOrIterable<T> = Array<T> | Iterable<T>;

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
) => ?Types;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<Result = {}, Parent = {}, Args = {}, Context = {}> = (
  next?: NextResolverFn<Result>,
  parent?: Parent,
  args?: Args,
  context?: Context,
  info?: GraphQLResolveInfo
) => Result | Promise<Result>;

export type QueryResolvers<Context = any, ParentType = Query> = {
          allUsers?: Resolver<ArrayOrIterable<?User>, ParentType, Context>,
  userById?: Resolver<?User, ParentType, Context, QueryUserByIdArgs>,
        };

export type UserResolvers<Context = any, ParentType = User> = {
          id?: Resolver<$ElementType<Scalars, 'Int'>, ParentType, Context>,
  name?: Resolver<$ElementType<Scalars, 'String'>, ParentType, Context>,
  email?: Resolver<$ElementType<Scalars, 'String'>, ParentType, Context>,
        };

export type IResolvers<Context = any> = {
          Query?: QueryResolvers<Context><>,
  User?: UserResolvers<Context><>,
        };

export type IDirectiveResolvers<Context = any> = {};
