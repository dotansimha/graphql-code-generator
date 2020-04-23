import * as Types from '../types';

type DefinedFields = {
  Query: 'ping';
  Mutation: 'pong';
};

export type Query = Pick<Types.Query, DefinedFields['Query']>;
export type Mutation = Pick<Types.Mutation, DefinedFields['Mutation']>;

export type QueryResolvers = Pick<Types.QueryResolvers, DefinedFields['Query']>;
export type MutationResolvers = Pick<Types.MutationResolvers, DefinedFields['Mutation']>;

export type Resolvers = {
  Query: QueryResolvers;
  Mutation: MutationResolvers;
};
