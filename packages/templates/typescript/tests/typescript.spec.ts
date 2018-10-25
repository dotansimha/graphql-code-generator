import 'graphql-codegen-core/dist/testing';
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
import { stripBlockComments } from './utils';
import * as fs from 'fs';

describe('TypeScript template', () => {
  const compileAndBuildContext = (typeDefs: string): { context: SchemaTemplateContext; schema: GraphQLSchema } => {
    const schema = makeExecutableSchema({ typeDefs, resolvers: {}, allowUndefinedInResolve: true }) as GraphQLSchema;

    return {
      schema,
      context: schemaToTemplateContext(schema)
    };
  };

  it('should handle prepend option correctly', async () => {
    const { context } = compileAndBuildContext(`
      type Query {
        test: String
      }

      schema {
        query: Query
      }
    `);

    const compiled = await compileTemplate(
      {
        ...config,
        config: {
          prepend: ['// Test [="]']
        }
      } as GeneratorConfig,
      context
    );

    const content = compiled[0].content;

    expect(content).toBeSimilarStringTo(`
    // Test [="]
    `);
  });

  it('should handle interfacePrefix option correctly', async () => {
    const { context } = compileAndBuildContext(`
      type Foo {
        bar: Bar
      }
      type Bar {
        qux: String
      }
    `);
    const compiled = await compileTemplate(
      {
        ...config,
        config: {
          interfacePrefix: 'I'
        }
      } as GeneratorConfig,
      context
    );

    const content = compiled[0].content;

    expect(content).toBeSimilarStringTo(`
      interface IFoo {
        bar?: IBar | null;
      }
    `);
  });

  describe('Schema Only', () => {
    it('should handle wrapping namespace correctly', async () => {
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
            schemaNamespace: 'Models'
          }
        } as GeneratorConfig,
        context
      );

      const content = stripBlockComments(compiled[0].content);

      expect(content).toBeSimilarStringTo(`
      /* tslint:disable */
      `);

      expect(content).toBeSimilarStringTo(`
        export namespace Models {
          export interface Query {
            fieldTest?: string | null;
          }
        }
      `);
    });

    it('should handle immutable type correctly', async () => {
      const { context } = compileAndBuildContext(`
        type Query {
          fieldTest: String 
          arrayTest1: [String]
          arrayTest2: [String]!
          arrayTest3: [String!]!
          arrayTest4: [String!]
        }
        
        schema {
          query: Query
        }
      `);

      const compiled = await compileTemplate(
        {
          ...config,
          config: {
            immutableTypes: true
          }
        } as GeneratorConfig,
        context
      );

      const content = compiled[0].content;

      expect(content).toBeSimilarStringTo(`
      /* tslint:disable */
      `);

      expect(content).toBeSimilarStringTo(`
        export interface Query {
          readonly fieldTest?: string | null;
          readonly arrayTest1?: ReadonlyArray<string | null> | null; 
          readonly arrayTest2: ReadonlyArray<string | null>; 
          readonly arrayTest3: ReadonlyArray<string>; 
          readonly arrayTest4?: ReadonlyArray<string> | null; 
        }
      `);
    });

    it('should handle optional correctly', async () => {
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
            avoidOptionals: true
          }
        } as GeneratorConfig,
        context
      );

      const content = compiled[0].content;

      expect(content).toBeSimilarStringTo(`
      /* tslint:disable */
      `);

      expect(content).toBeSimilarStringTo(`
      export interface Query {
        fieldTest: string | null;
      }`);
    });

    it('should handle enum as type correctly', async () => {
      const { context } = compileAndBuildContext(`
        type Query {
          fieldTest: String 
        }
        
        enum A {
          ONE,
          TWO,
        }
        
        schema {
          query: Query
        }
      `);

      const compiled = await compileTemplate(
        {
          ...config,
          config: {
            enumsAsTypes: true
          }
        } as GeneratorConfig,
        context
      );

      const content = compiled[0].content;

      expect(content).toBeSimilarStringTo(`
       /* tslint:disable */
      `);
      expect(content).toBeSimilarStringTo(`
        export interface Query {
          fieldTest?: string | null; 
        }
      `);
      expect(content).toBeSimilarStringTo(`
        export type A = "ONE" | "TWO";
      `);
    });

    it('should handle enum internal values with enumsAsTypes true', async () => {
      const { context } = compileAndBuildContext(`
        enum A {
          ONE,
          TWO,
        }
        
        enum B {
          LUKE,
          YODA
        }
        
        enum C {
          FOO,
          BAR
        }
      `);

      const compiled = await compileTemplate(
        {
          ...config,
          config: {
            enums: {
              A: {
                ONE: 1,
                TWO: 2
              },
              B: {
                LUKE: '"luke"',
                YODA: '"yoda"'
              }
            },
            enumsAsTypes: true
          }
        } as GeneratorConfig,
        context
      );

      const content = compiled[0].content;

      expect(content).toBeSimilarStringTo(`
       /* tslint:disable */
      `);

      expect(content).toBeSimilarStringTo(`
        export type A = 1 | 2;
      `);
      expect(content).toBeSimilarStringTo(`
        export type B = "luke" | "yoda";
      `);
      expect(content).toBeSimilarStringTo(`
        export type C = "FOO" | "BAR";
      `);
    });

    it('should handle enum internal values', async () => {
      const { context } = compileAndBuildContext(`
        enum A {
          ONE,
          TWO,
        }
        
        enum B {
          LUKE,
          YODA
        }
        
        enum C {
          FOO,
          BAR
        }
      `);

      const compiled = await compileTemplate(
        {
          ...config,
          config: {
            enums: {
              A: {
                ONE: 1,
                TWO: 2
              },
              B: {
                LUKE: '"luke"',
                YODA: '"yoda"'
              }
            }
          }
        } as GeneratorConfig,
        context
      );

      const content = compiled[0].content;

      expect(content).toBeSimilarStringTo(`
       /* tslint:disable */
      `);

      expect(content).toBeSimilarStringTo(`
        export enum A {
          ONE = 1,
          TWO = 2,
        }
      `);
      expect(content).toBeSimilarStringTo(`
        export enum B {
          LUKE = "luke",
          YODA = "yoda",
        }
      `);
      expect(content).toBeSimilarStringTo(`
        export enum C {
          FOO = "FOO",
          BAR = "BAR",
        }
      `);
    });

    it('should output docstring correctly', async () => {
      const { context } = compileAndBuildContext(`
        # type-description
        type Query {
          # field-description
          fieldTest: String 
        }
        
        schema {
          query: Query
        }
      `);

      const compiled = await compileTemplate(config, context);
      const content = compiled[0].content;

      expect(compiled[0].content).toBeSimilarStringTo(`/* tslint:disable */`);
      expect(content).toBeSimilarStringTo(`/** type-description */`);
      expect(content).toBeSimilarStringTo(`
        export interface Query {
          fieldTest?: string | null; /** field-description */
        }
      `);
    });

    it('should support custom handlebar ifDirective when directive added', async () => {
      const { context } = compileAndBuildContext(`
        type Query @app {
          fieldTest: String
        }
        
        schema {
          query: Query
        }
        
        directive @app on OBJECT
      `);

      const compiled = await compileTemplate(
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

    it('should pass custom config to template', async () => {
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

    it('should support custom handlebar ifDirective when no directive added', async () => {
      const { context } = compileAndBuildContext(`
        type Query {
          fieldTest: String
        }
        
        schema {
          query: Query
        }
        
        directive @app on OBJECT
      `);

      const compiled = await compileTemplate(
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

    it('should compile template correctly when using a simple Query', async () => {
      const { context } = compileAndBuildContext(`
        type Query {
          fieldTest: String
        }
      `);
      const compiled = await compileTemplate(config, context);
      const content = compiled[0].content;

      expect(content).toBeSimilarStringTo(`
        /* tslint:disable */
      `);
      expect(content).toBeSimilarStringTo(`
        export interface Query {
          fieldTest?: string | null;
        }
      `);
    });

    it('should compile template correctly when using a simple Query with some fields and types', async () => {
      const { context } = compileAndBuildContext(`
        type Query {
          fieldTest: String
        }
        
        type T {
          f1: String
          f2: Int
        }
      `);
      const compiled = await compileTemplate(config, context);
      const content = compiled[0].content;

      expect(content).toBeSimilarStringTo(`
      /* tslint:disable */
      `);
      expect(content).toBeSimilarStringTo(`
        export interface Query {
          fieldTest?: string | null;
        }
      `);
      expect(content).toBeSimilarStringTo(`
        export interface T {
          f1?: string | null;
          f2?: number | null;
        }
      `);
    });

    it('should compile template correctly when using a simple Query with arrays and required', async () => {
      const { context } = compileAndBuildContext(`
        type Query {
          fieldTest: T
        }
        
        type T {
          f1: [String]
          f2: Int!
          f3: A
          f4: [[[String]]]
        }
        
        type A {
          f4: T
        }
      `);
      const compiled = await compileTemplate(config, context);
      const content = compiled[0].content;

      expect(content).toBeSimilarStringTo(`
        /* tslint:disable */
      `);
      expect(content).toBeSimilarStringTo(`
        export interface Query {
          fieldTest?: T | null;
        }
      `);
      expect(content).toBeSimilarStringTo(`
        export interface T {
          f1?: (string | null)[] | null;
          f2: number;
          f3?: A | null;
          f4?: (string | null)[][][] | null;
        }
      `);
      expect(content).toBeSimilarStringTo(`
        export interface A {
          f4?: T | null;
        }
      `);
    });

    it('should generate correctly when using simple type that extends interface', async () => {
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

      const compiled = await compileTemplate(config, context);
      const content = compiled[0].content;

      expect(content).toBeSimilarStringTo(`
        /* tslint:disable */
      `);
      expect(content).toBeSimilarStringTo(`
        export interface Base {
          f1?: string | null;
        }
      `);
      expect(content).toBeSimilarStringTo(`
        export interface Query {
          fieldTest: A;
        }
      `);
      expect(content).toBeSimilarStringTo(`
        export interface A extends Base {
          f1?: string | null;
          f2?: string | null;
        }
      `);
    });

    it('should generate correctly when using custom scalar', async () => {
      const { context } = compileAndBuildContext(`
        type Query {
          fieldTest: [Date]
        }
        
        scalar Date
      `);

      const compiled = await compileTemplate(
        {
          ...config,
          config: {
            scalars: {
              Date: 'OtherDate'
            }
          }
        } as GeneratorConfig,
        context
      );

      const content = compiled[0].content;

      expect(content).toBeSimilarStringTo(`
        /* tslint:disable */
      `);
      expect(content).toBeSimilarStringTo(`
        export type Date = OtherDate;
      `);
      expect(content).toBeSimilarStringTo(`
        export interface Query {
          fieldTest?: (Date | null)[] | null;
        }
      `);
    });

    it('should generate correctly when using custom scalar of same name', async () => {
      const { context } = compileAndBuildContext(`
        type Query {
          fieldTest: [Date]
        }
        
        scalar Date
      `);

      const compiled = await compileTemplate(
        {
          ...config,
          config: {
            scalars: {
              Date: 'Date'
            }
          }
        } as GeneratorConfig,
        context
      );

      const content = compiled[0].content;

      expect(content).toBeSimilarStringTo(`
        /* tslint:disable */
      `);
      // Avoid circular type references (#485).
      expect(content).not.toBeSimilarStringTo(`
        export type Date = Date;
      `);
      expect(content).toBeSimilarStringTo(`
        export interface Query {
          fieldTest?: (Date | null)[] | null;
        }
      `);
    });

    it('should transform correctly name of scalar', async () => {
      const { context } = compileAndBuildContext(`
        type Query {
          fieldTest: [JSON]
        }
        
        scalar JSON
      `);

      const compiled = await compileTemplate(
        {
          ...config
        } as GeneratorConfig,
        context
      );

      const content = compiled[0].content;

      expect(content).toBeSimilarStringTo(`
        export type Json = any;
      `);
      expect(content).toBeSimilarStringTo(`
        export interface Query {
          fieldTest?: (Json | null)[] | null;
        }
      `);
    });

    it('should transform correctly name of union', async () => {
      const { context } = compileAndBuildContext(`
        type Query {
          fieldTest: [CBText]
        }
        union CBText = ABText | BBText
        scalar ABText
        scalar BBText
      `);

      const compiled = await compileTemplate(
        {
          ...config
        } as GeneratorConfig,
        context
      );

      const content = compiled[0].content;

      expect(content).toBeSimilarStringTo(`
        export type AbText = any;
      `);
      expect(content).toBeSimilarStringTo(`
        export type BbText = any;
      `);
      expect(content).toBeSimilarStringTo(`
        export interface Query {
          fieldTest?: (CbText | null)[] | null;
        }
      `);
      expect(content).toBeSimilarStringTo(`
        export type CbText = AbText | BbText;
      `);
    });

    it('should generate enums correctly', async () => {
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

      const compiled = await compileTemplate(config, context);
      const content = compiled[0].content;

      expect(content).toBeSimilarStringTo(`
        /* tslint:disable */
      `);
      expect(content).toBeSimilarStringTo(`
        export interface Query {
          fieldTest: MyEnum;
        }
      `);
      expect(content).toBeSimilarStringTo(`
        export enum MyEnum {
          A = "A",
          B = "B",
          C = "C",
        }
      `);
    });

    it('should generate unions correctly', async () => {
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

      const compiled = await compileTemplate(config, context);
      const content = compiled[0].content;

      expect(content).toBeSimilarStringTo(`
        /* tslint:disable */
      `);
      expect(content).toBeSimilarStringTo(`  
        export interface Query {
          fieldTest: C;
        }
      `);
      expect(content).toBeSimilarStringTo(`
        export interface A {
          f1?: string | null;
        }
      `);
      expect(content).toBeSimilarStringTo(`
        export interface B {
          f2?: string | null;
        }
      `);
      expect(content).toBeSimilarStringTo(`
        /** Union description */
        export type C = A | B;
      `);
    });

    it('should generate type arguments types correctly when using simple Scalar', async () => {
      const { context } = compileAndBuildContext(`
        type Query {
          fieldTest(arg1: String): String!
        }
      `);

      const compiled = await compileTemplate(config, context);
      const content = compiled[0].content;
      expect(content).toBeSimilarStringTo(`
        /* tslint:disable */
      `);
      expect(content).toBeSimilarStringTo(`
        export interface Query {
          fieldTest: string;
        }
      `);
      expect(content).toBeSimilarStringTo(`
        export interface FieldTestQueryArgs {
          arg1?: string | null;
        }
      `);
    });

    it('should generate type arguments types correctly when using custom input', async () => {
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
          f4: [String]!
          f5: [String!]!
          f6: [String!]
        }
      `);

      const compiled = await compileTemplate(config, context);
      const content = compiled[0].content;
      expect(content).toBeSimilarStringTo(`
       /* tslint:disable */
      `);
      expect(content).toBeSimilarStringTo(`
       export interface Query {
          fieldTest?: Return | null; 
        }
      `);
      expect(content).toBeSimilarStringTo(`
        export interface Return {
          ok: boolean; 
          msg: string; 
        }
      `);
      expect(content).toBeSimilarStringTo(`
        export interface T {
          f1?: string | null; 
          f2: number; 
          f3?: (string | null)[] | null; 
          f4: (string | null)[]; 
          f5: string[]; 
          f6?: string[] | null; 
        }
      `);
      expect(content).toBeSimilarStringTo(`
        export interface FieldTestQueryArgs {
          myArgument: T;
        }
      `);
    });

    it('should generate from a whole schema object correctly', async () => {
      const schema = introspectionToGraphQLSchema(JSON.parse(fs.readFileSync('./tests/files/schema.json').toString()));
      const context = schemaToTemplateContext(schema);
      const compiled = await compileTemplate(config, context);
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
    describe('Issues', () => {
      it('Issue 605 - Incorrect casing for model names and fragments', async () => {
        const schema = makeExecutableSchema({
          typeDefs: gql`
            type User_Special {
              id: String!
              name: String!
            }

            type Query {
              users: [User_Special]
              vE2_User: [User_Special]
            }
          `,
          allowUndefinedInResolve: true
        });
        const context = schemaToTemplateContext(schema);
        const documents = gql`
          query Query1 {
            users {
              ...my_fragment
            }
          }

          fragment my_fragment on User_Special {
            id
            name
          }

          query Query2 {
            vE2_User {
              id
              name
            }
          }
        `;

        const transformedDocument = transformDocument(schema, documents);
        const compiled = await compileTemplate(
          {
            ...config,
            config: {
              immutableTypes: true
            }
          } as GeneratorConfig,
          context,
          [transformedDocument],
          { generateSchema: false }
        );
        const content = compiled[0].content;
        expect(content).not.toContain('export namespace my_fragment {');
        expect(content).not.toContain('export type VE2User = {');
        expect(content).toContain('export namespace MyFragment {');
        expect(content).toContain('export type Ve2User = {');
      });
    });

    it('Should compile simple Query correctly', async () => {
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
      const compiled = await compileTemplate(config, context, [transformedDocument], { generateSchema: false });
      const content = compiled[0].content;

      expect(compiled[0].content).toBeSimilarStringTo(`
        /* tslint:disable */
      `);
      expect(content).toBeSimilarStringTo(`
        /** A list of options for the sort order of the feed */
        export enum FeedType {
          HOT = "HOT",
          NEW = "NEW",
          TOP = "TOP",
        }
      `);
      expect(content).toBeSimilarStringTo(`
        /** The type of vote to record, when submitting a vote */
        export enum VoteType {
          UP = "UP",
          DOWN = "DOWN",
          CANCEL = "CANCEL",
        }
      `);
      expect(content).toBeSimilarStringTo(`
        export namespace MyFeed {
          export type Variables = {
          }

          export type Query = {
            __typename?: "Query";
            feed?: (Feed | null)[] | null;
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
        }
      `);
    });
    it('Should compile anonymous Query correctly', async () => {
      const schema = introspectionToGraphQLSchema(JSON.parse(fs.readFileSync('./tests/files/schema.json').toString()));
      const context = schemaToTemplateContext(schema);

      const documents = gql`
        query {
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
      const compiled = await compileTemplate(config, context, [transformedDocument], { generateSchema: false });
      const content = compiled[0].content;

      expect(compiled[0].content).toBeSimilarStringTo(`
        /* tslint:disable */
      `);
      expect(content).toBeSimilarStringTo(`
        /** A list of options for the sort order of the feed */
        export enum FeedType {
          HOT = "HOT",
          NEW = "NEW",
          TOP = "TOP",
        }
      `);
      expect(content).toBeSimilarStringTo(`
        /** The type of vote to record, when submitting a vote */
        export enum VoteType {
          UP = "UP",
          DOWN = "DOWN",
          CANCEL = "CANCEL",
        }
      `);
      expect(content).toBeSimilarStringTo(`
        export namespace AnonymousQuery_1 {
          export type Variables = {
          }

          export type Query = {
            __typename?: "Query";
            feed?: (Feed | null)[] | null;
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
        }
      `);
    });

    it('Should compile nested types', async () => {
      const schema = makeExecutableSchema({
        typeDefs: `
          type User {
            profile: Profile
            id: Int!
            favFriend: User
          }

          type Profile {
            name: String!
            email: String!
          }
          
          type Query {
            me: User
          }
        `
      });
      const context = schemaToTemplateContext(schema);

      const documents = gql`
        query me {
          me {
            id
            profile {
              name
            }
            favFriend {
              id
              profile {
                email
              }
              favFriend {
                id
                profile {
                  email
                }
              }
            }
          }
        }
      `;

      const transformedDocument = transformDocument(schema, documents);
      const compiled = await compileTemplate(config, context, [transformedDocument], { generateSchema: false });
      const content = compiled[0].content;

      expect(compiled[0].content).toBeSimilarStringTo(`
        /* tslint:disable */
      `);
      expect(content).toBeSimilarStringTo(`
        export namespace Me {
          export type Variables = {
          }
    
          export type Query = {
            __typename?: "Query";
            me?: Me | null;
          }
    
          export type Me = {
            __typename?: "User";
            id: number;
            profile?: Profile | null;
            favFriend?: FavFriend | null;
          }
    
          export type Profile = {
            __typename?: "Profile";
            name: string;
          }
    
          export type FavFriend = {
            __typename?: "User";
            id: number;
            profile?: _Profile | null;
            favFriend?: _FavFriend | null;
          }
    
          export type _Profile = {
            __typename?: "Profile";
            email: string;
          }
          
          export type _FavFriend = {
            __typename?: "User";
            id: number;
            profile?: __Profile | null;
          }
          
          export type __Profile = {
            __typename?: "Profile";
            email: string;
          }
        }
      `);
    });

    it('Should compile simple Query with Fragment spread correctly', async () => {
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
      const compiled = await compileTemplate(config, context, [transformedDocument], { generateSchema: false });
      const content = compiled[0].content;

      expect(content).toBeSimilarStringTo(`
        /* tslint:disable */
      `);
      expect(content).toBeSimilarStringTo(`
        /** A list of options for the sort order of the feed */
        export enum FeedType {
          HOT = "HOT",
          NEW = "NEW",
          TOP = "TOP",
        }
      `);
      expect(content).toBeSimilarStringTo(`
        /** The type of vote to record, when submitting a vote */
        export enum VoteType {
          UP = "UP",
          DOWN = "DOWN",
          CANCEL = "CANCEL",
        }
      `);
      expect(content).toBeSimilarStringTo(`
        export namespace MyFeed {
          export type Variables = {
          }

          export type Query = {
            __typename?: "Query";
            feed?: (Feed | null)[] | null;
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
      `);
      expect(content).toBeSimilarStringTo(`
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
        }
      `);
    });

    it('should generate correctly when using scalar and noNamespace', async () => {
      const schema = makeExecutableSchema({
        typeDefs: `
          scalar JSON
          enum Access {
            Read
            Write
            All
          }
          
          type User {
            id: Int!
            data: JSON
            access: Access
          }
          
          type Query {
            me: User
          }
        `
      });
      const context = schemaToTemplateContext(schema);

      const documents = gql`
        query me {
          me {
            id
            data
            access
          }
        }
      `;

      const transformedDocument = transformDocument(schema, documents);
      const compiled = await compileTemplate(
        {
          ...config,
          config: {
            noNamespaces: true,
            resolvers: false
          }
        } as GeneratorConfig,
        context,
        [transformedDocument],
        { generateSchema: false }
      );
      const content = compiled[0].content;

      expect(content).toBeSimilarStringTo(`
        export type Json = any;
      `);

      expect(content).toBeSimilarStringTo(`
        export type MeVariables = {
        }
      `);

      expect(content).toBeSimilarStringTo(`
        export type MeQuery = {
          __typename?: "Query";
          me?: MeMe | null;
        }
      `);

      expect(content).toBeSimilarStringTo(`
        export type MeMe = {
          __typename?: "User";
          id: number;
          data?: Json | null;
          access?: Access | null;
        }
      `);
    });

    it('Should compile simple Query with Fragment spread and handle noNamespaces', async () => {
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
      const compiled = await compileTemplate(
        {
          ...config,
          config: {
            noNamespaces: true
          }
        } as GeneratorConfig,
        context,
        [transformedDocument],
        { generateSchema: false }
      );
      const content = compiled[0].content;

      expect(content).toBeSimilarStringTo(`
        /* tslint:disable */
      `);
      expect(content).toBeSimilarStringTo(`
        /** A list of options for the sort order of the feed */
        export enum FeedType {
          HOT = "HOT",
          NEW = "NEW",
          TOP = "TOP",
        }
      `);
      expect(content).toBeSimilarStringTo(`
        /** The type of vote to record, when submitting a vote */
        export enum VoteType {
          UP = "UP",
          DOWN = "DOWN",
          CANCEL = "CANCEL",
        }
      `);
      expect(content).toBeSimilarStringTo(`
          export type MyFeedVariables = {
          }

          export type MyFeedQuery = {
            __typename?: "Query";
            feed?: MyFeedFeed[] | null;
          }

          export type MyFeedFeed = {
            __typename?: "Entry";
            id: number; 
            commentCount: number; 
            repository: MyFeedRepository; 
          }

          export type MyFeedRepository = {
            __typename?: "Repository";
            full_name: string; 
          } & RepoFieldsFragment
      `);
      expect(content).toBeSimilarStringTo(`
          export type RepoFieldsFragment = {
            __typename?: "Repository";
            html_url: string; 
            owner?: RepoFieldsOwner | null; 
          }

          export type RepoFieldsOwner = {
            __typename?: "User";
            avatar_url: string; 
          }
      `);
    });

    it('Should compile simple Query with inline Fragment', async () => {
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
      const compiled = await compileTemplate(config, context, [transformedDocument], { generateSchema: false });
      const content = compiled[0].content;

      expect(content).toBeSimilarStringTo(`
       /* tslint:disable */
       `);
      expect(content).toBeSimilarStringTo(`
        /** A list of options for the sort order of the feed */
        export enum FeedType {
          HOT = "HOT",
          NEW = "NEW",
          TOP = "TOP",
        }
      `);
      expect(content).toBeSimilarStringTo(`
        /** The type of vote to record, when submitting a vote */
        export enum VoteType {
          UP = "UP",
          DOWN = "DOWN",
          CANCEL = "CANCEL",
        }
      `);
      expect(content).toBeSimilarStringTo(`
        export namespace MyFeed {
          export type Variables = {
          }
        
          export type Query = {
            __typename?: "Query";
            feed?: (Feed | null)[] | null;
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
        }
      `);
    });

    it('Should compile simple Query with inline Fragment and handle noNamespaces', async () => {
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
      const compiled = await compileTemplate(
        {
          ...config,
          config: {
            noNamespaces: true
          }
        } as GeneratorConfig,
        context,
        [transformedDocument],
        { generateSchema: false }
      );
      const content = compiled[0].content;

      expect(content).toBeSimilarStringTo(`
       /* tslint:disable */
       `);
      expect(content).toBeSimilarStringTo(`
        /** A list of options for the sort order of the feed */
        export enum FeedType {
          HOT = "HOT",
          NEW = "NEW",
          TOP = "TOP",
        }
      `);
      expect(content).toBeSimilarStringTo(`
        /** The type of vote to record, when submitting a vote */
        export enum VoteType {
          UP = "UP",
          DOWN = "DOWN",
          CANCEL = "CANCEL",
        }
      `);
      expect(content).toBeSimilarStringTo(`
          export type MyFeedVariables = {
          }
        
          export type MyFeedQuery = {
            __typename?: "Query";
            feed?: MyFeedFeed[] | null;
          }
        
          export type MyFeedFeed = {
            __typename?: "Entry";
            id: number; 
            commentCount: number; 
            repository: MyFeedRepository; 
          }
        
          export type MyFeedRepository = {
            __typename?: MyFeedRepositoryInlineFragment["__typename"] | MyFeed_RepositoryInlineFragment["__typename"];
            html_url: string; 
          } & (MyFeedRepositoryInlineFragment | MyFeed_RepositoryInlineFragment)
        
          export type MyFeedRepositoryInlineFragment = {
            __typename?: "Repository";
            full_name: string; 
          }
        
          export type MyFeed_RepositoryInlineFragment = {
            __typename?: "Repository";
            owner?: MyFeedOwner | null; 
          }
        
          export type MyFeedOwner = {
            __typename?: "User";
            avatar_url: string; 
          }
      `);
    });

    it('Should generate const enums when constEnums is set to true', async () => {
      const schema = introspectionToGraphQLSchema(JSON.parse(fs.readFileSync('./tests/files/schema.json').toString()));
      const context = schemaToTemplateContext(schema);
      const compiled = await compileTemplate(
        {
          ...config,
          config: {
            constEnums: true
          }
        } as GeneratorConfig,
        context,
        []
      );
      const content = compiled[0].content;

      expect(content).toBeSimilarStringTo(`
       /* tslint:disable */
       `);
      expect(content).toBeSimilarStringTo(`
        /** A list of options for the sort order of the feed */
        export const enum FeedType {
          HOT = "HOT",
          NEW = "NEW",
          TOP = "TOP",
        }
      `);
      expect(content).toBeSimilarStringTo(`
        /** The type of vote to record, when submitting a vote */
        export const enum VoteType {
          UP = "UP",
          DOWN = "DOWN",
          CANCEL = "CANCEL",
        }
      `);
    });
  });
});
