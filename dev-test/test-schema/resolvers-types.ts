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





export type Resolver<Result, Parent = {}, TContext = {}, Args = {}> = (
  parent: Parent,
  args: Args,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<Result> | Result;

export interface ISubscriptionResolverObject<Result, Parent, TContext, Args> {
  subscribe<R = Result, P = Parent>(
    parent: P,
    args: Args,
    context: TContext,
    info: GraphQLResolveInfo
  ): AsyncIterator<R | Result> | Promise<AsyncIterator<R | Result>>;
  resolve?<R = Result, P = Parent>(
    parent: P,
    args: Args,
    context: TContext,
    info: GraphQLResolveInfo
  ): R | Result | Promise<R | Result>;
}

export type SubscriptionResolver<Result, Parent = {}, TContext = {}, Args = {}> =
  | ((...args: any[]) => ISubscriptionResolverObject<Result, Parent, TContext, Args>)
  | ISubscriptionResolverObject<Result, Parent, TContext, Args>;

export type TypeResolveFn<Types, Parent = {}, TContext = {}> = (
  parent: Parent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<Types>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult, TArgs = {}, TContext = {}> = (
  next: NextResolverFn<TResult>,
  source: any,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo,
) => TResult | Promise<TResult>;


export namespace QueryResolvers {
  export interface Resolvers<TContext = {}, TypeParent = {}> {
    
    allUsers?: AllUsersResolver<(Maybe<User>)[], TypeParent, TContext>;
    
    userById?: UserByIdResolver<Maybe<User>, TypeParent, TContext>;
    
    answer?: AnswerResolver<number[], TypeParent, TContext>;
  }


  export type AllUsersResolver<R = (Maybe<User>)[], Parent = {}, TContext = {}> = Resolver<R, Parent, TContext>;
  export type UserByIdResolver<R = Maybe<User>, Parent = {}, TContext = {}> = Resolver<R, Parent, TContext, UserByIdArgs>;
  export interface UserByIdArgs {
    
    id: number;
  }


  export type AnswerResolver<R = number[], Parent = {}, TContext = {}> = Resolver<R, Parent, TContext>;
}

export namespace UserResolvers {
  export interface Resolvers<TContext = {}, TypeParent = User> {
    
    id?: IdResolver<number, TypeParent, TContext>;
    
    name?: NameResolver<string, TypeParent, TContext>;
    
    email?: EmailResolver<string, TypeParent, TContext>;
  }


  export type IdResolver<R = number, Parent = User, TContext = {}> = Resolver<R, Parent, TContext>;
  export type NameResolver<R = string, Parent = User, TContext = {}> = Resolver<R, Parent, TContext>;
  export type EmailResolver<R = string, Parent = User, TContext = {}> = Resolver<R, Parent, TContext>;
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
  reason?: string;
}



export type IResolvers<TContext = {}> = {
    Query?: QueryResolvers.Resolvers<TContext>;
    User?: UserResolvers.Resolvers<TContext>;
} & { [typeName: string] : never };

export type IDirectiveResolvers<Result> = {
    skip?: SkipDirectiveResolver<Result>;
    include?: IncludeDirectiveResolver<Result>;
    deprecated?: DeprecatedDirectiveResolver<Result>;
} & { [directiveName: string] : never };
