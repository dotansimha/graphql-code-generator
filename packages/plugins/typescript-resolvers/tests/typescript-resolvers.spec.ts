import 'graphql-codegen-core/dist/testing';
import { plugin } from '../dist';
import { makeExecutableSchema } from 'graphql-codegen-core';

function stripBlockComments(input: string): string {
  return input.replace(/^\/\/ [=]+\n\/\/ .*\n\/\/ [=]+/gim, '');
}

describe('Resolvers', () => {
  const schema = makeExecutableSchema({
    typeDefs: `
      type Query {
        fieldTest: String
      }

      schema {
        query: Query
      }
    `
  });

  it('should contain the Resolver type', async () => {
    const content = await plugin(
      schema,
      [],
      {},
      {
        outputFile: 'graphql.ts'
      }
    );

    expect(content).toBeSimilarStringTo(`import { GraphQLResolveInfo } from 'graphql';`);
    expect(content).toBeSimilarStringTo(`
    export type Resolver<Result, Parent = {}, Context = {}, Args = {}> = (
      parent: Parent,
      args: Args,
      context: Context,
      info: GraphQLResolveInfo
    ) => Promise<Result> | Result;
    
    export interface ISubscriptionResolverObject<Result, Parent, Context, Args> {
      subscribe<R = Result, P = Parent>(
        parent: P,
        args: Args,
        context: Context,
        info: GraphQLResolveInfo
      ): AsyncIterator<R | Result> | Promise<AsyncIterator<R | Result>>;
      resolve?<R = Result, P = Parent>(
        parent: P,
        args: Args,
        context: Context,
        info: GraphQLResolveInfo
      ): R | Result | Promise<R | Result>;
    }
    
    export type SubscriptionResolver<Result, Parent = {}, Context = {}, Args = {}> =
      | ((...args: any[]) => ISubscriptionResolverObject<Result, Parent, Context, Args>)
      | ISubscriptionResolverObject<Result, Parent, Context, Args>;
    `);
  });

  it('should make fields optional', async () => {
    const content = await plugin(
      schema,
      [],
      {},
      {
        outputFile: 'graphql.ts'
      }
    );

    expect(content).toBeSimilarStringTo(`
        export namespace QueryResolvers {
          export interface Resolvers<Context = {}, TypeParent = {}> {
            fieldTest?: FieldTestResolver<Maybe<string>, TypeParent, Context>;
          }
        `);
  });

  it('should provide a generic type of result', async () => {
    const content = await plugin(
      schema,
      [],
      {},
      {
        outputFile: 'graphql.ts'
      }
    );

    expect(content).toBeSimilarStringTo(`
        export namespace QueryResolvers {
          export interface Resolvers<Context = {}, TypeParent = {}> {
            fieldTest?: FieldTestResolver<Maybe<string>, TypeParent, Context>;
          }
          export type FieldTestResolver<R = Maybe<string>, Parent = {}, Context = {}> = Resolver<R, Parent, Context>;
        }
      `);
  });

  it('should provide a generic type of arguments and support optionals', async () => {
    const testSchema = makeExecutableSchema({
      typeDefs: `
        type Query {
          fieldTest(last: Int!, sort: String): String
        }
        
        schema {
          query: Query
        }
      `
    });

    const content = await plugin(
      testSchema,
      [],
      {},
      {
        outputFile: 'graphql.ts'
      }
    );

    expect(content).toBeSimilarStringTo(`
        export namespace QueryResolvers {
          export interface Resolvers<Context = {}, TypeParent = {}> {
            fieldTest?: FieldTestResolver<Maybe<string>, TypeParent, Context>;
          }
    
          export type FieldTestResolver<R = Maybe<string>, Parent = {}, Context = {}> = Resolver<R, Parent, Context, FieldTestArgs>;
          
          export interface FieldTestArgs {
            last: number;
            sort?: Maybe<string>;
          }
        }
      `);
  });

  it('should handle subscription', async () => {
    const testSchema = makeExecutableSchema({
      typeDefs: `
        type Subscription {
          fieldTest: String 
        }
        
        schema {
          subscription: Subscription
        }
      `
    });

    const content = stripBlockComments(
      await plugin(
        testSchema,
        [],
        {},
        {
          outputFile: 'graphql.ts'
        }
      )
    );

    expect(content).toBeSimilarStringTo(`
      export namespace SubscriptionResolvers {
        export interface Resolvers<Context = {}, TypeParent = {}> {
          fieldTest?: FieldTestResolver<Maybe<string>, TypeParent, Context>;
        }

        export type FieldTestResolver<R = Maybe<string>, Parent = {}, Context = {}> = SubscriptionResolver<R, Parent, Context>;
      }
      `);
  });

  it('should handle noNamespaces', async () => {
    const testSchema = makeExecutableSchema({
      typeDefs: `
        type Query {
          fieldTest: String 
        }
        
        schema {
          query: Query
        }
      `
    });

    const content = await plugin(
      testSchema,
      [],
      { noNamespaces: true },
      {
        outputFile: 'graphql.ts'
      }
    );

    expect(content).toBeSimilarStringTo(`
        export interface QueryResolvers<Context = {}, TypeParent = {}> {
          fieldTest?: QueryFieldTestResolver<Maybe<string>, TypeParent, Context>;
        }

        export type QueryFieldTestResolver<R = Maybe<string>, Parent = {}, Context = {}> = Resolver<R, Parent, Context>;
      `);
  });

  it('should override custom context', async () => {
    const testSchema = makeExecutableSchema({
      typeDefs: `
        type Query {
          fieldTest: String 
        }
        
        schema {
          query: Query
        }
      `
    });

    const content = await plugin(
      testSchema,
      [],
      { contextType: 'MyContext' },
      {
        outputFile: 'graphql.ts'
      }
    );

    // make sure nothing was imported
    expect(content).toBeSimilarStringTo(`
      import { GraphQLResolveInfo } from 'graphql';

      export type Resolver<Result, Parent = {}, Context = {}, Args = {}> = (
        parent: Parent,
        args: Args,
        context: Context,
        info: GraphQLResolveInfo
      ) => Promise<Result> | Result;
    `);

    expect(content).toBeSimilarStringTo(`
        export interface Resolvers<Context = MyContext, TypeParent = {}> {
          fieldTest?: FieldTestResolver<Maybe<string>, TypeParent, Context>;
        }

        export type FieldTestResolver<R = Maybe<string>, Parent = {}, Context = MyContext> = Resolver<R, Parent, Context>;
      `);
  });

  it('should override custom context with type from a module', async () => {
    const testSchema = makeExecutableSchema({
      typeDefs: `
        type Query {
          fieldTest: String 
        }
        
        schema {
          query: Query
        }
      `
    });

    const content = await plugin(
      testSchema,
      [],
      { contextType: './path/to/types#MyContext' },
      {
        outputFile: 'graphql.ts'
      }
    );

    expect(content).toBeSimilarStringTo(`
        import { MyContext } from './path/to/types';
      `);

    expect(content).toBeSimilarStringTo(`
        export interface Resolvers<Context = MyContext, TypeParent = {}> {
          fieldTest?: FieldTestResolver<Maybe<string>, TypeParent, Context>;
        }

        export type FieldTestResolver<R = Maybe<string>, Parent = {}, Context = MyContext> = Resolver<R, Parent, Context>;
      `);
  });

  it('should handle snake case and convert it to pascal case', async () => {
    const testSchema = makeExecutableSchema({
      typeDefs: `
      type snake_case_arg {
        test: String
      }  

      type snake_case_result {
        test: String
      }

      type Query {
        snake_case_root_query(
            arg: snake_case_arg
          ): snake_case_result
      }
      schema {
        query: Query
      }
    `
    });

    const content = await plugin(
      testSchema,
      [],
      {},
      {
        outputFile: 'graphql.ts'
      }
    );

    expect(content).toBeSimilarStringTo(`
      export type SnakeCaseRootQueryResolver<R = Maybe<SnakeCaseResult>, Parent = {}, Context = {}> = Resolver<R, Parent, Context, SnakeCaseRootQueryArgs>;
      `);
    expect(content).toBeSimilarStringTo(`
      export interface SnakeCaseRootQueryArgs {
        arg?: Maybe<SnakeCaseArg>;
      }
    `);
  });

  it('Should handle primitives option', async () => {
    const testSchema = makeExecutableSchema({
      typeDefs: `
      type TestType {
        id: ID!
      }  
    `
    });

    const content = await plugin(
      testSchema,
      [],
      { scalars: { ID: 'number' } },
      {
        outputFile: 'graphql.ts'
      }
    );

    expect(content).toBeSimilarStringTo(`id?: IdResolver<number, TypeParent, Context>;`);
  });

  it('should define default parent type', async () => {
    const testSchema = makeExecutableSchema({
      typeDefs: `
        type Query {
          post: Post
        }

        type Post {
          id: String
          author: User
        }

        type User {
          id: String
          name: String
        }
        
        schema {
          query: Query
        }
      `
    });

    const content = await plugin(
      testSchema,
      [],
      {},
      {
        outputFile: 'graphql.ts'
      }
    );

    expect(content).toBeSimilarStringTo(`
      export namespace QueryResolvers {
        export interface Resolvers<Context = {}, TypeParent = {}> {
          post?: PostResolver<Maybe<Post>, TypeParent, Context>;
        }
  
        export type PostResolver<R = Maybe<Post>, Parent = {}, Context = {}> = Resolver<R, Parent, Context>;
      }
    `);

    expect(content).toBeSimilarStringTo(`
      export namespace PostResolvers {
        export interface Resolvers<Context = {}, TypeParent = Post> {
          id?: IdResolver<Maybe<string>, TypeParent, Context>;
          author?: AuthorResolver<Maybe<User>, TypeParent, Context>;
        }

        export type IdResolver<R = Maybe<string>, Parent = Post, Context = {}> = Resolver<R, Parent, Context>;
        export type AuthorResolver<R = Maybe<User>, Parent = Post, Context = {}> = Resolver<R, Parent, Context>;
      }
    `);

    expect(content).toBeSimilarStringTo(`
      export namespace UserResolvers {
        export interface Resolvers<Context = {}, TypeParent = User> {
          id?: IdResolver<Maybe<string>, TypeParent, Context>;
          name?: NameResolver<Maybe<string>, TypeParent, Context>;
        }

        export type IdResolver<R = Maybe<string>, Parent = User, Context = {}> = Resolver<R, Parent, Context>;
        export type NameResolver<R = Maybe<string>, Parent = User, Context = {}> = Resolver<R, Parent, Context>;
      }
    `);
  });

  it('should define default parent type with noNamespaces', async () => {
    const testSchema = makeExecutableSchema({
      typeDefs: `
        type Query {
          post: Post
        }

        type Post {
          id: String
          author: User
        }

        type User {
          id: String
          name: String
        }
        
        schema {
          query: Query
        }
      `
    });

    const content = await plugin(
      testSchema,
      [],
      { noNamespaces: true },
      {
        outputFile: 'graphql.ts'
      }
    );

    expect(content).toBeSimilarStringTo(`
      export interface QueryResolvers<Context = {}, TypeParent = {}> {
        post?: QueryPostResolver<Maybe<Post>, TypeParent, Context>;
      }

      export type QueryPostResolver<R = Maybe<Post>, Parent = {}, Context = {}> = Resolver<R, Parent, Context>;
    `);

    expect(content).toBeSimilarStringTo(`
      export interface PostResolvers<Context = {}, TypeParent = Post> {
        id?: PostIdResolver<Maybe<string>, TypeParent, Context>;
        author?: PostAuthorResolver<Maybe<User>, TypeParent, Context>;
      }

      export type PostIdResolver<R = Maybe<string>, Parent = Post, Context = {}> = Resolver<R, Parent, Context>;
      export type PostAuthorResolver<R = Maybe<User>, Parent = Post, Context = {}> = Resolver<R, Parent, Context>;
    `);

    expect(content).toBeSimilarStringTo(`
      export interface UserResolvers<Context = {}, TypeParent = User> {
        id?: UserIdResolver<Maybe<string>, TypeParent, Context>;
        name?: UserNameResolver<Maybe<string>, TypeParent, Context>;
      }

      export type UserIdResolver<R = Maybe<string>, Parent = User, Context = {}> = Resolver<R, Parent, Context>;
      export type UserNameResolver<R = Maybe<string>, Parent = User, Context = {}> = Resolver<R, Parent, Context>;
    `);
  });

  it('should accept a map of parent types', async () => {
    const testSchema = makeExecutableSchema({
      typeDefs: `
        type Query {
          post: Post
        }

        type Post {
          id: String
          author: User
        }

        type User {
          id: String
          name: String
          post: Post
        }
        
        schema {
          query: Query
        }
      `
    });

    // type UserParent = string;
    // interface PostParent {
    //   id: string;
    //   author: string;
    // }
    const content = await plugin(
      testSchema,
      [],
      {
        mappers: {
          // it means that User type expects UserParent to be a parent
          User: './interfaces#UserParent',
          // it means that Post type expects UserParent to be a parent
          Post: './interfaces#PostParent'
        }
      },
      {
        outputFile: 'graphql.ts'
      }
    );

    // import parents
    // merge duplicates into single module
    expect(content).toBeSimilarStringTo(`
      import { UserParent, PostParent } from './interfaces';
    `);

    // should check field's result and match it with provided parents
    expect(content).toBeSimilarStringTo(`
      export namespace QueryResolvers {
        export interface Resolvers<Context = {}, TypeParent = {}> {
          post?: PostResolver<Maybe<PostParent>, TypeParent, Context>;
        }

        export type PostResolver<R = Maybe<PostParent>, Parent = {}, Context = {}> = Resolver<R, Parent, Context>;
      }
    `);

    // should check if type has a defined parent and use it as TypeParent
    expect(content).toBeSimilarStringTo(`
      export namespace PostResolvers {
        export interface Resolvers<Context = {}, TypeParent = PostParent> {
          id?: IdResolver<Maybe<string>, TypeParent, Context>;
          author?: AuthorResolver<Maybe<UserParent>, TypeParent, Context>;
        }

        export type IdResolver<R = Maybe<string>, Parent = PostParent, Context = {}> = Resolver<R, Parent, Context>;
        export type AuthorResolver<R = Maybe<UserParent>, Parent = PostParent, Context = {}> = Resolver<R, Parent, Context>;
      }
    `);

    // should check if type has a defined parent and use it as TypeParent
    // should match field's result with provided parent type
    expect(content).toBeSimilarStringTo(`
      export namespace UserResolvers {
        export interface Resolvers<Context = {}, TypeParent = UserParent> {
          id?: IdResolver<Maybe<string>, TypeParent, Context>;
          name?: NameResolver<Maybe<string>, TypeParent, Context>;
          post?: PostResolver<Maybe<PostParent>, TypeParent, Context>;
        }

        export type IdResolver<R = Maybe<string>, Parent = UserParent, Context = {}> = Resolver<R, Parent, Context>;
        export type NameResolver<R = Maybe<string>, Parent = UserParent, Context = {}> = Resolver<R, Parent, Context>;
        export type PostResolver<R = Maybe<PostParent>, Parent = UserParent, Context = {}> = Resolver<R, Parent, Context>;
      }
    `);
  });

  it('should accept mappers that reuse generated types', async () => {
    const testSchema = makeExecutableSchema({
      typeDefs: `
        type Query {
          post: Post
        }

        type Post {
          id: String
        }
        
        schema {
          query: Query
        }
      `
    });

    const content = await plugin(
      testSchema,
      [],
      {
        mappers: {
          // it means that Post type expects Post to be a parent
          Post: 'Post'
        }
      },
      {
        outputFile: 'graphql.ts'
      }
    );

    // should check field's result and match it with provided parents
    expect(content).toBeSimilarStringTo(`
      export namespace QueryResolvers {
        export interface Resolvers<Context = {}, TypeParent = {}> {
          post?: PostResolver<Maybe<Post>, TypeParent, Context>;
        }

        export type PostResolver<R = Maybe<Post>, Parent = {}, Context = {}> = Resolver<R, Parent, Context>;
      }
    `);

    // should check if type has a defined parent and use it as TypeParent
    expect(content).toBeSimilarStringTo(`
      export namespace PostResolvers {
        export interface Resolvers<Context = {}, TypeParent = Post> {
          id?: IdResolver<Maybe<string>, TypeParent, Context>;
        }

        export type IdResolver<R = Maybe<string>, Parent = Post, Context = {}> = Resolver<R, Parent, Context>;
      }
    `);
  });

  it('should use default mapper for non mapped types (external)', async () => {
    const testSchema = makeExecutableSchema({
      typeDefs: `
        type Query {
          post: Post
        }

        type Post {
          id: String
        }
        
        schema {
          query: Query
        }
      `
    });

    const content = await plugin(
      testSchema,
      [],
      {
        defaultMapper: './interfaces#AnyParent'
      },
      {
        outputFile: 'graphql.ts'
      }
    );

    expect(content).toBeSimilarStringTo(`
      import { AnyParent } from './interfaces';
    `);

    expect(content).toBeSimilarStringTo(`
      export namespace QueryResolvers {
        export interface Resolvers<Context = {}, TypeParent = {}> {
          post?: PostResolver<Maybe<AnyParent>, TypeParent, Context>;
        }

        export type PostResolver<R = Maybe<AnyParent>, Parent = {}, Context = {}> = Resolver<R, Parent, Context>;
      }
    `);

    // should get AnyParent as a parent and result shouldn't use AnyParent
    expect(content).toBeSimilarStringTo(`
      export namespace PostResolvers {
        export interface Resolvers<Context = {}, TypeParent = AnyParent> {
          id?: IdResolver<Maybe<string>, TypeParent, Context>;
        }

        export type IdResolver<R = Maybe<string>, Parent = AnyParent, Context = {}> = Resolver<R, Parent, Context>;
      }
    `);
  });

  it('should use default mapper for non mapped types (primitive)', async () => {
    const testSchema = makeExecutableSchema({
      typeDefs: `
        type Query {
          post: Post
        }

        type Post {
          id: String
        }
        
        schema {
          query: Query
        }
      `
    });

    const content = await plugin(
      testSchema,
      [],
      {
        defaultMapper: 'any'
      },
      {
        outputFile: 'graphql.ts'
      }
    );

    // make sure nothing was imported
    expect(content).toBeSimilarStringTo(`
      import { GraphQLResolveInfo } from 'graphql';

      export type Resolver<Result, Parent = {}, Context = {}, Args = {}> = (
        parent: Parent,
        args: Args,
        context: Context,
        info: GraphQLResolveInfo
      ) => Promise<Result> | Result;
    `);

    // should check field's result and match it with provided parents
    expect(content).toBeSimilarStringTo(`
      export namespace QueryResolvers {
        export interface Resolvers<Context = {}, TypeParent = {}> {
          post?: PostResolver<Maybe<any>, TypeParent, Context>;
        }

        export type PostResolver<R = Maybe<any>, Parent = {}, Context = {}> = Resolver<R, Parent, Context>;
      }
    `);

    // should check if type has a defined parent and use it as TypeParent
    expect(content).toBeSimilarStringTo(`
      export namespace PostResolvers {
        export interface Resolvers<Context = {}, TypeParent = any> {
          id?: IdResolver<Maybe<string>, TypeParent, Context>;
        }

        export type IdResolver<R = Maybe<string>, Parent = any, Context = {}> = Resolver<R, Parent, Context>;
      }
    `);
  });

  it('make sure mappers work with mutations', async () => {
    const testSchema = makeExecutableSchema({
      typeDefs: `
        type Query {
          post: Post
        }

        type RootMutation {
          upvotePost(id: String!): UpvotePostPayload
        }

        type UpvotePostPayload {
          post: Post
        }

        type Post {
          id: String
        }
        
        schema {
          query: Query
          mutation: RootMutation
        }
      `
    });

    const content = await plugin(
      testSchema,
      [],
      {
        mappers: {
          // whenever there's something receives or resolves a Post, use PostEntity
          Post: 'PostEntity'
        }
      },
      {
        outputFile: 'graphql.ts'
      }
    );

    // RootMutation             should expect {} as a parent
    // RootMutation.upvotePost  should expect {} as a parent
    // RootMutation.upvotePost  should return the UpvotePostPayload
    expect(content).toBeSimilarStringTo(`
      export namespace RootMutationResolvers {
        export interface Resolvers<Context = {}, TypeParent = {}> {
          upvotePost?: UpvotePostResolver<Maybe<UpvotePostPayload>, TypeParent, Context>;
        }
        
        export type UpvotePostResolver<R = Maybe<UpvotePostPayload>, Parent = {}, Context = {}> = Resolver<R, Parent, Context, UpvotePostArgs>;
        
        export interface UpvotePostArgs {
          id: string;
        }
      }
    `);

    // UpvotePostPayload        should expect UpvotePostPayload as parent
    // UpvotePostPayload.post   should expect UpvotePostPayload as parent
    // UpvotePostPayload.post   should return PostEntity
    expect(content).toBeSimilarStringTo(`
      export namespace UpvotePostPayloadResolvers {
        export interface Resolvers<Context = {}, TypeParent = UpvotePostPayload> {
          post?: PostResolver<Maybe<PostEntity>, TypeParent, Context>;
        }

        export type PostResolver<R = Maybe<PostEntity>, Parent = UpvotePostPayload, Context = {}> = Resolver<R, Parent, Context>;
      }
    `);
  });

  it('should provide a generic type of arguments in noNamespaces', async () => {
    const testSchema = makeExecutableSchema({
      typeDefs: `
        type Query {
          fieldTest(last: Int!, sort: String): String
        }
        
        schema {
          query: Query
        }
      `
    });

    const content = await plugin(
      testSchema,
      [],
      {
        noNamespaces: true
      },
      {
        outputFile: 'graphql.ts'
      }
    );

    expect(content).toBeSimilarStringTo(`
      export interface QueryResolvers<Context = {}, TypeParent = {}> {
        fieldTest?: QueryFieldTestResolver<Maybe<string>, TypeParent, Context>;
      }
    
      export type QueryFieldTestResolver<R = Maybe<string>, Parent = {}, Context = {}> = Resolver<R, Parent, Context, QueryFieldTestArgs>;
          
      export interface QueryFieldTestArgs {
        last: number;
        sort?: Maybe<string>;
      }
    `);
  });

  it('should define TypeResolveFn', async () => {
    const testSchema = makeExecutableSchema({
      typeDefs: `
        type Query {
          fieldTest(last: Int!, sort: String): String
        }
        
        schema {
          query: Query
        }
      `
    });
    const content = await plugin(
      testSchema,
      [],
      {},
      {
        outputFile: 'graphql.ts'
      }
    );

    expect(content).toBeSimilarStringTo(`
      export type TypeResolveFn<Types, Parent = {}, Context = {}> = (
        parent: Parent,
        context: Context,
        info: GraphQLResolveInfo
      ) => Maybe<Types>;
    `);
  });

  it('should create a type with __resolveType for a union', async () => {
    const testSchema = makeExecutableSchema({
      typeDefs: `
        type Post {
          title: String
          text: String
        }

        type Comment {
          text: String
        }

        union Entry = Post | Comment

        type Query {
          feed: Entry

        }
        
        schema {
          query: Query
        }
      `
    });

    const content = await plugin(
      testSchema,
      [],
      {},
      {
        outputFile: 'graphql.ts'
      }
    );

    expect(content).toBeSimilarStringTo(`
      export namespace EntryResolvers {
        export interface Resolvers {
          __resolveType: ResolveType;
        }
        
        export type ResolveType<R = 'Post' | 'Comment', Parent = Post | Comment, Context = {}> = TypeResolveFn<R, Parent, Context>;
      }
    `);
  });

  it('should create a type with __resolveType for a union (with noNamespaces)', async () => {
    const testSchema = makeExecutableSchema({
      typeDefs: `
        type Post {
          title: String
          text: String
        }

        type Comment {
          text: String
        }

        union Entry = Post | Comment

        type Query {
          feed: Entry

        }
        
        schema {
          query: Query
        }
      `
    });

    const content = await plugin(
      testSchema,
      [],
      {
        noNamespaces: true
      },
      {
        outputFile: 'graphql.ts'
      }
    );

    expect(content).toBeSimilarStringTo(`
      export interface EntryResolvers {
        __resolveType: EntryResolveType;
      }
      
      export type EntryResolveType<R = 'Post' | 'Comment', Parent = Post | Comment, Context = {}> = TypeResolveFn<R, Parent, Context>;
    `);
  });

  it('should create NextResolverFn and DirectiveResolverFn', async () => {
    const testSchema = makeExecutableSchema({
      typeDefs: `
        type Query {
          field: String
        }
        
        schema {
          query: Query
        }
      `
    });

    const content = await plugin(
      testSchema,
      [],
      {},
      {
        outputFile: 'graphql.ts'
      }
    );

    expect(content).toBeSimilarStringTo(`
      export type NextResolverFn<T> = () => Promise<T>;
      
      export type DirectiveResolverFn<TResult, TArgs = {}, TContext = {}> = (
        next: NextResolverFn<TResult>,
        source: any,
        args: TArgs,
        context: TContext,
        info: GraphQLResolveInfo,
      ) => TResult | Promise<TResult>;
    `);
  });

  it('should create a type that maches DirectiveResolverFn from graphql-tools', async () => {
    const testSchema = makeExecutableSchema({
      typeDefs: `
        type Post {
          title: String
          text: String
        }
        
        type Query {
          post: Post
        }
        
        schema {
          query: Query
        }
      `
    });

    const content = await plugin(
      testSchema,
      [],
      {},
      {
        outputFile: 'graphql.ts'
      }
    );

    expect(content).toBeSimilarStringTo(`
      export type NextResolverFn<T> = () => Promise<T>;
      
      export type DirectiveResolverFn<TResult, TArgs = {}, TContext = {}> = (
        next: NextResolverFn<TResult>,
        source: any,
        args: TArgs,
        context: TContext,
        info: GraphQLResolveInfo,
      ) => TResult | Promise<TResult>;
    `);
  });

  it('should create a resolver for a directive and its arguments', async () => {
    const testSchema = makeExecutableSchema({
      typeDefs: `
        directive @modify(limit: Int) on FIELD_DEFINITION

        type Post {
          title: String
          text: String
        }
        
        type Query {
          post: Post
        }
        
        schema {
          query: Query
        }
      `
    });

    const content = await plugin(
      testSchema,
      [],
      {},
      {
        outputFile: 'graphql.ts'
      }
    );

    expect(content).toBeSimilarStringTo(`
      export type ModifyDirectiveResolver<Result> = DirectiveResolverFn<Result, ModifyDirectiveArgs, {}>;
    `);

    expect(content).toBeSimilarStringTo(`
      export interface ModifyDirectiveArgs {
        limit?: Maybe<number>;
      }
    `);
  });

  it('should create a resolver for a scalar', async () => {
    const testSchema = makeExecutableSchema({
      typeDefs: `
        scalar JSON
        scalar Date

        type Query {
          post: JSON
          date: Date
        }
        
        schema {
          query: Query
        }
      `
    });

    const content = await plugin(
      testSchema,
      [],
      {
        scalars: {
          JSON: 'Object'
        }
      },
      {
        outputFile: 'graphql.ts'
      }
    );

    // should import GraphQLScalarType and GraphQLScalarTypeConfig
    expect(content).toBeSimilarStringTo(`
      import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
    `);

    // XXX: `any` becasue right now we can't tell in which form we ship it to the client
    expect(content).toBeSimilarStringTo(`
      export interface JSONScalarConfig extends GraphQLScalarTypeConfig<Json, any> {
        name: 'JSON'
      }
    `);
    expect(content).toBeSimilarStringTo(`
      export interface DateScalarConfig extends GraphQLScalarTypeConfig<Date, any> {
        name: 'Date'
      }
    `);
  });

  it('should import GraphQL types for scalars only if schema has scalars', async () => {
    const testSchema = makeExecutableSchema({
      typeDefs: `
        type Query {
          field: String
        }
        
        schema {
          query: Query
        }
      `
    });

    const content = await plugin(
      testSchema,
      [],
      {},
      {
        outputFile: 'graphql.ts'
      }
    );

    expect(content).not.toContain('GraphQLScalarType');
    expect(content).not.toContain('GraphQLScalarTypeConfig');
  });

  it('should generate Resolvers interface', async () => {
    const testSchema = makeExecutableSchema({
      typeDefs: `

        directive @modify(limit: Int) on FIELD_DEFINITION

        scalar Date

        type Query {
          post: Post
        }

        type Post {
          id: String
          author: User
        }

        type User {
          id: String
          name: String
        }
        
        schema {
          query: Query
        }
      `
    });

    const content = await plugin(
      testSchema,
      [],
      { noNamespaces: true, scalars: { Date: 'Date' } },
      {
        outputFile: 'graphql.ts'
      }
    );

    expect(content).toBeSimilarStringTo(`
      export interface IResolvers {
        Query?: QueryResolvers;
        Post?: PostResolvers;
        User?: UserResolvers;
        Date?: GraphQLScalarType;
      }
    `);

    expect(content).toBeSimilarStringTo(`
      export interface IDirectiveResolvers<Result> {
        modify?: ModifyDirectiveResolver<Result>;
        skip?: SkipDirectiveResolver<Result>;
        include?: IncludeDirectiveResolver<Result>;
        deprecated?: DeprecatedDirectiveResolver<Result>;
      }
    `);
  });

  it('should insert Field Resolvers prefix if configured', async () => {
    const testSchema = makeExecutableSchema({
      typeDefs: `
        type Query {
          user: User
          post: UserPost
        }

        type User {
          postId: String
          post: Post
        } 

        type UserPost {
          id: String
        }

        type Post {
          id: String
        }
        
        schema {
          query: Query
        }
      `
    });

    const content = await plugin(
      testSchema,
      [],
      { noNamespaces: true, fieldResolverNamePrefix: '_' },
      {
        outputFile: 'graphql.ts'
      }
    );

    expect(content).toBeSimilarStringTo(`
      export interface UserResolvers<Context = {}, TypeParent = User> {
        postId?: User_PostIdResolver<Maybe<string>, TypeParent, Context>;
        post?: User_PostResolver<Maybe<Post>, TypeParent, Context>;
      }

      export type User_PostIdResolver<R = Maybe<string>, Parent = User, Context = {}> = Resolver<R, Parent, Context>;
      export type User_PostResolver<R = Maybe<Post>, Parent = User, Context = {}> = Resolver<R, Parent, Context>;
    `);

    expect(content).toBeSimilarStringTo(`
      export interface UserPostResolvers<Context = {}, TypeParent = UserPost> {
        id?: UserPost_IdResolver<Maybe<string>, TypeParent, Context>;
      }

      export type UserPost_IdResolver<R = Maybe<string>, Parent = UserPost, Context = {}> = Resolver<R, Parent, Context>;
    `);
  });
});
