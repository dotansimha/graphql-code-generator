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

// ====================================================
// END: Typescript template
// ====================================================

// ====================================================
// Resolvers
// ====================================================

export namespace QueryResolvers {
  export interface Resolvers<Context = any, TypeParent = never> {
    allUsers?: AllUsersResolver<(User | null)[], TypeParent, Context>;

    userById?: UserByIdResolver<User | null, TypeParent, Context>;
  }

  export type AllUsersResolver<R = (User | null)[], Parent = never, Context = any> = Resolver<R, Parent, Context>;
  export type UserByIdResolver<R = User | null, Parent = never, Context = any> = Resolver<
    R,
    Parent,
    Context,
    UserByIdArgs
  >;
  export interface UserByIdArgs {
    id: number;
  }
}

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
