import 'graphql-codegen-core/dist/testing';
import { parse, visit, buildClientSchema } from 'graphql';
import { FlowDocumentsVisitor } from '../src/visitor';
import { makeExecutableSchema } from 'graphql-tools';
import { validateFlow } from './validate-flow';
import { readFileSync } from 'fs';

describe('Flow Operations Plugin', () => {
  const gitHuntSchema = buildClientSchema(JSON.parse(readFileSync('../../../dev-test/githunt/schema.json', 'utf-8')));
  const schema = makeExecutableSchema({
    typeDefs: `
      type User {
        id: ID!
        username: String!
        email: String!
        profile: Profile
        role: Role
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

      enum Role {
        USER
        ADMIN
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

  describe('Naming Convention & Types Prefix', () => {
    it('Should allow custom naming and point to the correct type', () => {
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
        leave: new FlowDocumentsVisitor(schema, { namingConvention: 'change-case#lowerCase' })
      });

      expect(result.definitions[0]).toBeSimilarStringTo(
        `export type notificationsquery = ({ __typename?: 'Query' } & { notifications: Array<($Pick<notifiction, { id: * }> & (({ __typename?: 'TextNotification' } & $Pick<textnotification, { text: * }>) | ({ __typename?: 'ImageNotification' } & $Pick<imagenotification, { imageUrl: * }> & { metadata: ({ __typename?: 'ImageMetadata' } & $Pick<imagemetadata, { createdBy: * }>) })))> });`
      );
      validateFlow(result.definitions[0]);
    });

    it('Should allow custom naming and point to the correct type - with custom prefix', () => {
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
        leave: new FlowDocumentsVisitor(schema, { typesPrefix: 'i', namingConvention: 'change-case#lowerCase' })
      });

      expect(result.definitions[0]).toBeSimilarStringTo(`export type inotificationsqueryvariables = {};`);
      expect(result.definitions[0]).toBeSimilarStringTo(
        `export type inotificationsquery = ({ __typename?: 'Query' } & { notifications: Array<($Pick<inotifiction, { id: * }> & (({ __typename?: 'TextNotification' } & $Pick<itextnotification, { text: * }>) | ({ __typename?: 'ImageNotification' } & $Pick<iimagenotification, { imageUrl: * }> & { metadata: ({ __typename?: 'ImageMetadata' } & $Pick<iimagemetadata, { createdBy: * }>) })))> });`
      );
      validateFlow(result.definitions[0]);
    });
  });

  describe('__typename', () => {
    it('Should skip __typename when skipTypename is set to true', () => {
      const ast = parse(`
        query {
          dummy
        }
      `);
      const result = visit(ast, {
        leave: new FlowDocumentsVisitor(schema, { skipTypename: true })
      });
      expect(result.definitions[0]).not.toContain(`__typename`);
      validateFlow(result.definitions[0]);
    });

    it('Should add __typename as non-optional when explicitly specified', () => {
      const ast = parse(`
        query {
          __typename
          dummy
        }
      `);
      const result = visit(ast, {
        leave: new FlowDocumentsVisitor(schema, {})
      });
      expect(result.definitions[0]).toBeSimilarStringTo(
        `export type Unnamed_1_Query = ({ __typename: 'Query' } & $Pick<Query, { dummy: * }>);`
      );
      validateFlow(result.definitions[0]);
    });

    it('Should add __typename as optional when its not specified', () => {
      const ast = parse(`
        query {
          dummy
        }
      `);
      const result = visit(ast, {
        leave: new FlowDocumentsVisitor(schema, {})
      });
      expect(result.definitions[0]).toBeSimilarStringTo(
        `export type Unnamed_1_Query = ({ __typename?: 'Query' } & $Pick<Query, { dummy: * }>);`
      );
      validateFlow(result.definitions[0]);
    });

    it('Should add __typename as non-optional when its explictly specified, even if skipTypename is true', () => {
      const ast = parse(`
        query {
          __typename
          dummy
        }
      `);
      const result = visit(ast, {
        leave: new FlowDocumentsVisitor(schema, { skipTypename: true })
      });
      expect(result.definitions[0]).toBeSimilarStringTo(
        `export type Unnamed_1_Query = ({ __typename: 'Query' } & $Pick<Query, { dummy: * }>);`
      );
      validateFlow(result.definitions[0]);
    });

    it('Should add __typename correctly when unions are in use', () => {
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
        leave: new FlowDocumentsVisitor(schema, {})
      });

      expect(result.definitions[0]).toBeSimilarStringTo(
        `export type UnionTestQuery = ({ __typename?: 'Query' } & { unionTest: ?(({ __typename?: 'User' } & $Pick<User, { id: * }>) | ({ __typename?: 'Profile' } & $Pick<Profile, { age: * }>)) });`
      );
      validateFlow(result.definitions[0]);
    });

    it('Should add __typename correctly when interfaces are in use', () => {
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
        leave: new FlowDocumentsVisitor(schema, {})
      });

      expect(result.definitions[0]).toBeSimilarStringTo(
        `export type NotificationsQuery = ({ __typename?: 'Query' } & { notifications: Array<($Pick<Notifiction, { id: * }> & (({ __typename?: 'TextNotification' } & $Pick<TextNotification, { text: * }>) | ({ __typename?: 'ImageNotification' } & $Pick<ImageNotification, { imageUrl: * }> & { metadata: ({ __typename?: 'ImageMetadata' } & $Pick<ImageMetadata, { createdBy: * }>) })))> });`
      );
      validateFlow(result.definitions[0]);
    });
  });

  describe('Unnamed Documents', () => {
    it('Should handle unnamed documents correctly', () => {
      const ast = parse(`
        query {
          dummy
        }
      `);
      const result = visit(ast, {
        leave: new FlowDocumentsVisitor(schema, { skipTypename: true })
      });

      expect(result.definitions[0]).toBeSimilarStringTo(`export type Unnamed_1_Query = $Pick<Query, { dummy: * }>;`);
      expect(result.definitions[0]).toBeSimilarStringTo(`export type Unnamed_1_QueryVariables = {};`);
      validateFlow(result.definitions[0]);
    });

    it('Should handle unnamed documents correctly with multiple documents', () => {
      const ast = parse(`
        query {
          dummy
        }

        query {
          dummy
        }
      `);
      const result = visit(ast, {
        leave: new FlowDocumentsVisitor(schema, { skipTypename: true })
      });

      expect(result.definitions[0]).toBeSimilarStringTo(`export type Unnamed_1_Query = $Pick<Query, { dummy: * }>;`);
      expect(result.definitions[0]).toBeSimilarStringTo(`export type Unnamed_1_QueryVariables = {};`);
      validateFlow(result.definitions[0]);
      expect(result.definitions[1]).toBeSimilarStringTo(`export type Unnamed_2_Query = $Pick<Query, { dummy: * }>;`);
      expect(result.definitions[1]).toBeSimilarStringTo(`export type Unnamed_2_QueryVariables = {};`);
      validateFlow(result.definitions[1]);
    });
  });

  describe('Selection Set', () => {
    it('Should support fragment spread correctly with simple type with no other fields', () => {
      const ast = parse(`
        fragment UserFields on User {
          id
          username
          profile {
            age
          }
          role
        }

        query me {
          me {
            ...UserFields
          }
        }
    `);
      const result = visit(ast, {
        leave: new FlowDocumentsVisitor(schema, { skipTypename: true })
      });

      expect(result.definitions[1]).toBeSimilarStringTo(`export type MeQuery = { me: ?UserFieldsFragment };`);
      validateFlow(result.definitions[0]);
      validateFlow(result.definitions[1]);
    });

    it('Should support fragment spread correctly with simple type with other fields', () => {
      const ast = parse(`
        fragment UserFields on User {
          id
          profile {
            age
          }
        }

        query me {
          me {
            ...UserFields
            username
          }
        }
    `);
      const result = visit(ast, {
        leave: new FlowDocumentsVisitor(schema, { skipTypename: true })
      });

      expect(result.definitions[1]).toBeSimilarStringTo(
        `export type MeQuery = { me: ?($Pick<User, { username: * }> & UserFieldsFragment) };`
      );
      validateFlow(result.definitions[0]);
      validateFlow(result.definitions[1]);
    });

    it('Should support fragment spread correctly with multiple fragment spread', () => {
      const ast = parse(`
        fragment UserFields on User {
          id
        }

        fragment UserProfile on User {
          profile {
            age
          }
        }

        query me {
          me {
            ...UserFields
            ...UserProfile
            username
          }
        }
    `);
      const result = visit(ast, {
        leave: new FlowDocumentsVisitor(schema, { skipTypename: true })
      });

      expect(result.definitions[2]).toBeSimilarStringTo(
        `export type MeQuery = { me: ?($Pick<User, { username: * }> & (UserFieldsFragment & UserProfileFragment)) };`
      );
      validateFlow(result.definitions[0]);
      validateFlow(result.definitions[1]);
      validateFlow(result.definitions[2]);
    });

    it('Should support interfaces correctly when used with inline fragments', () => {
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
        leave: new FlowDocumentsVisitor(schema, { skipTypename: true })
      });

      expect(result.definitions[0]).toBeSimilarStringTo(
        'export type NotificationsQuery = { notifications: Array<($Pick<Notifiction, { id: * }> & ($Pick<TextNotification, { text: * }> | ($Pick<ImageNotification, { imageUrl: * }> & { metadata: $Pick<ImageMetadata, { createdBy: * }> })))> };'
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
        leave: new FlowDocumentsVisitor(schema, { skipTypename: true })
      });

      expect(result.definitions[0]).toBeSimilarStringTo(
        `export type UnionTestQuery = { unionTest: ?($Pick<User, { id: * }> | $Pick<Profile, { age: * }>) };`
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
        leave: new FlowDocumentsVisitor(schema, { skipTypename: true })
      });

      expect(result.definitions[0]).toBeSimilarStringTo(
        `export type CurrentUserQuery = { me: ?($Pick<User, { id: * }> & (($Pick<User, { username: * }> & { profile: ?$Pick<Profile, { age: * }> }))) };`
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
        leave: new FlowDocumentsVisitor(gitHuntSchema, { skipTypename: true })
      });

      expect(result.definitions[0]).toBeSimilarStringTo(
        `export type MeQueryVariables = {
          repoFullName: string
        };`
      );
      expect(result.definitions[0]).toBeSimilarStringTo(
        `export type MeQuery = { currentUser: ?$Pick<User, { login: *, html_url: * }>, entry: ?($Pick<Entry, { id: *, createdAt: * }> & { postedBy: $Pick<User, { login: *, html_url: * }> }) };`
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
        leave: new FlowDocumentsVisitor(schema, { skipTypename: true })
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
        leave: new FlowDocumentsVisitor(schema, { skipTypename: true })
      });

      expect(result.definitions[0]).toBeSimilarStringTo(
        `export type DummyQuery = ({ customName: $ElementType<Query, 'dummy'> } & { customName2: ?$Pick<Profile, { age: * }> });`
      );
      validateFlow(result.definitions[0]);
    });

    it('Should build a basic selection set based on a query with inner fields', () => {
      const ast = parse(`
        query currentUser {
          me {
            id
            username
            role
            profile {
              age
            }
          }
        }
      `);
      const result = visit(ast, {
        leave: new FlowDocumentsVisitor(schema, { skipTypename: true })
      });

      expect(result.definitions[0]).toBeSimilarStringTo(
        `export type CurrentUserQuery = { me: ?($Pick<User, { id: *, username: *, role: * }> & { profile: ?$Pick<Profile, { age: * }> }) };`
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
        leave: new FlowDocumentsVisitor(schema, { skipTypename: true })
      });

      expect(result.definitions[0]).toBeSimilarStringTo(
        `export type UserFieldsFragment = ($Pick<User, { id: *, username: * }> & { profile: ?$Pick<Profile, { age: * }> });`
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
        leave: new FlowDocumentsVisitor(schema, { skipTypename: true })
      });

      expect(result.definitions[0]).toBeSimilarStringTo(
        `export type LoginMutation = { login: ?($Pick<User, { id: *, username: * }> & { profile: ?$Pick<Profile, { age: * }> }) };`
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
        leave: new FlowDocumentsVisitor(schema, { skipTypename: true })
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
        leave: new FlowDocumentsVisitor(schema, { skipTypename: true })
      });

      expect(result.definitions[0]).toBeSimilarStringTo(
        `export type TestSubscription = { userCreated: ?$Pick<User, { id: * }> };`
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
        leave: new FlowDocumentsVisitor(schema, { skipTypename: true })
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
        leave: new FlowDocumentsVisitor(schema, { skipTypename: true })
      });

      expect(result.definitions[0]).toBeSimilarStringTo(`export type TestQueryQueryVariables = {};`);
      validateFlow(result.definitions[0]);
    });
  });

  describe('Output options', () => {
    it('Should respect flow option useFlowExactObjects', () => {
      const ast = parse(`
        query currentUser {
          me {
            id
            username
            role
            profile {
              age
            }
          }
        }
      `);
      const result = visit(ast, {
        leave: new FlowDocumentsVisitor(schema, {
          skipTypename: true,
          useFlowExactObjects: true
        })
      });

      expect(result.definitions[0]).toBeSimilarStringTo(
        `export type CurrentUserQuery = {| me: ?($Pick<User, {| id: *, username: *, role: * |}> & {| profile: ?$Pick<Profile, {| age: * |}> |}) |};`
      );

      validateFlow(result.definitions[0]);
    });

    it('Should respect flow option useFlowReadOnlyTypes', () => {
      const ast = parse(`
        query currentUser {
          me {
            id
            username
            role
            profile {
              age
            }
          }
        }
      `);
      const result = visit(ast, {
        leave: new FlowDocumentsVisitor(schema, {
          skipTypename: true,
          useFlowReadOnlyTypes: true
        })
      });

      expect(result.definitions[0]).toBeSimilarStringTo(
        `export type CurrentUserQuery = { +me: ?($Pick<User, { +id: *, +username: *, +role: * }> & { +profile: ?$Pick<Profile, { +age: * }> }) };`
      );

      validateFlow(result.definitions[0]);
    });
  });
});
