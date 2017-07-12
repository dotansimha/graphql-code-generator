import '../test-matchers/custom-matchers';
import {
  schemaToTemplateContext,
  SchemaTemplateContext,
} from 'graphql-codegen-core';
import { GraphQLSchema } from 'graphql';
import { makeExecutableSchema } from 'graphql-tools';
import { TypescriptMultiFile } from '../dist/index.js';
import { compileTemplate } from '../src/compile';

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
  });
});
