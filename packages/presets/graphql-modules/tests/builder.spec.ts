import '@graphql-codegen/testing';
import { BaseVisitor } from '@graphql-codegen/visitor-plugin-common';
import { parse } from 'graphql';
import { buildModule } from '../src/builder.js';

const ROOT_TYPES = ['Query'];

const testDoc = parse(/* GraphQL */ `
  scalar DateTime
  scalar URL

  type Article {
    id: ID!
    title: String!
    text: String!
    author: User!
    comments: [Comment!]
    url: URL!
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

const baseVisitor = new BaseVisitor({}, {});

test('should generate interface field resolvers', () => {
  const output = buildModule(
    'test',
    parse(/* GraphQL */ `
      interface BaseUser {
        id: ID!
        email: String!
      }

      type User implements BaseUser {
        id: ID!
        email: String!
      }

      type Query {
        me: BaseUser!
      }
    `),
    {
      importPath: '../types',
      importNamespace: 'core',
      encapsulate: 'none',
      requireRootResolvers: false,
      shouldDeclare: false,
      rootTypes: ROOT_TYPES,
      baseVisitor,
      useGraphQLModules: true,
    }
  );

  expect(output).toContain(`BaseUser: 'id' | 'email';`);
  expect(output).toContain(`export type BaseUser = Pick<core.BaseUser, DefinedFields['BaseUser']>;`);
  expect(output).toContain(`export type BaseUserResolvers = Pick<core.BaseUserResolvers, DefinedFields['BaseUser']>;`);
});

test('should not generate graphql-modules code when useGraphQLModules=false', () => {
  const output = buildModule(
    'test',
    parse(/* GraphQL */ `
      interface BaseUser {
        id: ID!
        email: String!
      }

      type User implements BaseUser {
        id: ID!
        email: String!
      }

      type Query {
        me: BaseUser!
      }
    `),
    {
      importPath: '../types',
      importNamespace: 'core',
      encapsulate: 'none',
      shouldDeclare: false,
      rootTypes: ROOT_TYPES,
      baseVisitor,
      useGraphQLModules: false,
      requireRootResolvers: false,
    }
  );

  expect(output).not.toContain(`graphql-modules`);
  expect(output).not.toContain(`gm.`);
});

test('should generate interface extensions field resolvers ', () => {
  const output = buildModule(
    'test',
    parse(/* GraphQL */ `
      extend interface BaseUser {
        newField: String!
      }

      type Query {
        me: BaseUser!
      }
    `),
    {
      importPath: '../types',
      importNamespace: 'core',
      encapsulate: 'none',
      requireRootResolvers: false,
      shouldDeclare: false,
      rootTypes: ROOT_TYPES,
      baseVisitor,
      useGraphQLModules: true,
    }
  );

  expect(output).toContain(`BaseUser: 'newField';`);
  expect(output).toContain(`export type BaseUser = core.BaseUser`);
  expect(output).toContain(`export type BaseUserResolvers = Pick<core.BaseUserResolvers, DefinedFields['BaseUser']>;`);
});

test('should include import statement', () => {
  const output = buildModule('test', testDoc, {
    importPath: '../types',
    importNamespace: 'core',
    encapsulate: 'none',
    requireRootResolvers: false,
    shouldDeclare: false,
    rootTypes: ROOT_TYPES,
    baseVisitor,
    useGraphQLModules: true,
  });

  expect(output).toBeSimilarStringTo(`
    import * as core from "../types";
  `);
});

test('should include import type statement', () => {
  const output = buildModule('test', testDoc, {
    importPath: '../types',
    importNamespace: 'core',
    encapsulate: 'none',
    requireRootResolvers: false,
    shouldDeclare: false,
    rootTypes: ROOT_TYPES,
    baseVisitor,
    useGraphQLModules: true,
    useTypeImports: true,
  });

  expect(output).toBeSimilarStringTo(`
    import type * as core from "../types";
  `);
});

test('should work with naming conventions', () => {
  const output = buildModule('test', parse(`type query_root { test: ID! } schema { query: query_root }`), {
    importPath: '../types',
    importNamespace: 'core',
    encapsulate: 'none',
    requireRootResolvers: false,
    shouldDeclare: false,
    rootTypes: ROOT_TYPES,
    baseVisitor,
    useGraphQLModules: true,
  });

  expect(output).toContain(`Pick<core.Query_RootResolvers, `);
  expect(output).toContain(`Pick<core.Query_Root,`);
});

test('encapsulate: should wrap correctly with namespace', () => {
  const output = buildModule('test', testDoc, {
    importPath: '../types',
    importNamespace: 'core',
    encapsulate: 'namespace',
    requireRootResolvers: false,
    shouldDeclare: false,
    rootTypes: ROOT_TYPES,
    baseVisitor,
    useGraphQLModules: true,
  });

  expect(output).toBeSimilarStringTo(`export namespace TestModule {`);
  expect(output).toMatchSnapshot();
});

test('encapsulate: should wrap correctly with a declared namespace', () => {
  const output = buildModule('test', testDoc, {
    importPath: '../types',
    importNamespace: 'core',
    encapsulate: 'namespace',
    requireRootResolvers: false,
    shouldDeclare: true,
    rootTypes: ROOT_TYPES,
    baseVisitor,
    useGraphQLModules: true,
  });

  expect(output).toBeSimilarStringTo(`declare namespace TestModule {`);
});

test('encapsulate: should wrap correctly with prefix', () => {
  const output = buildModule('test', testDoc, {
    importPath: '../types',
    importNamespace: 'core',
    encapsulate: 'prefix',
    requireRootResolvers: false,
    shouldDeclare: false,
    rootTypes: ROOT_TYPES,
    baseVisitor,
    useGraphQLModules: true,
  });

  expect(output).toMatchSnapshot();
  expect(output).toContain(`export type Test_Article`);
  expect(output).toContain(`export type Test_User`);
  expect(output).toContain(`export type Test_Scalars`);
  expect(output).toContain(`export type Test_ArticleResolvers`);
  expect(output).toContain(`export interface Test_Resolvers`);
  expect(output).toContain(`export interface Test_MiddlewareMap`);
  expect(output).toContain(`interface DefinedFields {`);
  expect(output).toContain(`interface DefinedEnumValues {`);
  expect(output).toContain(`interface DefinedInputFields {`);
  expect(output).not.toBeSimilarStringTo(`export namespace Test {`);
});

test('should pick fields from defined and extended types', () => {
  const output = buildModule('test', testDoc, {
    importPath: '../types',
    importNamespace: 'core',
    encapsulate: 'none',
    requireRootResolvers: false,
    shouldDeclare: false,
    rootTypes: ROOT_TYPES,
    baseVisitor,
    useGraphQLModules: true,
  });

  expect(output).toBeSimilarStringTo(`
    interface DefinedFields {
      Article: 'id' | 'title' | 'text' | 'author' | 'comments' | 'url';
      Query: 'articles' | 'articleById' | 'articlesByUser';
      User: 'articles';
      Node: 'id';
    };
  `);

  expect(output).toBeSimilarStringTo(`
    interface DefinedEnumValues {
      UserKind: 'ADMIN' | 'WRITER' | 'REGULAR';
    };
  `);

  expect(output).toBeSimilarStringTo(`
    interface DefinedInputFields {
      NewArticle: 'title' | 'text';
    };
  `);
});

test('should reexport used types but not defined in module', () => {
  const output = buildModule('test', testDoc, {
    importPath: '../types',
    importNamespace: 'core',
    encapsulate: 'none',
    requireRootResolvers: false,
    shouldDeclare: false,
    rootTypes: ROOT_TYPES,
    baseVisitor,
    useGraphQLModules: true,
  });

  expect(output).toBeSimilarStringTo(`
    export type User = core.User;
  `);
  expect(output).toBeSimilarStringTo(`
    export type Comment = core.Comment;
  `);
});

test('should export partial types, only those defined in module or root types', () => {
  const output = buildModule('test', testDoc, {
    importPath: '../types',
    importNamespace: 'core',
    encapsulate: 'none',
    requireRootResolvers: false,
    shouldDeclare: false,
    rootTypes: ROOT_TYPES,
    baseVisitor,
    useGraphQLModules: true,
  });

  expect(output).toBeSimilarStringTo(`
    export type Article = Pick<core.Article, DefinedFields['Article']>;
  `);
  expect(output).toBeSimilarStringTo(`
    export type Query = Pick<core.Query, DefinedFields['Query']>;
  `);
  expect(output).toBeSimilarStringTo(`
    export type UserKind = DefinedEnumValues['UserKind'];
  `);
  expect(output).toBeSimilarStringTo(`
    export type NewArticle = Pick<core.NewArticle, DefinedInputFields['NewArticle']>;
  `);
  expect(output).toBeSimilarStringTo(`
    export type Node = Pick<core.Node, DefinedFields['Node']>;
  `);
  expect(output).toBeSimilarStringTo(`
    export type ArticleOrUser = core.ArticleOrUser;
  `);
});

test('should export partial types of scalars, only those defined in module or root types', () => {
  const output = buildModule('test', testDoc, {
    importPath: '../types',
    importNamespace: 'core',
    encapsulate: 'none',
    requireRootResolvers: false,
    shouldDeclare: false,
    rootTypes: ROOT_TYPES,
    baseVisitor,
    useGraphQLModules: true,
  });

  expect(output).toBeSimilarStringTo(`
    export type Scalars = Pick<core.Scalars, 'DateTime' | 'URL'>;
  `);

  // DateTime type should not be generated
  expect(output).not.toBeSimilarStringTo(`
    export type DateTime =
  `);
});

test('should use and export resolver signatures of types defined or extended in a module', () => {
  const output = buildModule('test', testDoc, {
    importPath: '../types',
    importNamespace: 'core',
    encapsulate: 'none',
    requireRootResolvers: false,
    shouldDeclare: false,
    rootTypes: ROOT_TYPES,
    baseVisitor,
    useGraphQLModules: true,
  });

  expect(output).toBeSimilarStringTo(`
    export type ArticleResolvers = Pick<core.ArticleResolvers, DefinedFields['Article'] | '__isTypeOf'>;
  `);
  expect(output).toBeSimilarStringTo(`
    export type QueryResolvers = Pick<core.QueryResolvers, DefinedFields['Query']>;
  `);
  expect(output).toBeSimilarStringTo(`
    export type UserResolvers = Pick<core.UserResolvers, DefinedFields['User']>;
  `);
  expect(output).toBeSimilarStringTo(`
    export type DateTimeScalarConfig = core.DateTimeScalarConfig;
  `);
  expect(output).toBeSimilarStringTo(`
    export type UrlScalarConfig = core.UrlScalarConfig;
  `);
  // Interfaces should not have resolvers
  // We want Object types to have __isTypeOf
  expect(output).toBeSimilarStringTo(`
    export type NodeResolvers
  `);
  // Unions should not have resolvers
  // We want Object types to have __isTypeOf
  expect(output).not.toBeSimilarStringTo(`
    export type ArticleOrUserResolvers
  `);
});

test('should not generate resolver signatures of types that are not defined or extened by a module', () => {
  const output = buildModule('test', testDoc, {
    importPath: '../types',
    importNamespace: 'core',
    encapsulate: 'none',
    requireRootResolvers: false,
    shouldDeclare: false,
    rootTypes: ROOT_TYPES,
    baseVisitor,
    useGraphQLModules: true,
  });

  expect(output).not.toContain('CommentResolvers');
});

test('should generate an aggregation of individual resolver signatures', () => {
  const output = buildModule('test', testDoc, {
    importPath: '../types',
    importNamespace: 'core',
    encapsulate: 'none',
    requireRootResolvers: false,
    shouldDeclare: false,
    rootTypes: ROOT_TYPES,
    baseVisitor,
    useGraphQLModules: true,
  });

  expect(output).toBeSimilarStringTo(`
    export interface Resolvers {
      Article?: ArticleResolvers;
      Query?: QueryResolvers;
      User?: UserResolvers;
      DateTime?: core.Resolvers['DateTime'];
      URL?: core.Resolvers['URL'];
    };
  `);
});

test('should generate a signature for ResolveMiddleware (with widlcards)', () => {
  const output = buildModule('test', testDoc, {
    importPath: '../types',
    importNamespace: 'core',
    encapsulate: 'none',
    requireRootResolvers: false,
    shouldDeclare: false,
    rootTypes: ROOT_TYPES,
    baseVisitor,
    useGraphQLModules: true,
  });

  expect(output).toContain(`import * as gm from "graphql-modules";`);

  expect(output).toBeSimilarStringTo(`
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
        comments?: gm.Middleware[];
        url?: gm.Middleware[];
      };
      User?: {
        '*'?: gm.Middleware[];
        articles?: gm.Middleware[];
      };
      Query?: {
        '*'?: gm.Middleware[];
        articles?: gm.Middleware[];
        articleById?: gm.Middleware[];
        articlesByUser?: gm.Middleware[];
      };
    };
  `);
});

test('only picks __isTypeOf from implementing types (of Interfaces) and union members', () => {
  const output = buildModule(
    'test',
    parse(/* GraphQL */ `
      type Query {
        me: User
        pet: Pet
        offer: Offer
      }

      type User {
        id: ID!
        username: String!
      }

      interface Pet {
        id: ID!
        name: String!
      }
      type Cat implements Pet {
        id: ID!
        name: String!
        canScratch: Boolean!
      }
      type Dog implements Pet {
        id: ID!
        name: String!
        canBark: Boolean!
      }
      type Elephant {
        id: ID!
      }
      extend type Elephant implements Pet {
        name: String!
        hasTrunk: Boolean!
      }

      union Offer = Discount | Coupon
      type Discount {
        id: ID!
        name: String!
      }
      type Coupon {
        id: ID!
        name: String!
      }
    `),
    {
      importPath: '../types',
      importNamespace: 'core',
      encapsulate: 'none',
      requireRootResolvers: false,
      shouldDeclare: false,
      rootTypes: ROOT_TYPES,
      baseVisitor,
      useGraphQLModules: true,
    }
  );

  // User does not pick `__isTypeOf` because it is not a union member, or implementing types
  expect(output).toBeSimilarStringTo(`
    export type UserResolvers = Pick<core.UserResolvers, DefinedFields['User']>;
  `);

  // Cat picks `__isTypeOf` because it is an implementing type of Pet
  expect(output).toBeSimilarStringTo(`
    export type CatResolvers = Pick<core.CatResolvers, DefinedFields['Cat'] | '__isTypeOf'>;
  `);
  // Dog picks `__isTypeOf` because it is an implementing type of Pet
  expect(output).toBeSimilarStringTo(`
    export type DogResolvers = Pick<core.DogResolvers, DefinedFields['Dog'] | '__isTypeOf'>;
  `);
  // Elephant picks `__isTypeOf` because it is an implementing type of Pet, via `extend type `
  expect(output).toBeSimilarStringTo(`
    export type ElephantResolvers = Pick<core.ElephantResolvers, DefinedFields['Elephant'] | '__isTypeOf'>;
  `);

  // Discount picks `__isTypeOf` because it is a union member
  expect(output).toBeSimilarStringTo(`
    export type DiscountResolvers = Pick<core.DiscountResolvers, DefinedFields['Discount'] | '__isTypeOf'>;
  `);
  // Coupon picks `__isTypeOf` because it is a union member
  expect(output).toBeSimilarStringTo(`
    export type CouponResolvers = Pick<core.CouponResolvers, DefinedFields['Coupon'] | '__isTypeOf'>;
  `);
});
