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

    enum FOODEnum {
      PIZZA,
      BURGER,
    }

    input T {
      f1: String
      f2: Int!
      f3: [String]
      f4: [String]!
      f5: [String!]!
      f6: [String!]
      f7: Int = 42
    }
    `);

  it('should have correct Maybe type', async () => {
    const content = await plugin(
      schema,
      [],
      {},
      {
        outputFile: 'graphql.ts'
      }
    );

    expect(content).toBeSimilarStringTo(`
      type Maybe<T> = T | null;
    `);
  });

  it('should have customizable Maybe type', async () => {
    const content = await plugin(
      schema,
      [],
      {
        optionalType: 'undefined'
      },
      {
        outputFile: 'graphql.ts'
      }
    );

    expect(content).toBeSimilarStringTo(`
      type Maybe<T> = T | undefined;
    `);
  });

  describe('namingConvention', () => {
    it('Should use pascal case by default', async () => {
      const content = await plugin(
        schema,
        [],
        {},
        {
          outputFile: 'graphql.ts'
        }
      );

      expect(content).not.toContain(`myTypeNOnStandart`);
      expect(content).toContain(`MyTypeNOnStandart`);
    });

    it('Should generate enums in PascalCase by default', async () => {
      const content = await plugin(
        buildSchema(`
          enum FOODEnum {
            PIZZA,
            BURGER,
          }
        `),
        [],
        {},
        {
          outputFile: 'graphql.ts'
        }
      );

      expect(content).toBeSimilarStringTo(`
        export enum FoodEnum {
          Pizza = "PIZZA",
          Burger = "BURGER",
        }
      `);
    });

    it('Should generate enums in PascalCase by default when enumsAsTypes is used', async () => {
      const content = await plugin(
        buildSchema(`
          enum FOODEnum {
            PIZZA,
            BURGER,
          }
        `),
        [],
        {
          enumsAsTypes: true
        },
        {
          outputFile: 'graphql.ts'
        }
      );

      expect(content).toBeSimilarStringTo(`
        export type FoodEnum = "PIZZA" | "BURGER";
      `);
    });

    it('Should use different naming when overridden', async () => {
      const content = await plugin(
        schema,
        [],
        { namingConvention: 'change-case#lowerCase' },
        {
          outputFile: 'graphql.ts'
        }
      );

      expect(content).not.toContain(`myTypeNOnStandart`);
      expect(content).toContain(`mytypenonstandart`);
    });

    it('Should throw when module does not exists', async () => {
      let thrown = false;
      try {
        await plugin(
          schema,
          [],
          { namingConvention: 'oops#boop' },
          {
            outputFile: 'graphql.ts'
          }
        );
      } catch (e) {
        thrown = true;
        expect(e.message).toContain(`Cannot find module`);
      }

      expect(thrown).toBeTruthy();
    });

    it('Should throw when method does not exists', async () => {
      let thrown = false;
      try {
        await plugin(
          schema,
          [],
          { namingConvention: 'change-case#boop' },
          {
            outputFile: 'graphql.ts'
          }
        );
      } catch (e) {
        thrown = true;
        expect(e.message).toContain(`boop couldn't be found in module change-case!`);
      }

      expect(thrown).toBeTruthy();
    });
  });

  describe('Enums', () => {
    it('Should generate enums as interface by default', async () => {
      const content = await plugin(
        schema,
        [],
        {},
        {
          outputFile: 'graphql.ts'
        }
      );

      expect(content).toBeSimilarStringTo(`
        export enum FoodEnum {
          Pizza = "PIZZA",
          Burger = "BURGER",
        }
      `);
    });

    it('Should generate enums as types with enumsAsTypes', async () => {
      const content = await plugin(
        schema,
        [],
        { enumsAsTypes: true },
        {
          outputFile: 'graphql.ts'
        }
      );

      expect(content).toBeSimilarStringTo(`export type FoodEnum = "PIZZA" | "BURGER";`);
    });

    it('Should generate const enums as types with constEnums', async () => {
      const content = await plugin(
        schema,
        [],
        { constEnums: true },
        {
          outputFile: 'graphql.ts'
        }
      );

      expect(content).toBeSimilarStringTo(`
        export const enum FoodEnum {
          Pizza = "PIZZA",
          Burger = "BURGER",
        }`);
    });

    it('Should generate correct enum names with interfacePrefix', async () => {
      const content = await plugin(
        schema,
        [],
        { interfacePrefix: 'Pref' },
        {
          outputFile: 'graphql.ts'
        }
      );

      expect(content).toBeSimilarStringTo(`
        export enum PrefFoodEnum {
          Pizza = "PIZZA",
          Burger = "BURGER",
        }`);
    });

    it('Should generate the correct output with custom enums value', async () => {
      const content = await plugin(
        schema,
        [],
        {
          enums: {
            FOODEnum: {
              PIZZA: 'pizza',
              BURGER: 'burger'
            }
          }
        },
        {
          outputFile: 'graphql.ts'
        }
      );

      expect(content).toBeSimilarStringTo(`
        export enum FoodEnum {
          Pizza = pizza,
          Burger = burger,
        }`);
    });

    describe('When imported', () => {
      it('Should import the default export', async () => {
        const content = await plugin(
          schema,
          [],
          {
            enums: {
              FOODEnum: 'some/path'
            }
          },
          {
            outputFile: 'graphql.ts'
          }
        );

        expect(content).toBeSimilarStringTo(`
          import FoodEnum from "some/path"
        `);
      });

      it('Should import a named export', async () => {
        const content = await plugin(
          schema,
          [],
          {
            enums: {
              FOODEnum: 'some/path#A'
            }
          },
          {
            outputFile: 'graphql.ts'
          }
        );

        expect(content).toBeSimilarStringTo(`
          import { A as FoodEnum } from "some/path"
        `);
      });

      it('Should import an aliased named export', async () => {
        const content = await plugin(
          schema,
          [],
          {
            enums: {
              FOODEnum: 'some/path#MyCustomA'
            }
          },
          {
            outputFile: 'graphql.ts'
          }
        );

        expect(content).toBeSimilarStringTo(`
          import { MyCustomA as FoodEnum } from "some/path"
        `);
      });

      it('Should import the default export with interfacePrefix', async () => {
        const content = await plugin(
          schema,
          [],
          {
            interfacePrefix: 'Pref',
            enums: {
              FOODEnum: 'some/path'
            }
          },
          {
            outputFile: 'graphql.ts'
          }
        );

        expect(content).toBeSimilarStringTo(`
          import PrefFoodEnum from "some/path"
        `);
      });

      it('Should import a named export with interfacePrefix', async () => {
        const content = await plugin(
          schema,
          [],
          {
            interfacePrefix: 'Pref',
            enums: {
              FOODEnum: 'some/path#A'
            }
          },
          {
            outputFile: 'graphql.ts'
          }
        );

        expect(content).toBeSimilarStringTo(`
          import { A as PrefFoodEnum } from "some/path"
        `);
      });

      it('Should import an aliased named export with interfacePrefix', async () => {
        const content = await plugin(
          schema,
          [],
          {
            interfacePrefix: 'Pref',
            enums: {
              FOODEnum: 'some/path#MyCustomA'
            }
          },
          {
            outputFile: 'graphql.ts'
          }
        );

        expect(content).toBeSimilarStringTo(`
          import { MyCustomA as PrefFoodEnum } from "some/path"
        `);
      });

      it('Should generate the value map with interfacePrefix', async () => {
        const content = await plugin(
          schema,
          [],
          {
            interfacePrefix: 'Pref',
            enums: {
              FOODEnum: 'some/path#MyCustomA'
            }
          },
          {
            outputFile: 'graphql.ts'
          }
        );

        expect(content).toBeSimilarStringTo(`
          export type PrefFoodEnumValueMap = {
            PIZZA: PrefFoodEnum,
            BURGER: PrefFoodEnum,
          }
        `);
      });

      it('Should skip generation of an empty definition', async () => {
        const content = await plugin(
          schema,
          [],
          {
            enums: {
              FOODEnum: null
            }
          },
          {
            outputFile: 'graphql.ts'
          }
        );

        expect(content).not.toBeSimilarStringTo(`
          import FoodEnum from
        `);

        expect(content).not.toBeSimilarStringTo(`
          import { FoodEnum 
        `);

        expect(content).not.toBeSimilarStringTo(`
          export enum FoodEnum {"
        `);

        expect(content).not.toBeSimilarStringTo(`
          export type FoodEnumValueMap {"
        `);
      });
    });

    it('Should generate the correct description for enums', async () => {
      const content = await plugin(
        buildSchema(`
      # MyEnumA
      enum FoodEnum {
        PIZZA,
        BURGER,
      }
      `),
        [],
        {},
        {
          outputFile: 'graphql.ts'
        }
      );

      expect(content).toBeSimilarStringTo(`
        /** MyEnumA */
        export enum FoodEnum {
          Pizza = "PIZZA",
          Burger = "BURGER",
        }`);
    });
  });

  describe('Input Types', () => {
    it('Should generate input type fields correctly', async () => {
      const content = await plugin(
        schema,
        [],
        {},
        {
          outputFile: 'graphql.ts'
        }
      );

      expect(content).toBeSimilarStringTo(`
        export interface T {
          f1?: Maybe<string>; 
          f2: number; 
          f3?: Maybe<(Maybe<string>)[]>; 
          f4: (Maybe<string>)[]; 
          f5: string[]; 
          f6?: Maybe<string[]>; 
          f7?: number;
        }
      `);
    });
    it('Should generate input type fields correctly when noNamespaces is true', async () => {
      const content = await plugin(
        schema,
        [],
        {
          noNamespaces: true
        },
        {
          outputFile: 'graphql.ts'
        }
      );

      expect(content).toBeSimilarStringTo(`
        export interface T {
          f1?: Maybe<string>; 
          f2: number; 
          f3?: Maybe<(Maybe<string>)[]>; 
          f4: (Maybe<string>)[]; 
          f5: string[]; 
          f6?: Maybe<string[]>; 
          f7?: number;
        }
      `);
    });

    it('Should generate input type fields correctly when immutableTypes is set', async () => {
      const content = await plugin(
        schema,
        [],
        { immutableTypes: true },
        {
          outputFile: 'graphql.ts'
        }
      );

      expect(content).toBeSimilarStringTo(`
        export interface T {
          readonly f1?: Maybe<string>; 
          readonly f2: number; 
          readonly f3?: Maybe<ReadonlyArray<Maybe<string>>>;
          readonly f4: ReadonlyArray<Maybe<string>>;
          readonly f5: ReadonlyArray<string>;
          readonly f6?: Maybe<ReadonlyArray<string>>;
          readonly f7?: number;
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
        {},
        {
          outputFile: 'graphql.ts'
        }
      );

      expect(content).toBeSimilarStringTo(`
        /** inputTypeDesc */
        export interface T {
          f: string; 
        }
      `);
    });

    it('Should the correct prefix when interfacePrefix is set', async () => {
      const content = await plugin(
        schema,
        [],
        { interfacePrefix: 'Pre' },
        {
          outputFile: 'graphql.ts'
        }
      );

      expect(content).toBeSimilarStringTo(`
      export interface PreT {
        f1?: Maybe<string>; 
        f2: number; 
        f3?:  Maybe<(Maybe<string>)[]>; 
        f4: (Maybe<string>)[]; 
        f5: string[]; 
        f6?: Maybe<string[]>; 
        f7?: number;
      }
      `);
    });

    it('Should the correct prefix when scalars is set', async () => {
      const content = await plugin(
        schema,
        [],
        { scalars: { String: 'boop' } },
        {
          outputFile: 'graphql.ts'
        }
      );

      expect(content).toBeSimilarStringTo(`
      export interface T {
        f1?: Maybe<boop>; 
        f2: number; 
        f3?: Maybe<(Maybe<boop>)[]>; 
        f4: (Maybe<boop>)[]; 
        f5: boop[]; 
        f6?: Maybe<boop[]>;
        f7?: number; 
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
        {},
        {
          outputFile: 'graphql.ts'
        }
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
        },
        {
          outputFile: 'graphql.ts'
        }
      );

      expect(content).toBeSimilarStringTo(`
      export type Date = MyCustomDate;
      `);
    });
  });
});
