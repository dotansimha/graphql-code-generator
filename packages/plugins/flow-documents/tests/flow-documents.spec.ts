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

      type Mutation {
        login(username: String!, password: String!): User
      }

      type Subscription {
        userCreated: User
      }

      interface Notifiction {
        id: ID!
      }

      type TextNotification implements Notifiction {
        id: ID!
        text: String!
      }

      type ImageNotification implements Notifiction {
        id: ID!
        imageUrl: String!
        metadata: ImageMetadata!
      }

      type ImageMetadata {
        createdBy: String!
      }

      union MyUnion = User | Profile

      type Query {
        me: User
        unionTest: MyUnion
        notifications: [Notifiction!]!
        dummy: String
        dummyNonNull: String!
        dummyArray: [String]
        dummyNonNullArray: [String]!
        dummyNonNullArrayWithValues: [String!]!
        dummyWithType: Profile
      }

      schema {
        query: Query
        mutation: Mutation
        subscription: Subscription
      }
    `
  });

  describe('Selection Set', () => {
    it('Should support intefaces correctly when used with inline fragments', () => {
      const ast = parse(`
      query notifications {
        notifications {
          id

          ... on TextNotification {
            text
          }

          ... on ImageNotification {
            imageUrl
            metadata {
              createdBy
            }
          }
        }
      }
    `);
      const result = visit(ast, {
        leave: new FlowDocumentsVisitor(schema, { scalars: {} })
      });

      expect(result.definitions[0]).toBeSimilarStringTo(
        `export type NotificationsQuery = { notifications: ($Pick<Notifiction, { id: * }> & ($Pick<TextNotification, { text: * }> | ($Pick<ImageNotification, { imageUrl: * }> & { metadata: $Pick<ImageMetadata, { createdBy: * }> }))) };`
      );
      validateFlow(result.definitions[0]);
    });

    it('Should support union correctly when used with inline fragments', () => {
      const ast = parse(`
        query unionTest {
          unionTest {
            ... on User {
              id
            }

            ... on Profile {
              age
            }
          }
        }
    `);
      const result = visit(ast, {
        leave: new FlowDocumentsVisitor(schema, { scalars: {} })
      });

      expect(result.definitions[0]).toBeSimilarStringTo(
        `export type UnionTestQuery = { unionTest: ($Pick<User, { id: * }> | $Pick<Profile, { age: * }>) };`
      );
      validateFlow(result.definitions[0]);
    });

    it('Should support inline fragments', () => {
      const ast = parse(`
        query currentUser {
          me {
            id
            ... on User {
              username
              profile {
                age
              }
            }
          }
        }
    `);
      const result = visit(ast, {
        leave: new FlowDocumentsVisitor(schema, { scalars: {} })
      });

      expect(result.definitions[0]).toBeSimilarStringTo(
        `export type CurrentUserQuery = { me: ($Pick<User, { id: * }> & (($Pick<User, { username: * }> & { profile: $Pick<Profile, { age: * }> }))) };`
      );
      validateFlow(result.definitions[0]);
    });

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
        `export type MeQueryVariables = {
          repoFullName: string
        };`
      );
      expect(result.definitions[0]).toBeSimilarStringTo(
        `export type MeQuery = { currentUser: $Pick<User, { login: *, html_url: * }>, entry: ($Pick<Entry, { id: *, createdAt: * }> & { postedBy: $Pick<User, { login: *, html_url: * }> }) };`
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

      expect(result.definitions[0]).toBeSimilarStringTo(`export type DummyQuery = $Pick<Query, { dummy: * }>;`);
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
        `export type DummyQuery = ({ customName: $ElementType<Query, 'dummy'> } & { customName2: $Pick<Profile, { age: * }> });`
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
        `export type CurrentUserQuery = { me: ($Pick<User, { id: *, username: * }> & { profile: $Pick<Profile, { age: * }> }) };`
      );

      validateFlow(result.definitions[0]);
    });
  });

  describe('Fragment Definition', () => {
    it('Should build fragment definition correctly - with name and selection set', () => {
      const ast = parse(`
        fragment UserFields on User {
          id
          username
          profile {
            age
          }
        }
      `);
      const result = visit(ast, {
        leave: new FlowDocumentsVisitor(schema, { scalars: {} })
      });

      expect(result.definitions[0]).toBeSimilarStringTo(
        `export type UserFieldsFragment = ($Pick<User, { id: *, username: * }> & { profile: $Pick<Profile, { age: * }> });`
      );
      validateFlow(result.definitions[0]);
    });
  });

  describe('Operation Definition', () => {
    it('Should detect Mutation correctly', () => {
      const ast = parse(`
        mutation login {
          login(username: "1", password: "2") {
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
        `export type LoginMutation = { login: ($Pick<User, { id: *, username: * }> & { profile: $Pick<Profile, { age: * }> }) };`
      );
      validateFlow(result.definitions[0]);
    });

    it('Should detect Query correctly', () => {
      const ast = parse(`
        query test {
          dummy
        }
      `);
      const result = visit(ast, {
        leave: new FlowDocumentsVisitor(schema, { scalars: {} })
      });

      expect(result.definitions[0]).toBeSimilarStringTo(`export type TestQuery = $Pick<Query, { dummy: * }>;`);
      validateFlow(result.definitions[0]);
    });

    it('Should detect Subscription correctly', () => {
      const ast = parse(`
        subscription test {
          userCreated {
            id
          }
        }
      `);
      const result = visit(ast, {
        leave: new FlowDocumentsVisitor(schema, { scalars: {} })
      });

      expect(result.definitions[0]).toBeSimilarStringTo(
        `export type TestSubscription = { userCreated: $Pick<User, { id: * }> };`
      );
      validateFlow(result.definitions[0]);
    });

    it('Should handle operation variables correctly', () => {
      const ast = parse(`
        query testQuery($username: String, $email: String, $password: String!, $input: InputType, $mandatoryInput: InputType!, $testArray: [String], $requireString: [String]!, $innerRequired: [String!]!) {
          dummy
        }
      `);
      const result = visit(ast, {
        leave: new FlowDocumentsVisitor(schema, { scalars: {} })
      });

      expect(result.definitions[0]).toBeSimilarStringTo(
        `export type TestQueryQueryVariables = {
          username?: ?string,
          email?: ?string,
          password: string,
          input?: ?InputType,
          mandatoryInput: InputType,
          testArray?: ?Array<?string>,
          requireString: Array<?string>,
          innerRequired: Array<string>
        };`
      );
      validateFlow(result.definitions[0]);
    });

    it('Should create empty variables when there are no operation variables', () => {
      const ast = parse(`
        query testQuery {
          dummy
        }
      `);
      const result = visit(ast, {
        leave: new FlowDocumentsVisitor(schema, { scalars: {} })
      });

      expect(result.definitions[0]).toBeSimilarStringTo(`export type TestQueryQueryVariables = {};`);
      validateFlow(result.definitions[0]);
    });
  });
});
