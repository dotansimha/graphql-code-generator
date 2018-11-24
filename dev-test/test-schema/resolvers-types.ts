// tslint:disable

// ====================================================
// Types
// ====================================================

export interface Query {
  allUsers: (User | null)[];

  userById?: User | null;
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

import { GraphQLResolveInfo, GraphQLScalarTypeConfig } from 'graphql';

export type Resolver<Result, Parent = {}, Context = {}, Args = {}> = (
  parent: Parent,
  args: Args,
  context: Context,
  info: GraphQLResolveInfo
) => Promise<Result> | Result;

export interface ISubscriptionResolverObject<Result, Parent, Context, Args> {
  subscribe<R = Result, P = Parent>(
    parent: P,
    args: Args,
    context: Context,
    info: GraphQLResolveInfo
  ): AsyncIterator<R | Result> | Promise<AsyncIterator<R | Result>>;
  resolve?<R = Result, P = Parent>(
    parent: P,
    args: Args,
    context: Context,
    info: GraphQLResolveInfo
  ): R | Result | Promise<R | Result>;
}

export type SubscriptionResolver<Result, Parent = {}, Context = {}, Args = {}> =
  | ((...args: any[]) => ISubscriptionResolverObject<Result, Parent, Context, Args>)
  | ISubscriptionResolverObject<Result, Parent, Context, Args>;

type Maybe<T> = T | null | undefined;

export type TypeResolveFn<Types, Parent = {}, Context = {}> = (
  parent: Parent,
  context: Context,
  info: GraphQLResolveInfo
) => Maybe<Types>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult, TArgs = {}, TContext = {}> = (
  next: NextResolverFn<TResult>,
  source: any,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export namespace QueryResolvers {
  export interface Resolvers<Context = {}, TypeParent = {}> {
    allUsers?: AllUsersResolver<(User | null)[], TypeParent, Context>;

    userById?: UserByIdResolver<User | null, TypeParent, Context>;
  }

  export type AllUsersResolver<R = (User | null)[], Parent = {}, Context = {}> = Resolver<R, Parent, Context>;
  export type UserByIdResolver<R = User | null, Parent = {}, Context = {}> = Resolver<R, Parent, Context, UserByIdArgs>;
  export interface UserByIdArgs {
    id: number;
  }
}

export namespace UserResolvers {
  export interface Resolvers<Context = {}, TypeParent = User> {
    id?: IdResolver<number, TypeParent, Context>;

    name?: NameResolver<string, TypeParent, Context>;

    email?: EmailResolver<string, TypeParent, Context>;
  }

  export type IdResolver<R = number, Parent = User, Context = {}> = Resolver<R, Parent, Context>;
  export type NameResolver<R = string, Parent = User, Context = {}> = Resolver<R, Parent, Context>;
  export type EmailResolver<R = string, Parent = User, Context = {}> = Resolver<R, Parent, Context>;
}

/** Directs the executor to skip this field or fragment when the `if` argument is true. */
export type SkipDirectiveResolver<Result> = DirectiveResolverFn<Result, SkipDirectiveArgs, {}>;
export interface SkipDirectiveArgs {
  /** Skipped when true. */
  if: boolean;
}

/** Directs the executor to include this field or fragment only when the `if` argument is true. */
export type IncludeDirectiveResolver<Result> = DirectiveResolverFn<Result, IncludeDirectiveArgs, {}>;
export interface IncludeDirectiveArgs {
  /** Included when true. */
  if: boolean;
}

/** Marks an element of a GraphQL schema as no longer supported. */
export type DeprecatedDirectiveResolver<Result> = DirectiveResolverFn<Result, DeprecatedDirectiveArgs, {}>;
export interface DeprecatedDirectiveArgs {
  /** Explains why this element was deprecated, usually also including a suggestion for how to access supported similar data. Formatted using the Markdown syntax (as specified by [CommonMark](https://commonmark.org/). */
  reason?: string | null;
}
