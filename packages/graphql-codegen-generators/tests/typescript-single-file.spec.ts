import '../test-matchers/custom-matchers';
import { schemaToTemplateContext, SchemaTemplateContext } from 'graphql-codegen-core';
import { GraphQLSchema } from 'graphql';
import * as fs from 'fs';
import { makeExecutableSchema } from 'graphql-tools';
import { compileTemplate } from '../src/compile';

describe('TypeScript Single File', () => {
  const compileAndBuildContext = (typeDefs: string): SchemaTemplateContext => {
    const schema = makeExecutableSchema({ typeDefs, resolvers: {}, allowUndefinedInResolve: true }) as GraphQLSchema;

    return schemaToTemplateContext(schema);
  };

  let template;
  let config;

  beforeAll(() => {
    template = fs.readFileSync('./src/typescript-single-file/template.handlebars').toString();
    config = JSON.parse(fs.readFileSync('./src/typescript-single-file/config.json').toString());
  });

  describe('Schema', () => {
    it('should compile template correctly when using a simple Query', () => {
      const templateContext = compileAndBuildContext(`
        type Query {
          fieldTest: String
        }
      `);
      const compiled = compileTemplate(template, config, templateContext);
      const content = compiled[0].content;
      expect(content).toBeSimilarStringTo(`
      /* tslint:disable */
      
      export interface Query {
        fieldTest: string | null;
      }`);
    });

    it('should compile template correctly when using a simple Query with some fields and types', () => {
      const templateContext = compileAndBuildContext(`
        type Query {
          fieldTest: String
        }
        
        type T {
          f1: String
          f2: Int
        }
      `);
      const compiled = compileTemplate(template, config, templateContext);
      const content = compiled[0].content;
      expect(content).toBeSimilarStringTo(`
      /* tslint:disable */
      
      export interface Query {
        fieldTest: string | null;
      }
      
      export interface T {
        f1: string | null;
        f2: number | null;
      }`);
    });

    it('should compile template correctly when using a simple Query with arrays and required', () => {
      const templateContext = compileAndBuildContext(`
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
      const compiled = compileTemplate(template, config, templateContext);
      const content = compiled[0].content;
      expect(content).toBeSimilarStringTo(`
      /* tslint:disable */
      
      export interface Query {
        fieldTest: string | null;
      }
      
      export interface T {
        f1: string[] | null;
        f2: number;
        f3: A | null;
      }
        
      export interface A {
        f4: string | null;
      }`);
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

      const compiled = compileTemplate(template, config, templateContext);
      const content = compiled[0].content;
      expect(content).toBeSimilarStringTo(`
        /* tslint:disable */
      
        export interface Query {
          fieldTest: A;
        }
      
        export interface A extends Base {
          f1: string | null;
          f2: string | null;
        }`);
    });

    it('should generate correctly when using custom scalar', () => {
      const templateContext = compileAndBuildContext(`
        type Query {
          fieldTest: [Date]
        }
        
        scalar Date
      `);

      const compiled = compileTemplate(template, config, templateContext);
      const content = compiled[0].content;
      expect(content).toBeSimilarStringTo(`
      /* tslint:disable */

      export type Date = any;
      
      export interface Query {
        fieldTest: Date[] | null;
      }`);
    });

    it('should generate enums correctly', () => {
      const templateContext = compileAndBuildContext(`
        type Query {
          fieldTest: MyEnum!
        }
        
        enum MyEnum {
          A
          B
          C
        }
      `);

      const compiled = compileTemplate(template, config, templateContext);
      const content = compiled[0].content;
      expect(content).toBeSimilarStringTo(`
      /* tslint:disable */
      
      export interface Query {
        fieldTest: MyEnum;
      }
      export type MyEnum = "A" | "B" | "C";`);
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

      const compiled = compileTemplate(template, config, templateContext);
      const content = compiled[0].content;
      expect(content).toBeSimilarStringTo(`
        /* tslint:disable */
        
        export interface Query {
          fieldTest: C;
        }
        
        export interface A {
          f1: string | null;
        }
        
        export interface B {
          f2: string | null;
        }
        
        // Union description
        export type C = A | B;
      `);
    });

    it('should generate type arguments types correctly when using simple Scalar', () => {
      const templateContext = compileAndBuildContext(`
        type Query {
          fieldTest(arg1: String): String!
        }
      `);

      const compiled = compileTemplate(template, config, templateContext);
      const content = compiled[0].content;
      expect(content).toBeSimilarStringTo(`
        /* tslint:disable */
        
        export interface Query {
          fieldTest: string;
        }
        
        export interface QueryFieldTestArgs {
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

      const compiled = compileTemplate(template, config, templateContext);
      const content = compiled[0].content;
      expect(content).toBeSimilarStringTo(`
       /* tslint:disable */
        
       export interface Query {
          fieldTest: Return | null; 
        }
        
        export interface Return {
          ok: boolean; 
          msg: string; 
        }
        
        export interface T {
          f1: string | null; 
          f2: number; 
          f3: string[] | null; 
          f4: number[] | null; 
        }
        
        export interface QueryFieldTestArgs {
          myArgument: T;
        }
    `);
    });
  });
});
