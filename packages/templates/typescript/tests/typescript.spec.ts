import './custom-matchers';
import {
  GeneratorConfig,
  gql,
  GraphQLSchema,
  introspectionToGraphQLSchema,
  makeExecutableSchema,
  SchemaTemplateContext,
  schemaToTemplateContext,
  transformDocument
} from 'graphql-codegen-core';
import { compileTemplate } from 'graphql-codegen-compiler';
import config from '../dist';
import * as fs from 'fs';

describe('TypeScript template', () => {
  const compileAndBuildContext = (typeDefs: string): { context: SchemaTemplateContext; schema: GraphQLSchema } => {
    const schema = makeExecutableSchema({ typeDefs, resolvers: {}, allowUndefinedInResolve: true }) as GraphQLSchema;

    return {
      schema,
      context: schemaToTemplateContext(schema)
    };
  };

  describe('Schema Only', () => {
    it('should support custom handlebar ifDirective when directive added', () => {
      const { context } = compileAndBuildContext(`
        type Query @app {
          fieldTest: String
        }
        
        schema {
          query: Query
        }
        
        directive @app on OBJECT
      `);

      const compiled = compileTemplate(
        {
          ...config,
          templates: {
            index: '{{#each types}}{{#ifDirective this "app"}}directive{{/ifDirective}}{{/each}}'
          }
        } as GeneratorConfig,
        context
      );

      expect(compiled[0].content).toBe('directive');
    });

    it('should pass custom config to template', () => {
      const { context } = compileAndBuildContext(`
        type Query {
          fieldTest: String
        }
        
        schema {
          query: Query
        }
      `);

      const compiled = compileTemplate(
        {
          ...config,
          templates: {
            index: '{{ config.custom }}'
          },
          config: {
            custom: 'A'
          }
        } as GeneratorConfig,
        context
      );

      expect(compiled[0].content).toBe('A');
    });

    it('should support custom handlebar ifDirective when no directive added', () => {
      const { context } = compileAndBuildContext(`
        type Query {
          fieldTest: String
        }
        
        schema {
          query: Query
        }
        
        directive @app on OBJECT
      `);

      const compiled = compileTemplate(
        {
          ...config,
          templates: {
            index: '{{#each types}}{{#ifDirective this "app"}}directive{{/ifDirective}}{{/each}}'
          }
        } as GeneratorConfig,
        context
      );

      expect(compiled[0].content).toBe('');
    });

    it('should support custom handlebar ifDirective when directive added and args', () => {
      const { context } = compileAndBuildContext(`
        type Query {
          fieldTest: String
        }
        
        schema @app(test: "123") {
          query: Query
        }
        
        directive @app(test: String) on OBJECT
      `);

      const compiled = compileTemplate(
        {
          ...config,
          templates: {
            index: '{{#ifDirective this "app"}}directive{{test}}{{/ifDirective}}'
          }
        } as GeneratorConfig,
        context
      );

      expect(compiled[0].content).toBe('directive123');
    });

    it('should compile template correctly when using a simple Query', () => {
      const { context } = compileAndBuildContext(`
        type Query {
          fieldTest: String
        }
      `);
      const compiled = compileTemplate(config, context);
      const content = compiled[0].content;
      expect(content).toBeSimilarStringTo(`
      /* tslint:disable */
      
      export interface Query {
        fieldTest?: string | null;
      }`);
    });

    it('should compile template correctly when using a simple Query with some fields and types', () => {
      const { context } = compileAndBuildContext(`
        type Query {
          fieldTest: String
        }
        
        type T {
          f1: String
          f2: Int
        }
      `);
      const compiled = compileTemplate(config, context);
      const content = compiled[0].content;
      expect(content).toBeSimilarStringTo(`
      /* tslint:disable */
      
      export interface Query {
        fieldTest?: string | null;
      }
      
      export interface T {
        f1?: string | null;
        f2?: number | null;
      }`);
    });

    it('should compile template correctly when using a simple Query with arrays and required', () => {
      const { context } = compileAndBuildContext(`
        type Query {
          fieldTest: String
        }
        
        type T {
          f1: [String]
          f2: Int!
          f3: A
        }
        
        type A {
          f4: String
        }
      `);
      const compiled = compileTemplate(config, context);
      const content = compiled[0].content;
      expect(content).toBeSimilarStringTo(`
      /* tslint:disable */
      
      export interface Query {
        fieldTest?: string | null;
      }
      
      export interface T {
        f1?: string[] | null;
        f2: number;
        f3?: A | null;
      }
        
      export interface A {
        f4?: string | null;
      }`);
    });

    it('should generate correctly when using simple type that extends interface', () => {
      const { context } = compileAndBuildContext(`
        type Query {
          fieldTest: A!
        }
        
        interface Base {
          f1: String
        }
        
        type A implements Base {
          f1: String
          f2: String
        }
      `);

      const compiled = compileTemplate(config, context);
      const content = compiled[0].content;
      expect(content).toBeSimilarStringTo(`
        /* tslint:disable */
        
        export interface Base {
          f1?: string | null;
        }
      
        export interface Query {
          fieldTest: A;
        }
      
        export interface A extends Base {
          f1?: string | null;
          f2?: string | null;
        }`);
    });

    it('should generate correctly when using custom scalar', () => {
      const { context } = compileAndBuildContext(`
        type Query {
          fieldTest: [Date]
        }
        
        scalar Date
      `);

      const compiled = compileTemplate(config, context);
      const content = compiled[0].content;
      expect(content).toBeSimilarStringTo(`
      /* tslint:disable */

      export type Date = any;
      
      export interface Query {
        fieldTest?: Date[] | null;
      }`);
    });

    it('should generate enums correctly', () => {
      const { context } = compileAndBuildContext(`
        type Query {
          fieldTest: MyEnum!
        }
        
        enum MyEnum {
          A
          B
          C
        }
      `);

      const compiled = compileTemplate(config, context);
      const content = compiled[0].content;
      expect(content).toBeSimilarStringTo(`
      /* tslint:disable */
      
      export interface Query {
        fieldTest: MyEnum;
      }
      export enum MyEnum {
        A = "A",
        B = "B",
        C = "C",
      }
      `);
    });

    it('should generate unions correctly', () => {
      const { context } = compileAndBuildContext(`
        type Query {
          fieldTest: C!
        }
        
        type A {
          f1: String
        }
        
        type B {
          f2: String
        }
        
        # Union description
        union C = A | B
      `);

      const compiled = compileTemplate(config, context);
      const content = compiled[0].content;
      expect(content).toBeSimilarStringTo(`
        /* tslint:disable */
        
        export interface Query {
          fieldTest: C;
        }
        
        export interface A {
          f1?: string | null;
        }
        
        export interface B {
          f2?: string | null;
        }
        
        /* Union description */
        export type C = A | B;
      `);
    });

    it('should generate type arguments types correctly when using simple Scalar', () => {
      const { context } = compileAndBuildContext(`
        type Query {
          fieldTest(arg1: String): String!
        }
      `);

      const compiled = compileTemplate(config, context);
      const content = compiled[0].content;
      expect(content).toBeSimilarStringTo(`
        /* tslint:disable */
        
        export interface Query {
          fieldTest: string;
        }
        
        export interface FieldTestQueryArgs {
          arg1?: string | null;
        }`);
    });

    it('should generate type arguments types correctly when using custom input', () => {
      const { context } = compileAndBuildContext(`
        type Query {
          fieldTest(myArgument: T!): Return
        }
        
        type Return {
          ok: Boolean!
          msg: String!
        }
        
        input T {
          f1: String
          f2: Int!
          f3: [String]
          f4: [Float]
        }
      `);

      const compiled = compileTemplate(config, context);
      const content = compiled[0].content;
      expect(content).toBeSimilarStringTo(`
       /* tslint:disable */
        
       export interface Query {
          fieldTest?: Return | null; 
        }
        
        export interface Return {
          ok: boolean; 
          msg: string; 
        }
        
        export interface T {
          f1?: string | null; 
          f2: number; 
          f3?: string[] | null; 
          f4?: number[] | null; 
        }
        
        export interface FieldTestQueryArgs {
          myArgument: T;
        }
    `);
    });

    it('should generate from a whole schema object correctly', () => {
      const schema = introspectionToGraphQLSchema(JSON.parse(fs.readFileSync('./tests/files/schema.json').toString()));
      const context = schemaToTemplateContext(schema);
      const compiled = compileTemplate(config, context);
      const content = compiled[0].content;

      expect(content).toContain('export interface Query');
      expect(content).toContain('export interface Mutation');
      expect(content).toContain('export interface Subscription');

      expect(content).toContain('export enum FeedType');
      expect(content).toContain('export enum VoteType');

      expect(content).toContain('export interface Entry');
      expect(content).toContain('export interface User');
      expect(content).toContain('export interface Repository');
      expect(content).toContain('export interface Comment');
      expect(content).toContain('export interface Vote');

      expect(content).toContain('export interface FeedQueryArgs');
      expect(content).toContain('export interface EntryQueryArgs');
      expect(content).toContain('export interface CommentsEntryArgs');
      expect(content).toContain('export interface SubmitRepositoryMutationArgs');
      expect(content).toContain('export interface VoteMutationArgs');
      expect(content).toContain('export interface SubmitCommentMutationArgs');
      expect(content).toContain('export interface CommentAddedSubscriptionArgs');
    });
  });

  describe('Operations', () => {
    it('Should compile simple Query correctly', () => {
      const schema = introspectionToGraphQLSchema(JSON.parse(fs.readFileSync('./tests/files/schema.json').toString()));
      const context = schemaToTemplateContext(schema);

      const documents = gql`
        query myFeed {
          feed {
            id
            commentCount
            repository {
              full_name
              html_url
              owner {
                avatar_url
              }
            }
          }
        }
      `;

      const transformedDocument = transformDocument(schema, documents);
      const compiled = compileTemplate(config, context, [transformedDocument], { generateSchema: false });

      expect(compiled[0].content).toBeSimilarStringTo(`
          /* tslint:disable */
          /* A list of options for the sort order of the feed */
          export enum FeedType {
            HOT = "HOT",
            NEW = "NEW",
            TOP = "TOP",
          }
          
          /* The type of vote to record, when submitting a vote */
          export enum VoteType {
            UP = "UP",
            DOWN = "DOWN",
            CANCEL = "CANCEL",
          }
          
          export namespace MyFeed {
            export type Variables = {
            }
          
            export type Query = {
              __typename?: "Query";
              feed?: Feed[] | null; 
            }
          
            export type Feed = {
              __typename?: "Entry";
              id: number; 
              commentCount: number; 
              repository: Repository; 
            }
          
            export type Repository = {
              __typename?: "Repository";
              full_name: string; 
              html_url: string; 
              owner?: Owner | null; 
            }
          
            export type Owner = {
              __typename?: "User";
              avatar_url: string; 
            }
          }`);
    });

    it('Should compile simple Query with Fragment spread correctly', () => {
      const schema = introspectionToGraphQLSchema(JSON.parse(fs.readFileSync('./tests/files/schema.json').toString()));
      const context = schemaToTemplateContext(schema);

      const documents = gql`
        query myFeed {
          feed {
            id
            commentCount
            repository {
              full_name
              ...RepoFields
            }
          }
        }

        fragment RepoFields on Repository {
          html_url
          owner {
            avatar_url
          }
        }
      `;

      const transformedDocument = transformDocument(schema, documents);
      const compiled = compileTemplate(config, context, [transformedDocument], { generateSchema: false });
      const content = compiled[0].content;

      expect(content).toBeSimilarStringTo(`
          /* tslint:disable */
          /* A list of options for the sort order of the feed */
          export enum FeedType {
            HOT = "HOT",
            NEW = "NEW",
            TOP = "TOP",
          }
          
          /* The type of vote to record, when submitting a vote */
          export enum VoteType {
            UP = "UP",
            DOWN = "DOWN",
            CANCEL = "CANCEL",
          }
          
          export namespace MyFeed {
            export type Variables = {
            }
          
            export type Query = {
              __typename?: "Query";
              feed?: Feed[] | null; 
            }
          
            export type Feed = {
              __typename?: "Entry";
              id: number; 
              commentCount: number; 
              repository: Repository; 
            }
          
            export type Repository = {
              __typename?: "Repository";
              full_name: string; 
            } & RepoFields.Fragment
          }
          
          export namespace RepoFields {
            export type Fragment = {
              __typename?: "Repository";
              html_url: string; 
              owner?: Owner | null; 
            }
          
            export type Owner = {
              __typename?: "User";
              avatar_url: string; 
            }
          }`);
    });

    it('Should compile simple Query with inline Fragment', () => {
      const schema = introspectionToGraphQLSchema(JSON.parse(fs.readFileSync('./tests/files/schema.json').toString()));
      const context = schemaToTemplateContext(schema);

      const documents = gql`
        query myFeed {
          feed {
            id
            commentCount
            repository {
              html_url
              ... on Repository {
                full_name
              }
              ... on Repository {
                owner {
                  avatar_url
                }
              }
            }
          }
        }
      `;

      const transformedDocument = transformDocument(schema, documents);
      const compiled = compileTemplate(config, context, [transformedDocument], { generateSchema: false });
      const content = compiled[0].content;

      expect(content).toBeSimilarStringTo(`
       /* tslint:disable */
    /* A list of options for the sort order of the feed */
    export enum FeedType {
      HOT = "HOT",
      NEW = "NEW",
      TOP = "TOP",
    }
    
    /* The type of vote to record, when submitting a vote */
    export enum VoteType {
      UP = "UP",
      DOWN = "DOWN",
      CANCEL = "CANCEL",
    }
    
    export namespace MyFeed {
      export type Variables = {
      }
    
      export type Query = {
        __typename?: "Query";
        feed?: Feed[] | null; 
      }
    
      export type Feed = {
        __typename?: "Entry";
        id: number; 
        commentCount: number; 
        repository: Repository; 
      }
    
      export type Repository = {
        __typename?: RepositoryInlineFragment["__typename"] | _RepositoryInlineFragment["__typename"];
        html_url: string; 
      } & (RepositoryInlineFragment | _RepositoryInlineFragment)
    
      export type RepositoryInlineFragment = {
        __typename?: "Repository";
        full_name: string; 
      }
    
      export type _RepositoryInlineFragment = {
        __typename?: "Repository";
        owner?: Owner | null; 
      }
    
      export type Owner = {
        __typename?: "User";
        avatar_url: string; 
      }
    }`);
    });
  });
});
