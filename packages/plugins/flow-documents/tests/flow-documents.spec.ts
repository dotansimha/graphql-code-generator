import 'graphql-codegen-core/dist/testing';
import { parse, visit } from 'graphql';
import { FlowDocumentsVisitor } from '../src/visitor';
import { makeExecutableSchema } from 'graphql-tools';
import { validateFlow } from './validate-flow';

describe('Flow Documents Plugin', () => {
  const schema = makeExecutableSchema({
    typeDefs: `
      type User {
        id: ID!
        username: String!
        email: String!
        profile: Profile
      }

      type Profile {
        age: Int
        firstName: String!
      }

      type Query {
        me: User
        dummy: String
        dummyNonNull: String!
        dummyArray: [String]
        dummyNonNullArray: [String]!
        dummyNonNullArrayWithValues: [String!]!
      }

      schema {
        query: Query
      }
    `
  });

  describe('Query/Mutation/Subscription', () => {
    it('Should build a basic selection set based on basic query', () => {
      const ast = parse(`
        query dummy {
          dummy
        }
      `);
      const result = visit(ast, {
        leave: new FlowDocumentsVisitor(schema, { scalars: {} })
      });

      expect(result.definitions[0]).toBeSimilarStringTo(`export type DummyQuery = ($Pick<Query, { dummy: * }>);`);

      validateFlow(result.definitions[0]);
    });

    it.only('Should build a basic selection set based on basic query - including array and non-null', () => {
      const ast = parse(`
        query dummyTest {
          dummy
          dummyNonNull
          dummyArray
          dummyNonNullArray
          dummyNonNullArrayWithValues
        }
      `);
      const result = visit(ast, {
        leave: new FlowDocumentsVisitor(schema, { scalars: {} })
      });

      // console.log(result.definitions[0]);

      // expect(result.definitions[0]).toBeSimilarStringTo(`export type DummyQuery = ($Pick<Query, { dummy: * }>);`);

      // validateFlow(result.definitions[0]);
    });

    it('Should build a basic selection set based on a query with inner fields', () => {
      const ast = parse(`
        query currentUser {
          me {
            id
            username
            profile {
              age
            }
          }
        }
      `);
      const result = visit(ast, {
        leave: new FlowDocumentsVisitor(schema, { scalars: {} })
      });

      expect(result.definitions[0]).toBeSimilarStringTo(
        `export type CurrentUserQuery = ({ me: ($Pick<User, { id: *, username: * }> & { profile: ($Pick<Profile, { age: * }>) }) });`
      );

      validateFlow(result.definitions[0]);
    });
  });
});
