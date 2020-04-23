import * as Types from '../types';

type DefinedFields = {
  Article: 'id' | 'title' | 'text' | 'author';
  Query: 'articles' | 'articleById' | 'articlesByUser';
};

export type Article = Pick<Types.Article, DefinedFields['Article']>;
export type User = Types.User;
export type Query = Pick<Types.Query, DefinedFields['Query']>;

export type ArticleResolvers = Pick<Types.ArticleResolvers, DefinedFields['Article']>;
export type QueryResolvers = Pick<Types.QueryResolvers, DefinedFields['Query']>;

export type Resolvers = {
  Article: ArticleResolvers;
  Query: QueryResolvers;
};
