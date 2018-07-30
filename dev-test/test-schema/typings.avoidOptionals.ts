/* tslint:disable */
import { GraphQLResolveInfo } from 'graphql';

export type Resolver<Result, Parent = any, Context = any, Args = any> = (
  parent?: Parent,
  args?: Args,
  context?: Context,
  info?: GraphQLResolveInfo
) => Promise<Result> | Result;

export interface Query {
  allUsers: (User | null)[];
  userById: User | null;
}

export interface User {
  id: number;
  name: string;
  email: string;
}
export interface UserByIdQueryArgs {
  id: number;
}

export namespace QueryResolvers {
  export interface Resolvers<Context = any, Parent = Query> {
    allUsers?: AllUsersResolver<(User | null)[], Parent, Context>;
    userById?: UserByIdResolver<User | null, Parent, Context>;
  }

  export type AllUsersResolver<R = (User | null)[], Parent = Query, Context = any> = Resolver<R, Parent, Context>;
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
