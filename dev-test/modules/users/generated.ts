import * as Types from '../types';

type DefinedFields = {
  User: 'id' | 'firstName' | 'lastName';
  Query: 'users' | 'userById';
};

export type User = Pick<Types.User, DefinedFields['User']>;
export type Query = Pick<Types.Query, DefinedFields['Query']>;

export type UserResolvers = Pick<Types.UserResolvers, DefinedFields['User']>;
export type QueryResolvers = Pick<Types.QueryResolvers, DefinedFields['Query']>;

export type Resolvers = {
  User: UserResolvers;
  Query: QueryResolvers;
};
