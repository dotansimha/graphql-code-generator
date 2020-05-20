import * as Types from '../types';

import * as gm from 'graphql-modules';

interface DefinedFields {
  Article: 'id' | 'title' | 'text' | 'author';
  Query: 'articles' | 'articleById' | 'articlesByUser';
}

export type Article = Pick<Types.Article, DefinedFields['Article']>;
export type User = Types.User;
export type Query = Pick<Types.Query, DefinedFields['Query']>;

export type ArticleResolvers = Pick<Types.ArticleResolvers, DefinedFields['Article'] | '__isTypeOf'>;
export type QueryResolvers = Pick<Types.QueryResolvers, DefinedFields['Query']>;

export interface Resolvers {
  Article?: ArticleResolvers;
  Query?: QueryResolvers;
}

export interface ResolveMiddlewareMap {
  '*'?: {
    '*'?: gm.ResolveMiddleware[];
  };
  Article?: {
    '*'?: gm.ResolveMiddleware[];
    id?: gm.ResolveMiddleware[];
    title?: gm.ResolveMiddleware[];
    text?: gm.ResolveMiddleware[];
    author?: gm.ResolveMiddleware[];
  };
  Query?: {
    '*'?: gm.ResolveMiddleware[];
    articles?: gm.ResolveMiddleware[];
    articleById?: gm.ResolveMiddleware[];
    articlesByUser?: gm.ResolveMiddleware[];
  };
}
