import '@graphql-codegen/testing';
import { parse } from 'graphql';
import { buildModule } from '../src/builder';

const testDoc = parse(/* GraphQL */ `
  scalar DateTime

  type Article {
    id: ID!
    title: String!
    text: String!
    author: User!
    comments: [Comment!]
  }

  interface Node {
    id: ID!
  }

  union ArticleOrUser = Article | User

  input NewArticle {
    title: String!
    text: String!
  }

  extend type User {
    articles: [Article!]
  }

  extend type Query {
    articles: [Article!]
    articleById(id: ID!): Article
    articlesByUser(userId: ID!): [Article!]
  }

  enum UserKind {
    ADMIN
    WRITER
    REGULAR
  }
`);

test('should include import statement', () => {
  const output = buildModule(testDoc, {
    importPath: '../types',
    importNamespace: 'core',
  });

  expect(output).toBeSimilarStringTo(`
    import * as core from "../types";
  `);
});

test('should pick fields from defined and extended types', () => {
  const output = buildModule(testDoc, {
    importPath: '../types',
    importNamespace: 'core',
  });

  expect(output).toBeSimilarStringTo(`
    type DefinedFields = {
      Article: 'id' | 'title' | 'text' | 'author' | 'comments' | 'isTypeOf';
      Query: 'articles' | 'articleById' | 'articlesByUser';
      User: 'articles';
    };
  `);

  expect(output).toBeSimilarStringTo(`
    type DefinedEnumValues = {
      UserKind: 'ADMIN' | 'WRITER' | 'REGULAR';
    };
  `);

  expect(output).toBeSimilarStringTo(`
    type DefinedInputFields = {
      NewArticle: 'title' | 'text';
    };
  `);
});

test('should reexport used types but not defined in module', () => {
  const output = buildModule(testDoc, {
    importPath: '../types',
    importNamespace: 'core',
  });

  expect(output).toBeSimilarStringTo(`
    export type User = core.User;
  `);
  expect(output).toBeSimilarStringTo(`
    export type Comment = core.Comment;
  `);
});

test('should export partial types, only those defined in module or root types', () => {
  const output = buildModule(testDoc, {
    importPath: '../types',
    importNamespace: 'core',
  });

  expect(output).toBeSimilarStringTo(`
    export type Article = Pick<core.Article, DefinedFields['Article']>;
  `);
  expect(output).toBeSimilarStringTo(`
    export type Query = Pick<core.Query, DefinedFields['Query']>;
  `);
  expect(output).toBeSimilarStringTo(`
    export type UserKind = Pick<core.UserKind, DefinedEnumValues['UserKind']>;
  `);
  expect(output).toBeSimilarStringTo(`
    export type NewArticle = Pick<core.NewArticle, DefinedInputFields['NewArticle']>;
  `);
  expect(output).toBeSimilarStringTo(`
    export type Node = core.Node;
  `);
  expect(output).toBeSimilarStringTo(`
    export type ArticleOrUser = core.ArticleOrUser;
  `);
});

test('should export partial types of scalars, only those defined in module or root types', () => {
  const output = buildModule(testDoc, {
    importPath: '../types',
    importNamespace: 'core',
  });

  expect(output).toBeSimilarStringTo(`
    export type Scalars = Pick<core.Scalars, 'DateTime'>;
  `);

  // DateTime type should not be generated
  expect(output).not.toBeSimilarStringTo(`
    export type DateTime =
  `);
});

test('should use and export resolver signatures of types defined or extended in a module', () => {
  const output = buildModule(testDoc, {
    importPath: '../types',
    importNamespace: 'core',
  });

  expect(output).toBeSimilarStringTo(`
    export type ArticleResolvers = Pick<core.ArticleResolvers, DefinedFields['Article']>;
  `);
  expect(output).toBeSimilarStringTo(`
    export type QueryResolvers = Pick<core.QueryResolvers, DefinedFields['Query']>;
  `);
  expect(output).toBeSimilarStringTo(`
    export type UserResolvers = Pick<core.UserResolvers, DefinedFields['User']>;
  `);
  expect(output).toBeSimilarStringTo(`
    export type UserKindResolvers = Pick<core.UserKindResolvers, DefinedEnumValues['UserKind']>;
  `);
  expect(output).toBeSimilarStringTo(`
    export type DateTimeScalarConfig = core.DateTimeScalarConfig;
  `);
  // Interfaces should not have resolvers
  // We want Object types to have isTypeOf
  expect(output).not.toBeSimilarStringTo(`
    export type NodeResolvers
  `);
  // Unions should not have resolvers
  // We want Object types to have isTypeOf
  expect(output).not.toBeSimilarStringTo(`
    export type ArticleOrUserResolvers
  `);
});

test('should not generate resolver signatures of types that are not defined or extened by a module', () => {
  const output = buildModule(testDoc, {
    importPath: '../types',
    importNamespace: 'core',
  });

  expect(output).not.toContain('CommentResolvers');
});

test('should generate an aggregation of individual resolver signatures', () => {
  const output = buildModule(testDoc, {
    importPath: '../types',
    importNamespace: 'core',
  });

  expect(output).toBeSimilarStringTo(`
    export type Resolvers = {
      Article?: ArticleResolvers;
      Query?: QueryResolvers;
      User?: UserResolvers;
      DateTime?: core.Resolvers['DateTime'];
      UserKind?: UserKindResolvers;
    };
  `);
});

test('should generate a signature for ResolveMiddleware (with widlcards)', () => {
  const output = buildModule(testDoc, {
    importPath: '../types',
    importNamespace: 'core',
  });

  expect(output).toContain(`import * as gm from "graphql-modules";`);

  expect(output).toBeSimilarStringTo(`
    export interface ResolveMiddlewareMap {
      '*'?: gm.ResolveMiddleware[];
      'Article.*'?: gm.ResolveMiddleware[];
      'Query.*'?: gm.ResolveMiddleware[];
      'User.*'?: gm.ResolveMiddleware[];
      'Article.id'?: gm.ResolveMiddleware[];
      'Article.title'?: gm.ResolveMiddleware[];
      'Article.text'?: gm.ResolveMiddleware[];
      'Article.author'?: gm.ResolveMiddleware[];
      'Article.comments'?: gm.ResolveMiddleware[];
      'User.articles'?: gm.ResolveMiddleware[];
      'Query.articles'?: gm.ResolveMiddleware[];
      'Query.articleById'?: gm.ResolveMiddleware[];
      'Query.articlesByUser'?: gm.ResolveMiddleware[];
    };
  `);
});
