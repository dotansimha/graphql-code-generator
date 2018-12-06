import 'graphql-codegen-core/dist/testing';
import { parse, visit } from 'graphql';
import { FlowDocumentsVisitor } from '../src/visitor';
import { makeExecutableSchema } from 'graphql-tools';
import { validateFlow } from './validate-flow';
import { readFileSync } from 'fs';
import { introspectionToGraphQLSchema } from 'graphql-codegen-core';

describe('Flow Documents Plugin', () => {
  const gitHuntSchema = introspectionToGraphQLSchema(
    JSON.parse(readFileSync('../../../dev-test/githunt/schema.json', 'utf-8'))
  );
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
        dummyWithType: Profile
      }

      schema {
        query: Query
      }
    `
  });

  describe('Query/Mutation/Subscription', () => {
    it('Should build a basic selection set based on basic query on GitHub schema', () => {
      const ast = parse(`
        query me($repoFullName: String!) {
          currentUser {
            login
            html_url
          }
          entry(repoFullName: $repoFullName) {
            id
            postedBy {
              login
              html_url
            }
            createdAt
          }
        }
      `);
      const result = visit(ast, {
        leave: new FlowDocumentsVisitor(gitHuntSchema, { scalars: {} })
      });

      expect(result.definitions[0]).toBeSimilarStringTo(
        `export type MeQuery = ({ currentUser: ($Pick<User, { login: *, html_url: * }>), entry: ($Pick<Entry, { id: *, createdAt: * }> & { postedBy: ($Pick<User, { login: *, html_url: * }>) }) });`
      );
      validateFlow(result.definitions[0]);
    });

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

    it('Should build a basic selection set based on basic query with field aliasing for basic scalar', () => {
      const ast = parse(`
        query dummy {
          customName: dummy
          customName2: dummyWithType {
            age
          }
        }
      `);
      const result = visit(ast, {
        leave: new FlowDocumentsVisitor(schema, { scalars: {} })
      });

      expect(result.definitions[0]).toBeSimilarStringTo(
        `export type DummyQuery = ({ customName: $ElementType<Query, 'dummy'> } & { customName2: ($Pick<Profile, { age: * }>) });`
      );
      validateFlow(result.definitions[0]);
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
