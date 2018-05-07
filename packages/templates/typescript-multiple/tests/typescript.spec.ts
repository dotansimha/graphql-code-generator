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

describe('TypeScript Multiple', () => {
  const compileAndBuildContext = (typeDefs: string): { context: SchemaTemplateContext; schema: GraphQLSchema } => {
    const schema = makeExecutableSchema({ typeDefs, resolvers: {}, allowUndefinedInResolve: true }) as GraphQLSchema;

    return {
      schema,
      context: schemaToTemplateContext(schema)
    };
  };

  describe('Schema', () => {
    it('should pass custom config correctly to the generator', async () => {
      const { context } = compileAndBuildContext(`
        type Query {
          fieldTest: String
        }
      `);

      const compiled = await compileTemplate(
        {
          ...config,
          templates: {
            type: `{{ config.custom }}`
          },
          config: {
            custom: 'A'
          }
        } as GeneratorConfig,
        context
      );

      expect(compiled.length).toBe(1);
      expect(compiled[0].filename).toBe('query.type.ts');
      expect(compiled[0].content).toBeSimilarStringTo(`A`);
    });

    it('should generate the correct types when using only simple Query', async () => {
      const { context } = compileAndBuildContext(`
        type Query {
          fieldTest: String
        }
      `);
      const compiled = await compileTemplate(config, context);
      expect(compiled.length).toBe(1);
      expect(compiled[0].filename).toBe('query.type.ts');
      expect(compiled[0].content).toBeSimilarStringTo(`
        export interface Query {
          fieldTest?: string | null;
        }
      `);
    });

    it('should generate the correct types when using Query and simple type', async () => {
      const { context } = compileAndBuildContext(`
        type MyType {
          f1: String
        }

        type Query {
          fieldTest: MyType
        }
      `);
      const compiled = await compileTemplate(config, context);
      expect(compiled.length).toBe(2);
      expect(compiled[0].filename).toBe('query.type.ts');
      expect(compiled[0].content).toBeSimilarStringTo(`
        import { MyType } from './mytype.type';

        export interface Query {
          fieldTest?: MyType | null;
        }
      `);
      expect(compiled[1].filename).toBe('mytype.type.ts');
      expect(compiled[1].content).toBeSimilarStringTo(`
        export interface MyType {
          f1?: string | null;
        }
      `);
    });

    it('should generate the correct types when using Query and enum', async () => {
      const { context } = compileAndBuildContext(`
        enum MyEnum {
          V1,
          V2,
        }

        type Query {
          fieldTest: MyEnum
        }
      `);
      const compiled = await compileTemplate(config, context);
      expect(compiled.length).toBe(2);
      expect(compiled[0].filename).toBe('query.type.ts');
      expect(compiled[0].content).toBeSimilarStringTo(`
        import { MyEnum } from './myenum.enum';

        export interface Query {
          fieldTest?: MyEnum | null;
        }
      `);
      expect(compiled[1].filename).toBe('myenum.enum.ts');
      expect(compiled[1].content).toBeSimilarStringTo(`
        export enum MyEnum {
          V1 = "V1",
          V2 = "V2",
        }
      `);
    });

    it('should generate the correct types when using Query and twice of the same type (no dupes)', async () => {
      const { context } = compileAndBuildContext(`
        type MyType {
          f1: String
        }

        type Query {
          fieldTest: MyType
          fieldTest2: MyType
        }
      `);
      const compiled = await compileTemplate(config, context);
      expect(compiled.length).toBe(2);
      expect(compiled[0].filename).toBe('query.type.ts');
      expect(compiled[0].content).toBeSimilarStringTo(`
        import { MyType } from './mytype.type';

        export interface Query {
          fieldTest?: MyType | null;
          fieldTest2?: MyType | null;
        }
      `);
      expect(compiled[1].filename).toBe('mytype.type.ts');
      expect(compiled[1].content).toBeSimilarStringTo(`
        export interface MyType {
          f1?: string | null;
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
      expect(compiled.length).toBe(3);
      expect(compiled[0].filename).toBe('query.type.ts');
      expect(compiled[1].filename).toBe('a.type.ts');
      expect(compiled[2].filename).toBe('base.interface.ts');

      expect(compiled[2].content).toBeSimilarStringTo(`
        export interface Base {
          f1?: string | null;
        }
      `);
      expect(compiled[0].content).toBeSimilarStringTo(`
        import { A } from './a.type';

        export interface Query {
          fieldTest: A;
        }
      `);
      expect(compiled[1].content).toBeSimilarStringTo(`
        import { Base } from './base.interface';

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

      const compiled = await compileTemplate(config, context);
      expect(compiled.length).toBe(2);
      expect(compiled[0].filename).toBe('query.type.ts');
      expect(compiled[1].filename).toBe('date.scalar.ts');

      expect(compiled[0].content).toBeSimilarStringTo(`
        import { Date } from './date.scalar';

        export interface Query {
          fieldTest?: (Date | null)[] | null; 
        }
      `);
      expect(compiled[1].content).toBeSimilarStringTo(`
        export type Date = any;
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
      expect(compiled.length).toBe(4);
      expect(compiled[0].filename).toBe('query.type.ts');
      expect(compiled[1].filename).toBe('a.type.ts');
      expect(compiled[2].filename).toBe('b.type.ts');
      expect(compiled[3].filename).toBe('c.union.ts');

      expect(compiled[0].content).toBeSimilarStringTo(`
        import { C } from './c.union';

        export interface Query {
          fieldTest: C;
        }
      `);
      expect(compiled[1].content).toBeSimilarStringTo(`
        export interface A {
          f1?: string | null;
        }
      `);
      expect(compiled[2].content).toBeSimilarStringTo(`
        export interface B {
          f2?: string | null;
        }
      `);
      expect(compiled[3].content).toBeSimilarStringTo(`
        import { A } from './a.type';
        import { B } from './b.type';

        /** Union description */
        export type C = A | B;
      `);
    });

    it('should generate type arguments types correctly when using simple primitive', async () => {
      const { context } = compileAndBuildContext(`
        type Query {
          fieldTest(arg1: String): String!
        }
      `);

      const compiled = await compileTemplate(config, context);
      expect(compiled.length).toBe(1);
      const content = compiled[0].content;
      expect(compiled[0].filename).toBe('query.type.ts');
      expect(content).toBeSimilarStringTo(`
        export interface Query {
          fieldTest: string;
        }

        export interface FieldTestQueryArgs {
          arg1?: string | null;
        }`);
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
          f4: [Float]
        }
      `);

      const compiled = await compileTemplate(config, context);
      expect(compiled.length).toBe(3);
      expect(compiled[0].filename).toBe('query.type.ts');
      expect(compiled[1].filename).toBe('return.type.ts');
      expect(compiled[2].filename).toBe('t.input-type.ts');

      expect(compiled[0].content).toBeSimilarStringTo(`
        import { Return } from './return.type';
        import { T } from './t.input-type';

        export interface Query {
          fieldTest?: Return | null;
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
          f1?: string | null; 
          f2: number; 
          f3?: (string | null)[] | null; 
          f4?: (number | null)[] | null; 
        }
      `);
    });
  });

  describe('Operations', () => {
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

      expect(compiled.length).toBe(3);
      expect(compiled[0].filename).toBe('feedtype.enum.ts');
      expect(compiled[1].filename).toBe('votetype.enum.ts');
      expect(compiled[2].filename).toBe('myfeed.query.ts');

      expect(compiled[0].content).toBeSimilarStringTo(`
        /** A list of options for the sort order of the feed */
        export enum FeedType {
          HOT = "HOT",
          NEW = "NEW",
          TOP = "TOP",
        }
      `);
      expect(compiled[1].content).toBeSimilarStringTo(`
        /** The type of vote to record, when submitting a vote */
        export enum VoteType {
          UP = "UP",
          DOWN = "DOWN",
          CANCEL = "CANCEL",
        }
      `);
      expect(compiled[2].content).toBeSimilarStringTo(`
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

      expect(compiled.length).toBe(4);
      expect(compiled[0].filename).toBe('feedtype.enum.ts');
      expect(compiled[1].filename).toBe('votetype.enum.ts');
      expect(compiled[2].filename).toBe('myfeed.query.ts');
      expect(compiled[3].filename).toBe('repofields.fragment.ts');

      expect(compiled[0].content).toBeSimilarStringTo(`
        /** A list of options for the sort order of the feed */
        export enum FeedType {
          HOT = "HOT",
          NEW = "NEW",
          TOP = "TOP",
        }
      `);
      expect(compiled[1].content).toBeSimilarStringTo(`
        /** The type of vote to record, when submitting a vote */
        export enum VoteType {
          UP = "UP",
          DOWN = "DOWN",
          CANCEL = "CANCEL",
        }
      `);
      expect(compiled[2].content).toBeSimilarStringTo(`
        import { RepoFields } from './repofields.fragment';

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
      expect(compiled[3].content).toBeSimilarStringTo(`
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
  });
});
