import * as Types from '../types';

import * as gm from 'graphql-modules';

type DefinedFields = {
  User: 'id' | 'firstName' | 'lastName';
  Query: 'users' | 'userById';
};

export type User = Pick<Types.User, DefinedFields['User']>;
export type Query = Pick<Types.Query, DefinedFields['Query']>;

export type UserResolvers = Pick<Types.UserResolvers, DefinedFields['User'] | '__isTypeOf'>;
export type QueryResolvers = Pick<Types.QueryResolvers, DefinedFields['Query']>;

export type Resolvers = {
  User?: UserResolvers;
  Query?: QueryResolvers;
};

export interface ResolveMiddlewareMap {
  '*'?: gm.ResolveMiddleware[];
  'User.*'?: gm.ResolveMiddleware[];
  'Query.*'?: gm.ResolveMiddleware[];
  'User.id'?: gm.ResolveMiddleware[];
  'User.firstName'?: gm.ResolveMiddleware[];
  'User.lastName'?: gm.ResolveMiddleware[];
  'Query.users'?: gm.ResolveMiddleware[];
  'Query.userById'?: gm.ResolveMiddleware[];
}
