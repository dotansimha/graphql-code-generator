import 'graphql-codegen-core/dist/testing';
import { compileTemplate } from '../../../graphql-codegen-compiler/dist';
import config from '../dist';
import {
  GraphQLSchema,
  makeExecutableSchema,
  SchemaTemplateContext,
  schemaToTemplateContext,
  GeneratorConfig
} from 'graphql-codegen-core';
import { stripBlockComments } from '../../typescript/tests/utils';

describe('Resolvers', () => {
  const compileAndBuildContext = (typeDefs: string): { context: SchemaTemplateContext; schema: GraphQLSchema } => {
    const schema = makeExecutableSchema({ typeDefs, resolvers: {}, allowUndefinedInResolve: true }) as GraphQLSchema;

    return {
      schema,
      context: schemaToTemplateContext(schema)
    };
  };

  it('should contain the Resolver type', async () => {
    const { context } = compileAndBuildContext(`
        type Query {
          fieldTest: String 
        }
        
        schema {
          query: Query
        }
      `);

    const compiled = await compileTemplate(config, context);
    const content = compiled[0].content;

    expect(content).toBeSimilarStringTo(`
    import { GraphQLResolveInfo } from 'graphql';

    export type Resolver<Result, Parent = any, Context = any, Args = never> = (
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
      ): AsyncIterator<R | Result>;
      resolve?<R = Result, P = Parent>(
        parent: P,
        args: Args,
        context: Context,
        info: GraphQLResolveInfo
      ): R | Result | Promise<R | Result>;
    }
    
    export type SubscriptionResolver<Result, Parent = any, Context = any, Args = never> =
      | ((...args: any[]) => ISubscriptionResolverObject<Result, Parent, Context, Args>)
      | ISubscriptionResolverObject<Result, Parent, Context, Args>;
    `);
  });

  it('should make fields optional', async () => {
    const { context } = compileAndBuildContext(`
        type Query {
          fieldTest: String 
        }
        
        schema {
          query: Query
        }
      `);

    const compiled = await compileTemplate(config, context);

    const content = compiled[0].content;

    expect(content).toBeSimilarStringTo(`
        export namespace QueryResolvers {
          export interface Resolvers<Context = any, TypeParent = never> {
            fieldTest?: FieldTestResolver<string | null, TypeParent, Context>;
          }
        `);
  });

  it('should provide a generic type of result', async () => {
    const { context } = compileAndBuildContext(`
        type Query {
          fieldTest: String 
        }
        
        schema {
          query: Query
        }
      `);

    const compiled = await compileTemplate(config, context);

    const content = compiled[0].content;

    expect(content).toBeSimilarStringTo(`
        export namespace QueryResolvers {
          export interface Resolvers<Context = any, TypeParent = never> {
            fieldTest?: FieldTestResolver<string | null, TypeParent, Context>;
          }
          export type FieldTestResolver<R = string | null, Parent = never, Context = any> = Resolver<R, Parent, Context>;
        }
      `);
  });

  it('should provide a generic type of arguments and support optionals', async () => {
    const { context } = compileAndBuildContext(`
        type Query {
          fieldTest(last: Int!, sort: String): String
        }
        
        schema {
          query: Query
        }
      `);

    const compiled = await compileTemplate(config, context);

    const content = compiled[0].content;

    expect(content).toBeSimilarStringTo(`
        export namespace QueryResolvers {
          export interface Resolvers<Context = any, TypeParent = never> {
            fieldTest?: FieldTestResolver<string | null, TypeParent, Context>;
          }
    
          export type FieldTestResolver<R = string | null, Parent = never, Context = any> = Resolver<R, Parent, Context, FieldTestArgs>;
          
          export interface FieldTestArgs {
            last: number;
            sort?: string | null;
          }
        }
      `);
  });

  it('should handle subscription', async () => {
    const { context } = compileAndBuildContext(`
        type Subscription {
          fieldTest: String 
        }
        
        schema {
          subscription: Subscription
        }
      `);

    const compiled = await compileTemplate(
      {
        ...config
      },
      context
    );

    const content = stripBlockComments(compiled[0].content);

    expect(content).toBeSimilarStringTo(`
      export namespace SubscriptionResolvers {
        export interface Resolvers<Context = any, TypeParent = never> {
          fieldTest?: FieldTestResolver<string | null, TypeParent, Context>;
        }

        export type FieldTestResolver<R = string | null, Parent = never, Context = any> = SubscriptionResolver<R, Parent, Context>;
      }
      `);
  });

  it('should handle noNamespaces', async () => {
    const { context } = compileAndBuildContext(`
        type Query {
          fieldTest: String 
        }
        
        schema {
          query: Query
        }
      `);

    const compiled = await compileTemplate(
      {
        ...config,
        config: {
          noNamespaces: true
        }
      } as GeneratorConfig,
      context
    );

    const content = compiled[0].content;

    expect(content).toBeSimilarStringTo(`
        export interface QueryResolvers<Context = any, TypeParent = never> {
          fieldTest?: QueryFieldTestResolver<string | null, TypeParent, Context>;
        }

        export type QueryFieldTestResolver<R = string | null, Parent = never, Context = any> = Resolver<R, Parent, Context>;
      `);
  });

  it('should override custom context', async () => {
    const { context } = compileAndBuildContext(`
        type Query {
          fieldTest: String 
        }
        
        schema {
          query: Query
        }
      `);

    const compiled = await compileTemplate(
      {
        ...config,
        config: {
          prepend: [`import { MyContext } from './context';`],
          contextType: 'MyContext'
        }
      } as GeneratorConfig,
      context
    );

    const content = compiled[0].content;

    expect(content).toBeSimilarStringTo(`
        export interface Resolvers<Context = MyContext, TypeParent = never> {
          fieldTest?: FieldTestResolver<string | null, TypeParent, Context>;
        }

        export type FieldTestResolver<R = string | null, Parent = never, Context = MyContext> = Resolver<R, Parent, Context>;
      `);

    expect(content).toContain(`import { MyContext } from './context';`);
  });

  it('should handle snake case and convert it to pascal case', async () => {
    const { context } = compileAndBuildContext(`
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
    `);

    const compiled = await compileTemplate(config, context);

    const content = compiled[0].content;

    expect(content).toBeSimilarStringTo(`
      export type SnakeCaseRootQueryResolver<R = SnakeCaseResult | null, Parent = never, Context = any> = Resolver<R, Parent, Context, SnakeCaseRootQueryArgs>;
      `);
    expect(content).toBeSimilarStringTo(`
      export interface SnakeCaseRootQueryArgs {
        arg?: SnakeCaseArg | null;
      }
    `);
  });

  it('Should handle primitives option', async () => {
    const { context } = compileAndBuildContext(`
      type TestType {
        id: ID!
      }  
    `);

    const compiled = await compileTemplate(
      {
        ...config,
        primitives: {
          ...config.primitives,
          ID: 'number'
        }
      },
      context
    );

    const content = compiled[0].content;

    expect(content).toBeSimilarStringTo(`
      export interface TestType {
        id: number;
      }
      `);
  });

  it('should define default parent type', async () => {
    const { context } = compileAndBuildContext(`
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
      `);

    const compiled = await compileTemplate(config, context);

    const content = compiled[0].content;

    expect(content).toBeSimilarStringTo(`
      export namespace QueryResolvers {
        export interface Resolvers<Context = any, TypeParent = never> {
          post?: PostResolver<Post | null, TypeParent, Context>;
        }
  
        export type PostResolver<R = Post | null, Parent = never, Context = any> = Resolver<R, Parent, Context>;
      }
    `);

    expect(content).toBeSimilarStringTo(`
      export namespace PostResolvers {
        export interface Resolvers<Context = any, TypeParent = Post> {
          id?: IdResolver<string | null, TypeParent, Context>;
          author?: AuthorResolver<User | null, TypeParent, Context>;
        }

        export type IdResolver<R = string | null, Parent = Post, Context = any> = Resolver<R, Parent, Context>;
        export type AuthorResolver<R = User | null, Parent = Post, Context = any> = Resolver<R, Parent, Context>;
      }
    `);

    expect(content).toBeSimilarStringTo(`
      export namespace UserResolvers {
        export interface Resolvers<Context = any, TypeParent = User> {
          id?: IdResolver<string | null, TypeParent, Context>;
          name?: NameResolver<string | null, TypeParent, Context>;
        }

        export type IdResolver<R = string | null, Parent = User, Context = any> = Resolver<R, Parent, Context>;
        export type NameResolver<R = string | null, Parent = User, Context = any> = Resolver<R, Parent, Context>;
      }
    `);
  });

  it('should define default parent type with noNamespaces', async () => {
    const { context } = compileAndBuildContext(`
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
      `);

    const compiled = await compileTemplate(
      {
        ...config,
        config: {
          noNamespaces: true
        }
      } as GeneratorConfig,
      context
    );

    const content = compiled[0].content;

    expect(content).toBeSimilarStringTo(`
      export interface QueryResolvers<Context = any, TypeParent = never> {
        post?: QueryPostResolver<Post | null, TypeParent, Context>;
      }

      export type QueryPostResolver<R = Post | null, Parent = never, Context = any> = Resolver<R, Parent, Context>;
    `);

    expect(content).toBeSimilarStringTo(`
      export interface PostResolvers<Context = any, TypeParent = Post> {
        id?: PostIdResolver<string | null, TypeParent, Context>;
        author?: PostAuthorResolver<User | null, TypeParent, Context>;
      }

      export type PostIdResolver<R = string | null, Parent = Post, Context = any> = Resolver<R, Parent, Context>;
      export type PostAuthorResolver<R = User | null, Parent = Post, Context = any> = Resolver<R, Parent, Context>;
    `);

    expect(content).toBeSimilarStringTo(`
      export interface UserResolvers<Context = any, TypeParent = User> {
        id?: UserIdResolver<string | null, TypeParent, Context>;
        name?: UserNameResolver<string | null, TypeParent, Context>;
      }

      export type UserIdResolver<R = string | null, Parent = User, Context = any> = Resolver<R, Parent, Context>;
      export type UserNameResolver<R = string | null, Parent = User, Context = any> = Resolver<R, Parent, Context>;
    `);
  });

  it('should accept a map of parent types', async () => {
    const { context } = compileAndBuildContext(`
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
      `);

    // type UserParent = string;
    // interface PostParent {
    //   id: string;
    //   author: string;
    // }
    const compiled = await compileTemplate(
      {
        ...config,
        config: {
          mappers: {
            // it means that User type expects UserParent to be a parent
            User: './interfaces#UserParent',
            // it means that Post type expects UserParent to be a parent
            Post: './interfaces#PostParent'
          }
        }
      } as any,
      context
    );

    const content = compiled[0].content;

    // import parents
    // merge duplicates into single module
    expect(content).toBeSimilarStringTo(`
      import { UserParent, PostParent } from './interfaces';
    `);

    // should check field's result and match it with provided parents
    expect(content).toBeSimilarStringTo(`
      export namespace QueryResolvers {
        export interface Resolvers<Context = any, TypeParent = never> {
          post?: PostResolver<PostParent | null, TypeParent, Context>;
        }

        export type PostResolver<R = PostParent | null, Parent = never, Context = any> = Resolver<R, Parent, Context>;
      }
    `);

    // should check if type has a defined parent and use it as TypeParent
    expect(content).toBeSimilarStringTo(`
      export namespace PostResolvers {
        export interface Resolvers<Context = any, TypeParent = PostParent> {
          id?: IdResolver<string | null, TypeParent, Context>;
          author?: AuthorResolver<UserParent | null, TypeParent, Context>;
        }

        export type IdResolver<R = string | null, Parent = PostParent, Context = any> = Resolver<R, Parent, Context>;
        export type AuthorResolver<R = UserParent | null, Parent = PostParent, Context = any> = Resolver<R, Parent, Context>;
      }
    `);

    // should check if type has a defined parent and use it as TypeParent
    // should match field's result with provided parent type
    expect(content).toBeSimilarStringTo(`
      export namespace UserResolvers {
        export interface Resolvers<Context = any, TypeParent = UserParent> {
          id?: IdResolver<string | null, TypeParent, Context>;
          name?: NameResolver<string | null, TypeParent, Context>;
          post?: PostResolver<PostParent | null, TypeParent, Context>;
        }

        export type IdResolver<R = string | null, Parent = UserParent, Context = any> = Resolver<R, Parent, Context>;
        export type NameResolver<R = string | null, Parent = UserParent, Context = any> = Resolver<R, Parent, Context>;
        export type PostResolver<R = PostParent | null, Parent = UserParent, Context = any> = Resolver<R, Parent, Context>;
      }
    `);
  });

  it('should accept mappers that reuse generated types', async () => {
    const { context } = compileAndBuildContext(`
        type Query {
          post: Post
        }

        type Post {
          id: String
        }
        
        schema {
          query: Query
        }
      `);

    const compiled = await compileTemplate(
      {
        ...config,
        config: {
          mappers: {
            // it means that Post type expects Post to be a parent
            Post: 'Post'
          }
        }
      } as any,
      context
    );

    const content = compiled[0].content;

    // should check field's result and match it with provided parents
    expect(content).toBeSimilarStringTo(`
      export namespace QueryResolvers {
        export interface Resolvers<Context = any, TypeParent = never> {
          post?: PostResolver<Post | null, TypeParent, Context>;
        }

        export type PostResolver<R = Post | null, Parent = never, Context = any> = Resolver<R, Parent, Context>;
      }
    `);

    // should check if type has a defined parent and use it as TypeParent
    expect(content).toBeSimilarStringTo(`
      export namespace PostResolvers {
        export interface Resolvers<Context = any, TypeParent = Post> {
          id?: IdResolver<string | null, TypeParent, Context>;
        }

        export type IdResolver<R = string | null, Parent = Post, Context = any> = Resolver<R, Parent, Context>;
      }
    `);
  });
});
