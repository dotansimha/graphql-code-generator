/* @flow */


import { type GraphQLResolveInfo } from 'graphql';
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string,
  String: string,
  Boolean: boolean,
  Int: number,
  Float: number,
};

export type Query = {
  __typename?: 'Query',
  allUsers: Array<?User>,
  userById?: ?User,
};


export type QueryUserByIdArgs = {
  id: $ElementType<Scalars, 'Int'>
};

export type User = {
  __typename?: 'User',
  id: $ElementType<Scalars, 'Int'>,
  name: $ElementType<Scalars, 'String'>,
  email: $ElementType<Scalars, 'String'>,
};
export type Resolver<Result, Parent = {}, Context = {}, Args = {}> = (
  parent: Parent,
  args: Args,
  context: Context,
  info: GraphQLResolveInfo
) => Promise<Result> | Result;

export type SubscriptionSubscribeFn<Result, Parent, Context, Args> = (
  parent: Parent,
  args: Args,
  context: Context,
  info: GraphQLResolveInfo
) => AsyncIterator<Result> | Promise<AsyncIterator<Result>>;

export type SubscriptionResolveFn<Result, Parent, Context, Args> = (
  parent: Parent,
  args: Args,
  context: Context,
  info: GraphQLResolveInfo
) => Result | Promise<Result>;

export interface ISubscriptionResolverObject<Result, Parent, Context, Args> {
  subscribe: SubscriptionSubscribeFn<Result, Parent, Context, Args>;
  resolve?: SubscriptionResolveFn<Result, Parent, Context, Args>;
}

export type SubscriptionResolver<Result, Parent = {}, Context = {}, Args = {}> =
  | ((...args: Array<any>) => ISubscriptionResolverObject<Result, Parent, Context, Args>)
  | ISubscriptionResolverObject<Result, Parent, Context, Args>;

export type TypeResolveFn<Types, Parent = {}, Context = {}> = (
  parent: Parent,
  context: Context,
  info: GraphQLResolveInfo
) => ?Types;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<Result = {}, Parent = {}, Args = {}, Context = {}> = (
  next: NextResolverFn<Result>,
  parent: Parent,
  args: Args,
  context: Context,
  info: GraphQLResolveInfo
) => Result | Promise<Result>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Query: {},
  User: User,
  Int: $ElementType<Scalars, 'Int'>,
  String: $ElementType<Scalars, 'String'>,
  Boolean: $ElementType<Scalars, 'Boolean'>,
};

export type QueryResolvers<ContextType = any, ParentType = $ElementType<ResolversTypes, 'Query'>> = {
  allUsers?: Resolver<Array<?$ElementType<ResolversTypes, 'User'>>, ParentType, ContextType>,
  userById?: Resolver<?$ElementType<ResolversTypes, 'User'>, ParentType, ContextType, QueryUserByIdArgs>,
};

export type UserResolvers<ContextType = any, ParentType = $ElementType<ResolversTypes, 'User'>> = {
  id?: Resolver<$ElementType<ResolversTypes, 'Int'>, ParentType, ContextType>,
  name?: Resolver<$ElementType<ResolversTypes, 'String'>, ParentType, ContextType>,
  email?: Resolver<$ElementType<ResolversTypes, 'String'>, ParentType, ContextType>,
};

export type Resolvers<ContextType = any> = {
  Query?: QueryResolvers<ContextType>,
  User?: UserResolvers<ContextType>,
};


/**
 * @deprecated
 * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
*/
export type IResolvers<ContextType = any> = Resolvers<ContextType>;
