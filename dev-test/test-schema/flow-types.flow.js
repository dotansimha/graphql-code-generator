// @flow

import { type GraphQLResolveInfo } from 'graphql';
export type $RequireFields<Origin, Keys> = $Diff<Origin, Keys> &
  $ObjMapi<Keys, <Key>(k: Key) => $NonMaybeType<$ElementType<Origin, Key>>>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {|
  ID: string,
  String: string,
  Boolean: boolean,
  Int: number,
  Float: number,
|};

export type Query = {|
  __typename?: 'Query',
  allUsers: Array<?User>,
  userById?: ?User,
|};

export type QueryUserByIdArgs = {|
  id: $ElementType<Scalars, 'Int'>,
|};

export type User = {|
  __typename?: 'User',
  id: $ElementType<Scalars, 'Int'>,
  name: $ElementType<Scalars, 'String'>,
  email: $ElementType<Scalars, 'String'>,
|};

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

export interface SubscriptionSubscriberObject<Result, Key: string, Parent, Context, Args> {
  subscribe: SubscriptionSubscribeFn<{ [key: Key]: Result }, Parent, Context, Args>;
  resolve?: SubscriptionResolveFn<Result, { [key: Key]: Result }, Context, Args>;
}

export interface SubscriptionResolverObject<Result, Parent, Context, Args> {
  subscribe: SubscriptionSubscribeFn<mixed, Parent, Context, Args>;
  resolve: SubscriptionResolveFn<Result, mixed, Context, Args>;
}

export type SubscriptionObject<Result, Key: string, Parent, Context, Args> =
  | SubscriptionSubscriberObject<Result, Key, Parent, Context, Args>
  | SubscriptionResolverObject<Result, Parent, Context, Args>;

export type SubscriptionResolver<Result, Key: string, Parent = {}, Context = {}, Args = {}> =
  | ((...args: Array<any>) => SubscriptionObject<Result, Key, Parent, Context, Args>)
  | SubscriptionObject<Result, Key, Parent, Context, Args>;

export type TypeResolveFn<Types, Parent = {}, Context = {}> = (
  parent: Parent,
  context: Context,
  info: GraphQLResolveInfo
) => ?Types | Promise<?Types>;

export type IsTypeOfResolverFn<T = {}, Context = {}> = (
  obj: T,
  context: Context,
  info: GraphQLResolveInfo
) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<Result = {}, Parent = {}, Args = {}, Context = {}> = (
  next: NextResolverFn<Result>,
  parent: Parent,
  args: Args,
  context: Context,
  info: GraphQLResolveInfo
) => Result | Promise<Result>;

export type ResolverTypeWrapper<T> = Promise<T> | T;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Query: ResolverTypeWrapper<{}>,
  Int: ResolverTypeWrapper<$ElementType<Scalars, 'Int'>>,
  User: ResolverTypeWrapper<User>,
  String: ResolverTypeWrapper<$ElementType<Scalars, 'String'>>,
  Boolean: ResolverTypeWrapper<$ElementType<Scalars, 'Boolean'>>,
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Query: {},
  Int: $ElementType<Scalars, 'Int'>,
  User: User,
  String: $ElementType<Scalars, 'String'>,
  Boolean: $ElementType<Scalars, 'Boolean'>,
};

export type QueryResolvers<ContextType = any, ParentType = $ElementType<ResolversParentTypes, 'Query'>> = {
  allUsers?: Resolver<Array<?$ElementType<ResolversTypes, 'User'>>, ParentType, ContextType>,
  userById?: Resolver<
    ?$ElementType<ResolversTypes, 'User'>,
    ParentType,
    ContextType,
    $RequireFields<QueryUserByIdArgs, { id: * }>
  >,
};

export type UserResolvers<ContextType = any, ParentType = $ElementType<ResolversParentTypes, 'User'>> = {
  id?: Resolver<$ElementType<ResolversTypes, 'Int'>, ParentType, ContextType>,
  name?: Resolver<$ElementType<ResolversTypes, 'String'>, ParentType, ContextType>,
  email?: Resolver<$ElementType<ResolversTypes, 'String'>, ParentType, ContextType>,
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>,
};

export type Resolvers<ContextType = any> = {
  Query?: QueryResolvers<ContextType>,
  User?: UserResolvers<ContextType>,
};
