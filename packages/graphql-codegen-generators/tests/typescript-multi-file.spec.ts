import '../test-matchers/custom-matchers';
import {
  schemaToTemplateContext,
  SchemaTemplateContext, transformDocument, introspectionToGraphQLSchema,
} from 'graphql-codegen-core';
import { GraphQLSchema } from 'graphql';
import { makeExecutableSchema } from 'graphql-tools';
import { TypescriptMultiFile } from '../dist/index.js';
import { compileTemplate } from '../src/compile';
import gql from 'graphql-tag';
import * as fs from 'fs';

declare module '../dist/index.js' {
  const TypescriptMultiFile: any;
  export { TypescriptMultiFile };
}

describe('TypeScript Multi File', () => {
  const compileAndBuildContext = (typeDefs: string): SchemaTemplateContext => {
    const schema = makeExecutableSchema({ typeDefs, resolvers: {}, allowUndefinedInResolve: true }) as GraphQLSchema;

    return schemaToTemplateContext(schema);
  };

  let config;

  beforeAll(() => {
    config = TypescriptMultiFile;
  });

  describe('Schema', () => {
    it('should generate the correct types when using only simple Query', () => {
      const templateContext = compileAndBuildContext(`
        type Query {
          fieldTest: String
        }
      `);
      const compiled = compileTemplate(config, templateContext);
      expect(compiled.length).toBe(1);
      expect(compiled[0].filename).toBe('query.type.d.ts');
      expect(compiled[0].content).toBeSimilarStringTo(`
        export interface Query {
          fieldTest: string | null; 
        }
      `);
    });

    it('should generate the correct types when using Query and simple type', () => {
      const templateContext = compileAndBuildContext(`
        type MyType {
          f1: String
        }
        
        type Query {
          fieldTest: MyType
        }
      `);
      const compiled = compileTemplate(config, templateContext);
      expect(compiled.length).toBe(2);
      expect(compiled[0].filename).toBe('query.type.d.ts');
      expect(compiled[0].content).toBeSimilarStringTo(`
        import { MyType } from './mytype.type.d.ts';
        
        export interface Query {
          fieldTest: MyType | null; 
        }
      `);
      expect(compiled[1].filename).toBe('mytype.type.d.ts');
      expect(compiled[1].content).toBeSimilarStringTo(`
        export interface MyType {
          f1: string | null; 
        }
      `);
    });

    it('should generate the correct types when using Query and enum', () => {
      const templateContext = compileAndBuildContext(`
        enum MyEnum {
          V1,
          V2,
        }
        
        type Query {
          fieldTest: MyEnum
        }
      `);
      const compiled = compileTemplate(config, templateContext);
      expect(compiled.length).toBe(2);
      expect(compiled[0].filename).toBe('query.type.d.ts');
      expect(compiled[0].content).toBeSimilarStringTo(`
        import { MyEnum } from './myenum.enum.d.ts';
        
        export interface Query {
          fieldTest: MyEnum | null; 
        }
      `);
      expect(compiled[1].filename).toBe('myenum.enum.d.ts');
      expect(compiled[1].content).toBeSimilarStringTo(`
        export type MyEnum = "V1" | "V2";
      `);
    });

    it('should generate the correct types when using Query and twice of the same type (no dupes)', () => {
      const templateContext = compileAndBuildContext(`
        type MyType {
          f1: String
        }
        
        type Query {
          fieldTest: MyType
          fieldTest2: MyType
        }
      `);
      const compiled = compileTemplate(config, templateContext);
      expect(compiled.length).toBe(2);
      expect(compiled[0].filename).toBe('query.type.d.ts');
      expect(compiled[0].content).toBeSimilarStringTo(`
        import { MyType } from './mytype.type.d.ts';
        
        export interface Query {
          fieldTest: MyType | null; 
          fieldTest2: MyType | null; 
        }
      `);
      expect(compiled[1].filename).toBe('mytype.type.d.ts');
      expect(compiled[1].content).toBeSimilarStringTo(`
        export interface MyType {
          f1: string | null; 
        }
      `);
    });

    it('should generate correctly when using simple type that extends interface', () => {
      const templateContext = compileAndBuildContext(`
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

      const compiled = compileTemplate(config, templateContext);
      expect(compiled.length).toBe(3);
      expect(compiled[0].filename).toBe('query.type.d.ts');
      expect(compiled[1].filename).toBe('a.type.d.ts');
      expect(compiled[2].filename).toBe('base.interface.d.ts');

      expect(compiled[2].content).toBeSimilarStringTo(`
        export interface Base {
          f1: string | null;
        }
      `);
      expect(compiled[0].content).toBeSimilarStringTo(`
        import { A } from './a.type.d.ts';
        
        export interface Query {
          fieldTest: A;
        }
      `);
      expect(compiled[1].content).toBeSimilarStringTo(`
        import { Base } from './base.interface.d.ts';
        
        export interface A extends Base {
          f1: string | null;
          f2: string | null;
        }
      `);
    });

    it('should generate correctly when using custom scalar', () => {
      const templateContext = compileAndBuildContext(`
        type Query {
          fieldTest: [Date]
        }
        
        scalar Date
      `);

      const compiled = compileTemplate(config, templateContext);
      expect(compiled.length).toBe(2);
      expect(compiled[0].filename).toBe('query.type.d.ts');
      expect(compiled[1].filename).toBe('date.scalar.d.ts');

      expect(compiled[0].content).toBeSimilarStringTo(`
        import { Date } from './date.scalar.d.ts';
        
        export interface Query {
          fieldTest: Date[] | null;
        }
      `);
      expect(compiled[1].content).toBeSimilarStringTo(`
        export type Date = any;
      `);
    });

    it('should generate unions correctly', () => {
      const templateContext = compileAndBuildContext(`
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

      const compiled = compileTemplate(config, templateContext);
      expect(compiled.length).toBe(4);
      expect(compiled[0].filename).toBe('query.type.d.ts');
      expect(compiled[1].filename).toBe('a.type.d.ts');
      expect(compiled[2].filename).toBe('b.type.d.ts');
      expect(compiled[3].filename).toBe('c.union.d.ts');

      expect(compiled[0].content).toBeSimilarStringTo(`
        import { C } from './c.union.d.ts';
        
        export interface Query {
          fieldTest: C;
        }
      `);
      expect(compiled[1].content).toBeSimilarStringTo(`
        export interface A {
          f1: string | null;
        }
      `);
      expect(compiled[2].content).toBeSimilarStringTo(`
        export interface B {
          f2: string | null;
        }
      `);
      expect(compiled[3].content).toBeSimilarStringTo(`
        import { A } from './a.type.d.ts';
        import { B } from './b.type.d.ts';
        
        /* Union description */
        export type C = A | B;
      `);
    });

    it('should generate type arguments types correctly when using simple primitive', () => {
      const templateContext = compileAndBuildContext(`
        type Query {
          fieldTest(arg1: String): String!
        }
      `);

      const compiled = compileTemplate(config, templateContext);
      expect(compiled.length).toBe(1);
      const content = compiled[0].content;
      expect(compiled[0].filename).toBe('query.type.d.ts');
      expect(content).toBeSimilarStringTo(`
        export interface Query {
          fieldTest: string;
        }
        
        export interface FieldTestQueryArgs {
          arg1: string | null;
        }`);
    });

    it('should generate type arguments types correctly when using custom input', () => {
      const templateContext = compileAndBuildContext(`
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

      const compiled = compileTemplate(config, templateContext);
      expect(compiled.length).toBe(3);
      expect(compiled[0].filename).toBe('query.type.d.ts');
      expect(compiled[1].filename).toBe('return.type.d.ts');
      expect(compiled[2].filename).toBe('t.input-type.d.ts');

      expect(compiled[0].content).toBeSimilarStringTo(`
        import { Return } from './return.type.d.ts';
        import { T } from './t.input-type.d.ts';
        
        export interface Query {
          fieldTest: Return | null; 
        }
                
        export interface FieldTestQueryArgs {
          myArgument: T;
        }
      `);
      expect(compiled[1].content).toBeSimilarStringTo(`
        export interface Return {
          ok: boolean; 
          msg: string; 
        }
      `);
      expect(compiled[2].content).toBeSimilarStringTo(`
        export interface T {
          f1: string | null; 
          f2: number; 
          f3: string[] | null; 
          f4: number[] | null; 
        }
      `);

    });
  });

  describe('Operations', () => {
    it('Should compile simple Query correctly', () => {
      const schema = introspectionToGraphQLSchema(JSON.parse(fs.readFileSync('../../dev-test/githunt/schema.json').toString()));
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

      expect(compiled.length).toBe(3);
      expect(compiled[0].filename).toBe('feedtype.enum.d.ts');
      expect(compiled[1].filename).toBe('votetype.enum.d.ts');
      expect(compiled[2].filename).toBe('myfeed.query.d.ts');

      expect(compiled[0].content).toBeSimilarStringTo(`
        /* A list of options for the sort order of the feed */
        export type FeedType = "HOT" | "NEW" | "TOP";
      `);
      expect(compiled[1].content).toBeSimilarStringTo(`
        /* The type of vote to record, when submitting a vote */
        export type VoteType = "UP" | "DOWN" | "CANCEL";
      `);
      expect(compiled[2].content).toBeSimilarStringTo(`
        export namespace MyFeed {
          export type Variables = {
          }
        
          export type Query = {
            feed: Feed[] | null; 
          }
        
          export type Feed = {
            id: number; 
            commentCount: number; 
            repository: Repository; 
          }
        
          export type Repository = {
            full_name: string; 
            html_url: string; 
            owner: Owner | null; 
          }
        
          export type Owner = {
            avatar_url: string; 
          }
        }
      `);

    });

    it('Should compile simple Query with Fragment spread correctly', () => {
      const schema = introspectionToGraphQLSchema(JSON.parse(fs.readFileSync('../../dev-test/githunt/schema.json').toString()));
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

      expect(compiled.length).toBe(4);
      expect(compiled[0].filename).toBe('feedtype.enum.d.ts');
      expect(compiled[1].filename).toBe('votetype.enum.d.ts');
      expect(compiled[2].filename).toBe('myfeed.query.d.ts');
      expect(compiled[3].filename).toBe('repofields.fragment.d.ts');

      expect(compiled[0].content).toBeSimilarStringTo(`
        /* A list of options for the sort order of the feed */
        export type FeedType = "HOT" | "NEW" | "TOP";
      `);
      expect(compiled[1].content).toBeSimilarStringTo(`
        /* The type of vote to record, when submitting a vote */
        export type VoteType = "UP" | "DOWN" | "CANCEL";
      `);
      expect(compiled[2].content).toBeSimilarStringTo(`
        import { RepoFields } from './repofields.fragment.d.ts';
        
        export namespace MyFeed {
          export type Variables = {
          }
        
          export type Query = {
            feed: Feed[] | null; 
          }
        
          export type Feed = {
            id: number; 
            commentCount: number; 
            repository: Repository; 
          }
        
          export type Repository = {
            full_name: string; 
          } & RepoFields.Fragment
        }
      `);
      expect(compiled[3].content).toBeSimilarStringTo(`
        export namespace RepoFields {
          export type Fragment = {
            html_url: string; 
            owner: Owner | null; 
          }
        
          export type Owner = {
            avatar_url: string; 
          }
        }
      `);
    });
  });
});
