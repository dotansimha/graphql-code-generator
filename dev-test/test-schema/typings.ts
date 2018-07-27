/* tslint:disable */
import { GraphQLResolveInfo } from 'graphql';

export type Resolver<Parent, Result, Args = any> = (
  parent?: Parent,
  args?: Args,
  context?: any,
  info?: GraphQLResolveInfo
) => Promise<Result> | Result;

export interface Query {
  allUsers: (User | null)[];
  userById?: User | null;
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
  export interface Resolvers {
    allUsers?: AllUsersResolver;
    userById?: UserByIdResolver;
  }

  export type AllUsersResolver = Resolver<Query, (User | null)[]>;
  export type UserByIdResolver = Resolver<Query, User | null, UserByIdArgs>;
  export interface UserByIdArgs {
    id: number;
  }
}

export namespace UserResolvers {
  export interface Resolvers {
    id?: IdResolver;
    name?: NameResolver;
    email?: EmailResolver;
  }

  export type IdResolver = Resolver<User, number>;
  export type NameResolver = Resolver<User, string>;
  export type EmailResolver = Resolver<User, string>;
}
