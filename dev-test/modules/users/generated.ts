import * as Types from '../types';

import * as gm from 'graphql-modules';

interface DefinedFields {
  User: 'id' | 'firstName' | 'lastName';
  Query: 'users' | 'userById';
}

export type User = Pick<Types.User, DefinedFields['User']>;
export type Query = Pick<Types.Query, DefinedFields['Query']>;

export type UserResolvers = Pick<Types.UserResolvers, DefinedFields['User'] | '__isTypeOf'>;
export type QueryResolvers = Pick<Types.QueryResolvers, DefinedFields['Query']>;

export interface Resolvers {
  User?: UserResolvers;
  Query?: QueryResolvers;
}

export interface ResolveMiddlewareMap {
  '*'?: {
    '*'?: gm.ResolveMiddleware[];
  };
  User?: {
    '*'?: gm.ResolveMiddleware[];
    id?: gm.ResolveMiddleware[];
    firstName?: gm.ResolveMiddleware[];
    lastName?: gm.ResolveMiddleware[];
  };
  Query?: {
    '*'?: gm.ResolveMiddleware[];
    users?: gm.ResolveMiddleware[];
    userById?: gm.ResolveMiddleware[];
  };
}
