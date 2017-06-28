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
      expect(content).toBySimilarStringTo(`
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
      expect(content).toBySimilarStringTo(`
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
      expect(content).toBySimilarStringTo(`
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
  });
});
