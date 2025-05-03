import * as Types from '../types.js';
import * as gm from 'graphql-modules';
export namespace BlogModule {
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

  export interface MiddlewareMap {
    '*'?: {
      '*'?: gm.Middleware[];
    };
    Article?: {
      '*'?: gm.Middleware[];
      id?: gm.Middleware[];
      title?: gm.Middleware[];
      text?: gm.Middleware[];
      author?: gm.Middleware[];
    };
    Query?: {
      '*'?: gm.Middleware[];
      articles?: gm.Middleware[];
      articleById?: gm.Middleware[];
      articlesByUser?: gm.Middleware[];
    };
  }
}
