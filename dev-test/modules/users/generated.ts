import * as Types from '../types.js';
import * as gm from 'graphql-modules';
export namespace UsersModule {
  interface DefinedFields {
    User: 'id' | 'firstName' | 'lastName';
    Query: 'users' | 'userById';
  }

  export type User = Pick<Types.User, DefinedFields['User']>;
  export type Query = Pick<Types.Query, DefinedFields['Query']>;

  export type UserResolvers = Pick<Types.UserResolvers, DefinedFields['User']>;
  export type QueryResolvers = Pick<Types.QueryResolvers, DefinedFields['Query']>;

  export interface Resolvers {
    User?: UserResolvers;
    Query?: QueryResolvers;
  }

  export interface MiddlewareMap {
    '*'?: {
      '*'?: gm.Middleware[];
    };
    User?: {
      '*'?: gm.Middleware[];
      id?: gm.Middleware[];
      firstName?: gm.Middleware[];
      lastName?: gm.Middleware[];
    };
    Query?: {
      '*'?: gm.Middleware[];
      users?: gm.Middleware[];
      userById?: gm.Middleware[];
    };
  }
}
