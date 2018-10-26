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
import { stripBlockComments } from './utils';

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
      | ISubscriptionResolverObject<Result, Parent, Context, 
>;
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
          export interface Resolvers<Context = any> {
            fieldTest?: FieldTestResolver<string | null, any, Context>;
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
          export interface Resolvers<Context = any> {
            fieldTest?: FieldTestResolver<string | null, any, Context>;
          }
        export type FieldTestResolver<R = string | null, Parent = any, Context = any> = Resolver<R, Parent, Context>;
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
          export interface Resolvers<Context = any> {
            fieldTest?: FieldTestResolver<string | null, any, Context>;
          }
    
          export type FieldTestResolver<R = string | null, Parent = any, Context = any> = Resolver<R, Parent, Context, FieldTestArgs>;
          
          export interface FieldTestArgs {
            last: number;
            sort?: string | null;
          }
        }
      `);
  });

  it('should handle resolvers flag, true by default', async () => {
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
          resolvers: false
        }
      },
      context
    );

    const content = compiled[0].content;

    expect(content).not.toBeSimilarStringTo(`
        import { GraphQLResolveInfo } from 'graphql';
      `);

    expect(content).not.toBeSimilarStringTo(`
        export type Resolver<Result, Parent = any, Context = any, Args = never> = (
          parent: Parent,
          args: Args,
          context: Context,
          info: GraphQLResolveInfo
        ) => Promise<Result> | Result;
      `);

    expect(content).not.toBeSimilarStringTo(`
        export namespace QueryResolvers {
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
        export interface Resolvers<Context = any> {
          fieldTest?: FieldTestResolver<string | null, any, Context>;
        }

        export type FieldTestResolver<R = string | null, Parent = any, Context = any> = SubscriptionResolver<R, Parent, Context>;
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
        export interface QueryResolvers<Context = any> {
          fieldTest?: QueryFieldTestResolver<string | null, any, Context>;
        }

        export type QueryFieldTestResolver<R = string | null, Parent = any, Context = any> = Resolver<R, Parent, Context>;
      `);
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
      export type SnakeCaseRootQueryResolver<R = SnakeCaseResult | null, Parent = any, Context = any> = Resolver<R, Parent, Context, SnakeCaseRootQueryArgs>;
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
});
