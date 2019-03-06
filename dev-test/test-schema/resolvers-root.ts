// tslint:disable
type Maybe<T> = T | null;
[object Object]
export type QueryRoot = {
  allUsers: Array<Maybe<User>>,
  userById?: Maybe<User>,
  answer: Array<number>,
};


export type QueryRootUserByIdArgs = {
  id: number
};

export type SubscriptionRoot = {
  newUser?: Maybe<User>,
};

export type User = {
  id: number,
  name: string,
  email: string,
};

[object Object]
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

export interface QueryRootResolvers<Context = any, ParentType = QueryRoot> {
  allUsers?: Resolver<Array<Maybe<User>>, ParentType, Context>,
  userById?: Resolver<Maybe<User>, ParentType, Context, QueryRootUserByIdArgs>,
  answer?: Resolver<Array<number>, ParentType, Context>,
}

export interface SubscriptionRootResolvers<Context = any, ParentType = SubscriptionRoot> {
  newUser?: SubscriptionResolver<Maybe<User>, ParentType, Context>,
}

export interface UserResolvers<Context = any, ParentType = User> {
  id?: Resolver<number, ParentType, Context>,
  name?: Resolver<string, ParentType, Context>,
  email?: Resolver<string, ParentType, Context>,
}

export type IResolvers<Context = any> = {
  QueryRoot?: QueryRootResolvers<Context>,
  SubscriptionRoot?: SubscriptionRootResolvers<Context>,
  User?: UserResolvers<Context>,
} & { [typeName: string] : { [ fieldName: string ]: ( Resolver<any, any, Context, any> | SubscriptionResolver<any, any, Context, any> ) } };

export type IDirectiveResolvers<Context = any> = {} & { [directiveName: string]: DirectiveResolverFn<any, any, Context, any> };
