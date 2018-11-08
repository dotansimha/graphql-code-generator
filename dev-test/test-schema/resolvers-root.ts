/* tslint:disable */
import { GraphQLResolveInfo } from 'graphql';

export type Resolver<Result, Parent = any, Context = any, Args = never> = (
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

export type SubscriptionResolver<Result, Parent = any, Context = any, Args = never> =
  | ((...args: any[]) => ISubscriptionResolverObject<Result, Parent, Context, Args>)
  | ISubscriptionResolverObject<Result, Parent, Context, Args>;

// ====================================================
// START: Typescript template
// ====================================================

// ====================================================
// Types
// ====================================================

export interface User {
  id: number;

  name: string;

  email: string;
}

export interface QueryRoot {
  allUsers: (User | null)[];

  userById?: User | null;

  answer: number[];
}

export interface SubscriptionRoot {
  newUser?: User | null;
}

// ====================================================
// Arguments
// ====================================================

export interface UserByIdQueryRootArgs {
  id: number;
}

// ====================================================
// END: Typescript template
// ====================================================

// ====================================================
// Resolvers
// ====================================================

export namespace UserResolvers {
  export interface Resolvers<Context = any, TypeParent = User> {
    id?: IdResolver<number, TypeParent, Context>;

    name?: NameResolver<string, TypeParent, Context>;

    email?: EmailResolver<string, TypeParent, Context>;
  }

  export type IdResolver<R = number, Parent = User, Context = any> = Resolver<R, Parent, Context>;
  export type NameResolver<R = string, Parent = User, Context = any> = Resolver<R, Parent, Context>;
  export type EmailResolver<R = string, Parent = User, Context = any> = Resolver<R, Parent, Context>;
}

export namespace QueryRootResolvers {
  export interface Resolvers<Context = any, TypeParent = QueryRoot> {
    allUsers?: AllUsersResolver<(User | null)[], TypeParent, Context>;

    userById?: UserByIdResolver<User | null, TypeParent, Context>;

    answer?: AnswerResolver<number[], TypeParent, Context>;
  }

  export type AllUsersResolver<R = (User | null)[], Parent = QueryRoot, Context = any> = Resolver<R, Parent, Context>;
  export type UserByIdResolver<R = User | null, Parent = QueryRoot, Context = any> = Resolver<
    R,
    Parent,
    Context,
    UserByIdArgs
  >;
  export interface UserByIdArgs {
    id: number;
  }

  export type AnswerResolver<R = number[], Parent = QueryRoot, Context = any> = Resolver<R, Parent, Context>;
}

export namespace SubscriptionRootResolvers {
  export interface Resolvers<Context = any, TypeParent = SubscriptionRoot> {
    newUser?: NewUserResolver<User | null, TypeParent, Context>;
  }

  export type NewUserResolver<R = User | null, Parent = SubscriptionRoot, Context = any> = Resolver<R, Parent, Context>;
}
