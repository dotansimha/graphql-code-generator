import * as Types from '../types';

import * as gm from 'graphql-modules';

type DefinedFields = {
  Article: 'id' | 'title' | 'text' | 'author';
  Query: 'articles' | 'articleById' | 'articlesByUser';
};

export type Article = Pick<Types.Article, DefinedFields['Article']>;
export type User = Types.User;
export type Query = Pick<Types.Query, DefinedFields['Query']>;

export type ArticleResolvers = Pick<Types.ArticleResolvers, DefinedFields['Article'] | '__isTypeOf'>;
export type QueryResolvers = Pick<Types.QueryResolvers, DefinedFields['Query']>;

export type Resolvers = {
  Article?: ArticleResolvers;
  Query?: QueryResolvers;
};

export interface ResolveMiddlewareMap {
  '*'?: gm.ResolveMiddleware[];
  'Article.*'?: gm.ResolveMiddleware[];
  'Query.*'?: gm.ResolveMiddleware[];
  'Article.id'?: gm.ResolveMiddleware[];
  'Article.title'?: gm.ResolveMiddleware[];
  'Article.text'?: gm.ResolveMiddleware[];
  'Article.author'?: gm.ResolveMiddleware[];
  'Query.articles'?: gm.ResolveMiddleware[];
  'Query.articleById'?: gm.ResolveMiddleware[];
  'Query.articlesByUser'?: gm.ResolveMiddleware[];
}
