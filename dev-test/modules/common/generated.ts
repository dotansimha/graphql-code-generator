import * as Types from '../types.js';
import * as gm from 'graphql-modules';
export namespace CommonModule {
  interface DefinedFields {
    Query: 'ping';
    Mutation: 'pong';
  }

  export type Query = Pick<Types.Query, DefinedFields['Query']>;
  export type Mutation = Pick<Types.Mutation, DefinedFields['Mutation']>;

  export type QueryResolvers = Pick<Types.QueryResolvers, DefinedFields['Query']>;
  export type MutationResolvers = Pick<Types.MutationResolvers, DefinedFields['Mutation']>;

  export interface Resolvers {
    Query?: QueryResolvers;
    Mutation?: MutationResolvers;
  }

  export interface MiddlewareMap {
    '*'?: {
      '*'?: gm.Middleware[];
    };
    Query?: {
      '*'?: gm.Middleware[];
      ping?: gm.Middleware[];
    };
    Mutation?: {
      '*'?: gm.Middleware[];
      pong?: gm.Middleware[];
    };
  }
}
