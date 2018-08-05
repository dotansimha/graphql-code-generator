/* tslint:disable */
import { GraphQLResolveInfo } from 'graphql';

export type QueryResolver<Result, Parent = any, Context = any, Args = any> = (
  parent?: Parent,
  args?: Args,
  context?: Context,
  info?: GraphQLResolveInfo
) => Promise<Result> | Result;

export type SubscriptionResolver<Result, Parent = any, Context = any, Args = any> = {
  subscribe<R = Result, P = Parent>(
    parent?: P,
    args?: Args,
    context?: Context,
    info?: GraphQLResolveInfo
  ): AsyncIterator<R | Result>;
  resolve?<R = Result, P = Parent>(
    parent?: P,
    args?: Args,
    context?: Context,
    info?: GraphQLResolveInfo
  ): R | Result | Promise<R | Result>;
};

export type Resolver<Result, Parent = any, Context = any, Args = any> =
  | QueryResolver<Result, Parent, Context, Args>
  | SubscriptionResolver<Result, Parent, Context, Args>;

export interface Query {
  readonly allUsers: ReadonlyArray<User | null>;
  readonly userById?: User | null;
}

export interface User {
  readonly id: number;
  readonly name: string;
  readonly email: string;
}
export interface UserByIdQueryArgs {
  id: number;
}

export namespace QueryResolvers {
  export interface Resolvers<Context = any, Parent = Query> {
    allUsers?: AllUsersResolver<ReadonlyArray<User | null>, Parent, Context>;
    userById?: UserByIdResolver<User | null, Parent, Context>;
  }

  export type AllUsersResolver<R = ReadonlyArray<User | null>, Parent = Query, Context = any> = Resolver<
    R,
    Parent,
    Context
  >;
  export type UserByIdResolver<R = User | null, Parent = Query, Context = any> = Resolver<
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
  export interface Resolvers<Context = any, Parent = User> {
    id?: IdResolver<number, Parent, Context>;
    name?: NameResolver<string, Parent, Context>;
    email?: EmailResolver<string, Parent, Context>;
  }

  export type IdResolver<R = number, Parent = User, Context = any> = Resolver<R, Parent, Context>;
  export type NameResolver<R = string, Parent = User, Context = any> = Resolver<R, Parent, Context>;
  export type EmailResolver<R = string, Parent = User, Context = any> = Resolver<R, Parent, Context>;
}
