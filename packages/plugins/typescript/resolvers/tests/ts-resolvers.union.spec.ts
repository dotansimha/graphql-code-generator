import '@graphql-codegen/testing';
import { buildSchema } from 'graphql';
import { plugin } from '../src/index.js';

describe('TypeScript Resolvers Plugin - Union', () => {
  it('should generate ResolversUnionTypes', async () => {
    const testSchema = buildSchema(/* GraphQL */ `
      type Query {
        user(id: ID!): UserPayload!
        posts: PostsPayload!
      }

      type StandardError {
        error: String!
      }

      type User {
        id: ID!
        fullName: String!
      }

      type UserResult {
        result: User
      }

      union UserPayload = UserResult | StandardError

      type Post {
        author: String
        comment: String
      }

      type PostsResult {
        results: [Post!]!
      }

      union PostsPayload = PostsResult | StandardError
    `);
    const content = await plugin(testSchema, [], {}, { outputFile: 'graphql.ts' });

    expect(content.content).toBeSimilarStringTo(`
      export type ResolversUnionTypes<_RefType extends Record<string, unknown>> = {
        UserPayload: ( UserResult ) | ( StandardError );
        PostsPayload: ( PostsResult ) | ( StandardError );
      };
    `);

    expect(content.content).toBeSimilarStringTo(`
      export type ResolversTypes = {
        Query: ResolverTypeWrapper<{}>;
        ID: ResolverTypeWrapper<Scalars['ID']['output']>;
        StandardError: ResolverTypeWrapper<StandardError>;
        String: ResolverTypeWrapper<Scalars['String']['output']>;
        User: ResolverTypeWrapper<User>;
        UserResult: ResolverTypeWrapper<UserResult>;
        UserPayload: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['UserPayload']>;
        Post: ResolverTypeWrapper<Post>;
        PostsResult: ResolverTypeWrapper<PostsResult>;
        PostsPayload:  ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['PostsPayload']>;
        Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
      };
    `);

    expect(content.content).toBeSimilarStringTo(`
      export type ResolversParentTypes = {
        Query: {};
        ID: Scalars['ID']['output'];
        StandardError: StandardError;
        String: Scalars['String']['output'];
        User: User;
        UserResult: UserResult;
        UserPayload: ResolversUnionTypes<ResolversParentTypes>['UserPayload'];
        Post: Post;
        PostsResult: PostsResult;
        PostsPayload: ResolversUnionTypes<ResolversParentTypes>['PostsPayload'];
        Boolean: Scalars['Boolean']['output'];
      };
    `);
  });

  it('should NOT generate ResolversUnionTypes if there is no Union', async () => {
    const testSchema = buildSchema(/* GraphQL */ `
      type Query {
        user(id: ID!): User
      }

      type User {
        id: ID!
        fullName: String!
      }
    `);
    const content = await plugin(testSchema, [], {}, { outputFile: 'graphql.ts' });

    expect(content.content).not.toBeSimilarStringTo(`export type ResolversUnionTypes`);
    expect(content.content).not.toBeSimilarStringTo(`export type ResolversUnionParentTypes`);
  });

  it('generates nested types when avoidCheckingAbstractTypesRecursively=false (default)', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type StandardError {
        error: String!
      }

      type User {
        id: ID!
        fullName: String!
        posts: PostsPayload!
      }

      type UserResult {
        result: User
        recommendedPosts: PostsPayload!
      }

      union UserPayload = UserResult | StandardError

      type Post {
        author: String
        comment: String
      }

      type PostsResult {
        results: [Post!]!
      }

      union PostsPayload = PostsResult | StandardError
    `);

    const result = await plugin(schema, [], {}, { outputFile: '' });

    expect(result.content).toBeSimilarStringTo(`
      export type ResolversUnionTypes<_RefType extends Record<string, unknown>> = {
        UserPayload: ( Omit<UserResult, 'result' | 'recommendedPosts'> & { result?: Maybe<_RefType['User']>, recommendedPosts: _RefType['PostsPayload'] } ) | ( StandardError );
        PostsPayload: ( PostsResult ) | ( StandardError );
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type ResolversTypes = {
        StandardError: ResolverTypeWrapper<StandardError>;
        String: ResolverTypeWrapper<Scalars['String']['output']>;
        User: ResolverTypeWrapper<Omit<User, 'posts'> & { posts: ResolversTypes['PostsPayload'] }>;
        ID: ResolverTypeWrapper<Scalars['ID']['output']>;
        UserResult: ResolverTypeWrapper<Omit<UserResult, 'result' | 'recommendedPosts'> & { result?: Maybe<ResolversTypes['User']>, recommendedPosts: ResolversTypes['PostsPayload'] }>;
        UserPayload: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['UserPayload']>;
        Post: ResolverTypeWrapper<Post>;
        PostsResult: ResolverTypeWrapper<PostsResult>;
        PostsPayload: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['PostsPayload']>;
        Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type ResolversParentTypes = {
        StandardError: StandardError;
        String: Scalars['String']['output'];
        User: Omit<User, 'posts'> & { posts: ResolversParentTypes['PostsPayload'] };
        ID: Scalars['ID']['output'];
        UserResult: Omit<UserResult, 'result' | 'recommendedPosts'> & { result?: Maybe<ResolversParentTypes['User']>, recommendedPosts: ResolversParentTypes['PostsPayload'] };
        UserPayload: ResolversUnionTypes<ResolversParentTypes>['UserPayload'];
        Post: Post;
        PostsResult: PostsResult;
        PostsPayload: ResolversUnionTypes<ResolversParentTypes>['PostsPayload'];
        Boolean: Scalars['Boolean']['output'];
      };
    `);
  });

  it('does not generate nested types when avoidCheckingAbstractTypesRecursively=true', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type StandardError {
        error: String!
      }

      type User {
        id: ID!
        fullName: String!
        posts: PostsPayload!
      }

      type UserResult {
        result: User
        recommendedPosts: PostsPayload!
      }

      union UserPayload = UserResult | StandardError

      type Post {
        author: String
        comment: String
      }

      type PostsResult {
        results: [Post!]!
      }

      union PostsPayload = PostsResult | StandardError
    `);

    const result = await plugin(schema, [], { avoidCheckingAbstractTypesRecursively: true }, { outputFile: '' });

    expect(result.content).toBeSimilarStringTo(`
      export type ResolversUnionTypes<_RefType extends Record<string, unknown>> = {
        UserPayload: ( Omit<UserResult, 'recommendedPosts'> & { recommendedPosts: _RefType['PostsPayload'] } ) | ( StandardError );
        PostsPayload: ( PostsResult ) | ( StandardError );
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type ResolversTypes = {
        StandardError: ResolverTypeWrapper<StandardError>;
        String: ResolverTypeWrapper<Scalars['String']['output']>;
        User: ResolverTypeWrapper<Omit<User, 'posts'> & { posts: ResolversTypes['PostsPayload'] }>;
        ID: ResolverTypeWrapper<Scalars['ID']['output']>;
        UserResult: ResolverTypeWrapper<Omit<UserResult, 'recommendedPosts'> & { recommendedPosts: ResolversTypes['PostsPayload'] }>;
        UserPayload: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['UserPayload']>;
        Post: ResolverTypeWrapper<Post>;
        PostsResult: ResolverTypeWrapper<PostsResult>;
        PostsPayload: ResolverTypeWrapper<ResolversUnionTypes<ResolversTypes>['PostsPayload']>;
        Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
      };
    `);

    expect(result.content).toBeSimilarStringTo(`
      export type ResolversParentTypes = {
        StandardError: StandardError;
        String: Scalars['String']['output'];
        User: Omit<User, 'posts'> & { posts: ResolversParentTypes['PostsPayload'] };
        ID: Scalars['ID']['output'];
        UserResult: Omit<UserResult, 'recommendedPosts'> & { recommendedPosts: ResolversParentTypes['PostsPayload'] };
        UserPayload: ResolversUnionTypes<ResolversParentTypes>['UserPayload'];
        Post: Post;
        PostsResult: PostsResult;
        PostsPayload: ResolversUnionTypes<ResolversParentTypes>['PostsPayload'];
        Boolean: Scalars['Boolean']['output'];
      };
    `);
  });
});
