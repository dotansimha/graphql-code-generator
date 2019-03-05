// tslint:disable
export type Maybe<T> = T | null;








// ====================================================
// Types
// ====================================================



export interface Query {
  
  allUsers: (Maybe<User>)[];
  
  userById?: Maybe<User>;
  
  answer: number[];
}


export interface User {
  
  id: number;
  
  name: string;
  
  email: string;
}



// ====================================================
// Arguments
// ====================================================

export interface UserByIdQueryArgs {
  
  id: number;
}



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

export type DirectiveResolverFn<TResult, TArgs = {}, Context = {}> = (
  next?: NextResolverFn<TResult>,
  source?: any,
  args?: TArgs,
  context?: Context,
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
} & { [typeName: string] : { [ fieldName: string ]: ( Resolver<any, any, Context, any> | SubscriptionResolver<any, any, Context, any> ) } } ;

export type IDirectiveResolvers<Context = any> = {} & { [directiveName: string]: DirectiveResolverFn<any, any, Context> } ;
