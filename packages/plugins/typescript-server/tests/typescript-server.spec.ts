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

    type Query {
      fieldTest: String 
    }

    type Immut {
      fieldTest: String 
      fieldTestMandatory: String!
      arrayTest1: [String]
      arrayTest2: [String]!
      arrayTest3: [String!]!
      arrayTest4: [String!]
    }
  `);

  describe('Config', () => {
    it('Should wrap with namepsace when schemaNamespace is specified', async () => {
      const content = await plugin(schema, [], { schemaNamespace: 'Models' });

      expect(content).toContain(`export namespace Models {`);
    });
  });

  describe('Types', () => {
    it('Should handle immutable type correctly', async () => {
      const content = await plugin(schema, [], { immutableTypes: true });

      expect(content).toBeSimilarStringTo(`
        export interface Bar {
          readonly qux?: string | null;
        }
      `);

      expect(content).toBeSimilarStringTo(`
        export interface Immut {
          readonly fieldTest?: string | null;
          readonly fieldTestMandatory: string;
          readonly arrayTest1?: ReadonlyArray<string | null> | null; 
          readonly arrayTest2: ReadonlyArray<string | null>; 
          readonly arrayTest3: ReadonlyArray<string>; 
          readonly arrayTest4?: ReadonlyArray<string> | null; 
        }
      `);
    });
  });
});
