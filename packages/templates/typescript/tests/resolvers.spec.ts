import { compileTemplate } from '../../../graphql-codegen-compiler/dist';
import config from '../dist';
import './custom-matchers';
import {
  GraphQLSchema,
  makeExecutableSchema,
  SchemaTemplateContext,
  schemaToTemplateContext,
  GeneratorConfig
} from 'graphql-codegen-core';

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

        type Resolver<Parent, Result, Args = any> = (
          parent?: Parent,
          args?: Args,
          context?: any,
          info?: GraphQLResolveInfo
        ) => Promise<Result> | Result;
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
          export interface Resolvers {
            fieldTest?: FieldTestResolver;
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
          export interface Resolvers {
            fieldTest?: FieldTestResolver;
          }
    
          export type FieldTestResolver = Resolver<Query, string | null>;
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
          export interface Resolvers {
            fieldTest?: FieldTestResolver;
          }
    
          export type FieldTestResolver = Resolver<Query, string | null, FieldTestArgs>;
          
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
        type Resolver<Parent, Result, Args = any> = (
          parent?: Parent,
          args?: Args,
          context?: any,
          info?: GraphQLResolveInfo
        ) => Promise<Result> | Result;
      `);

    expect(content).not.toBeSimilarStringTo(`
        export namespace QueryResolvers {
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
        export interface QueryResolvers {
          fieldTest?: QueryFieldTestResolver;
        }

        export type QueryFieldTestResolver = Resolver<Query, string | null>;
      `);
  });
});
