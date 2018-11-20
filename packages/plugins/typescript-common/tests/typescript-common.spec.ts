import 'graphql-codegen-core/dist/testing';
import { GraphQLSchema } from 'graphql';
import { makeExecutableSchema } from 'graphql-tools';
import { plugin } from '../dist';

describe('TypeScript Common', () => {
  function buildSchema(ast: string): GraphQLSchema {
    return makeExecutableSchema({
      typeDefs: ast,
      allowUndefinedInResolve: true
    });
  }

  const schema = buildSchema(`
    type Foo {
        bar: Bar
    }

    type Bar {
        qux: String
    }

    input myTypeNOnStandart {
      f: String
    }

    enum A {
      ONE,
      TWO,
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

  describe('namingConvention', () => {
    it('Should use pascal case by default', async () => {
      const content = await plugin(schema, [], {});

      expect(content).not.toContain(`myTypeNOnStandart`);
      expect(content).toContain(`MyTypeNOnStandart`);
    });

    it('Should use different naming when overridden', async () => {
      const content = await plugin(schema, [], { namingConvention: 'change-case#lowerCase' });

      expect(content).not.toContain(`myTypeNOnStandart`);
      expect(content).toContain(`mytypenonstandart`);
    });

    it('Should throw when module does not exists', async () => {
      let thrown = false;
      try {
        await plugin(schema, [], { namingConvention: 'oops#boop' });
      } catch (e) {
        thrown = true;
        expect(e.message).toContain(`Cannot find module`);
      }

      expect(thrown).toBeTruthy();
    });

    it('Should throw when method does not exists', async () => {
      let thrown = false;
      try {
        await plugin(schema, [], { namingConvention: 'change-case#boop' });
      } catch (e) {
        thrown = true;
        expect(e.message).toContain(`boop couldn't be found in module change-case!`);
      }

      expect(thrown).toBeTruthy();
    });
  });

  describe('Enums', () => {
    it('Should generate enums as interface by default', async () => {
      const content = await plugin(schema, [], {});

      expect(content).toBeSimilarStringTo(`
        export enum A {
          One = "ONE",
          Two = "TWO",
        }
      `);
    });

    it('Should generate enums as types with enumsAsTypes', async () => {
      const content = await plugin(schema, [], { enumsAsTypes: true });

      expect(content).toBeSimilarStringTo(`export type A = "ONE" | "TWO";`);
    });

    it('Should generate const enums as types with constEnums', async () => {
      const content = await plugin(schema, [], { constEnums: true });

      expect(content).toBeSimilarStringTo(`
        export const enum A {
          One = "ONE",
          Two = "TWO",
        }`);
    });

    it('Should generate correct enum names with interfacePrefix', async () => {
      const content = await plugin(schema, [], { interfacePrefix: 'Pref' });

      expect(content).toBeSimilarStringTo(`
        export enum PrefA {
          One = "ONE",
          Two = "TWO",
        }`);
    });

    it('Should generate the correct output with custom enums value', async () => {
      const content = await plugin(schema, [], {
        enums: {
          A: {
            ONE: '1',
            TWO: '2'
          }
        }
      });

      expect(content).toBeSimilarStringTo(`
        export enum A {
          One = 1,
          Two = 2,
        }`);
    });

    it('Should generate the correct description for enums', async () => {
      const content = await plugin(
        buildSchema(`
      # MyEnumA
      enum A {
        ONE,
        TWO,
      }
      `),
        [],
        {}
      );

      expect(content).toBeSimilarStringTo(`
        /** MyEnumA */
        export enum A {
          One = "ONE",
          Two = "TWO",
        }`);
    });
  });

  describe('Input Types', () => {
    it('Should generate input type fields correctly', async () => {
      const content = await plugin(schema, [], {});

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
    });

    it('Should generate input type fields correctly when immutableTypes is set', async () => {
      const content = await plugin(schema, [], { immutableTypes: true });

      expect(content).toBeSimilarStringTo(`
        export interface T {
          readonly f1?: string | null; 
          readonly f2: number; 
          readonly f3?: ReadonlyArray<string | null> | null;
          readonly f4: ReadonlyArray<string | null>;
          readonly f5: ReadonlyArray<string>;
          readonly f6?: ReadonlyArray<string> | null;
        }
      `);
    });

    it('Should generate input type description', async () => {
      const content = await plugin(
        buildSchema(`
      # inputTypeDesc 
      input T {
        f: String!
      }  
      `),
        [],
        {}
      );

      expect(content).toBeSimilarStringTo(`
        /** inputTypeDesc */
        export interface T {
          f: string; 
        }
      `);
    });

    it('Should the correct prefix when interfacePrefix is set', async () => {
      const content = await plugin(schema, [], { interfacePrefix: 'Pre' });

      expect(content).toBeSimilarStringTo(`
      export interface PreT {
        f1?: string | null; 
        f2: number; 
        f3?: (string | null)[] | null; 
        f4: (string | null)[]; 
        f5: string[]; 
        f6?: string[] | null; 
      }
      `);
    });

    it('Should the correct prefix when scalars is set', async () => {
      const content = await plugin(schema, [], { scalars: { String: 'boop' } });

      expect(content).toBeSimilarStringTo(`
      export interface T {
        f1?: boop | null; 
        f2: number; 
        f3?: (boop | null)[] | null; 
        f4: (boop | null)[]; 
        f5: boop[]; 
        f6?: boop[] | null; 
      }
      `);
    });
  });

  describe('Scalars', () => {
    it('Should generate correctly scalars without definition of it', async () => {
      const content = await plugin(
        buildSchema(`
        type Query {
          fieldTest: [Date]
        }
        
        scalar Date
      `),
        [],
        {}
      );

      expect(content).toBeSimilarStringTo(`
      export type Date = any;
      `);
    });

    it('Should generate correctly scalars with custom scalar type', async () => {
      const content = await plugin(
        buildSchema(`
        type Query {
          fieldTest: [Date]
        }
        
        scalar Date
      `),
        [],
        {
          scalars: {
            Date: 'MyCustomDate'
          }
        }
      );

      expect(content).toBeSimilarStringTo(`
      export type Date = MyCustomDate;
      `);
    });
  });
});
