import 'graphql-codegen-testing';
import { parse, visit, buildClientSchema, buildSchema } from 'graphql';
import { plugin } from '../src/index';
import { validateFlow } from '../../flow/tests/validate-flow';
import { readFileSync } from 'fs';

describe('Flow Operations Plugin', () => {
  const gitHuntSchema = buildClientSchema(JSON.parse(readFileSync('../../../dev-test/githunt/schema.json', 'utf-8')));
  const schema = buildSchema(/* GraphQL */ `
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
  `);

  describe('Naming Convention & Types Prefix', () => {
    it('Should allow custom naming and point to the correct type', async () => {
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
      const result = await plugin(
        schema,
        [
          {
            filePath: '',
            content: ast
          }
        ],
        { namingConvention: 'change-case#lowerCase' },
        { outputFile: '' }
      );

      expect(result).toBeSimilarStringTo(
        `export type notificationsquery = ({ __typename?: 'Query' } & { notifications: Array<($Pick<notifiction, { id: * }> & (({ __typename?: 'TextNotification' } & $Pick<textnotification, { text: * }>) | ({ __typename?: 'ImageNotification' } & $Pick<imagenotification, { imageUrl: * }> & { metadata: ({ __typename?: 'ImageMetadata' } & $Pick<imagemetadata, { createdBy: * }>) })))> });`
      );
      validateFlow(result);
    });

    it('Should allow custom naming and point to the correct type - with custom prefix', async () => {
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
      const result = await plugin(
        schema,
        [
          {
            filePath: '',
            content: ast
          }
        ],
        { typesPrefix: 'i', namingConvention: 'change-case#lowerCase' },
        { outputFile: '' }
      );

      expect(result).toBeSimilarStringTo(`export type inotificationsqueryvariables = {};`);
      expect(result).toBeSimilarStringTo(
        `export type inotificationsquery = ({ __typename?: 'Query' } & { notifications: Array<($Pick<inotifiction, { id: * }> & (({ __typename?: 'TextNotification' } & $Pick<itextnotification, { text: * }>) | ({ __typename?: 'ImageNotification' } & $Pick<iimagenotification, { imageUrl: * }> & { metadata: ({ __typename?: 'ImageMetadata' } & $Pick<iimagemetadata, { createdBy: * }>) })))> });`
      );
      validateFlow(result);
    });
  });

  describe('__typename', () => {
    it('Should skip __typename when skipTypename is set to true', async () => {
      const ast = parse(`
        query {
          dummy
        }
      `);
      const result = await plugin(
        schema,
        [
          {
            filePath: '',
            content: ast
          }
        ],
        { skipTypename: true },
        { outputFile: '' }
      );
      expect(result).not.toContain(`__typename`);
      validateFlow(result);
    });

    it('Should add __typename as non-optional when explicitly specified', async () => {
      const ast = parse(`
        query {
          __typename
          dummy
        }
      `);
      const result = await plugin(
        schema,
        [
          {
            filePath: '',
            content: ast
          }
        ],
        {},
        { outputFile: '' }
      );
      expect(result).toBeSimilarStringTo(
        `export type Unnamed_1_Query = ({ __typename: 'Query' } & $Pick<Query, { dummy: * }>);`
      );
      validateFlow(result);
    });

    it('Should add __typename as optional when its not specified', async () => {
      const ast = parse(`
        query {
          dummy
        }
      `);
      const result = await plugin(
        schema,
        [
          {
            filePath: '',
            content: ast
          }
        ],
        {},
        { outputFile: '' }
      );
      expect(result).toBeSimilarStringTo(
        `export type Unnamed_1_Query = ({ __typename?: 'Query' } & $Pick<Query, { dummy: * }>);`
      );
      validateFlow(result);
    });

    it('Should add __typename as non-optional when its explictly specified, even if skipTypename is true', async () => {
      const ast = parse(`
        query {
          __typename
          dummy
        }
      `);
      const result = await plugin(
        schema,
        [
          {
            filePath: '',
            content: ast
          }
        ],
        { skipTypename: true },
        { outputFile: '' }
      );
      expect(result).toBeSimilarStringTo(
        `export type Unnamed_1_Query = ({ __typename: 'Query' } & $Pick<Query, { dummy: * }>);`
      );
      validateFlow(result);
    });

    it('Should add __typename correctly when unions are in use', async () => {
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
      const result = await plugin(
        schema,
        [
          {
            filePath: '',
            content: ast
          }
        ],
        {},
        { outputFile: '' }
      );

      expect(result).toBeSimilarStringTo(
        `export type UnionTestQuery = ({ __typename?: 'Query' } & { unionTest: ?(({ __typename?: 'User' } & $Pick<User, { id: * }>) | ({ __typename?: 'Profile' } & $Pick<Profile, { age: * }>)) });`
      );
      validateFlow(result);
    });

    it('Should add __typename correctly when interfaces are in use', async () => {
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
      const result = await plugin(
        schema,
        [
          {
            filePath: '',
            content: ast
          }
        ],
        {},
        { outputFile: '' }
      );
      expect(result).toBeSimilarStringTo(
        `export type NotificationsQuery = ({ __typename?: 'Query' } & { notifications: Array<($Pick<Notifiction, { id: * }> & (({ __typename?: 'TextNotification' } & $Pick<TextNotification, { text: * }>) | ({ __typename?: 'ImageNotification' } & $Pick<ImageNotification, { imageUrl: * }> & { metadata: ({ __typename?: 'ImageMetadata' } & $Pick<ImageMetadata, { createdBy: * }>) })))> });`
      );
      validateFlow(result);
    });
  });

  describe('Unnamed Documents', () => {
    it('Should handle unnamed documents correctly', async () => {
      const ast = parse(`
        query {
          dummy
        }
      `);
      const result = await plugin(
        schema,
        [
          {
            filePath: '',
            content: ast
          }
        ],
        { skipTypename: true },
        { outputFile: '' }
      );

      expect(result).toBeSimilarStringTo(`export type Unnamed_1_Query = $Pick<Query, { dummy: * }>;`);
      expect(result).toBeSimilarStringTo(`export type Unnamed_1_QueryVariables = {};`);
      validateFlow(result);
    });

    it('Should handle unnamed documents correctly with multiple documents', async () => {
      const ast = parse(`
        query {
          dummy
        }

        query {
          dummy
        }
      `);
      const result = await plugin(
        schema,
        [
          {
            filePath: '',
            content: ast
          }
        ],
        { skipTypename: true },
        { outputFile: '' }
      );
      expect(result).toBeSimilarStringTo(`export type Unnamed_1_Query = $Pick<Query, { dummy: * }>;`);
      expect(result).toBeSimilarStringTo(`export type Unnamed_1_QueryVariables = {};`);
      expect(result).toBeSimilarStringTo(`export type Unnamed_2_Query = $Pick<Query, { dummy: * }>;`);
      expect(result).toBeSimilarStringTo(`export type Unnamed_2_QueryVariables = {};`);
      validateFlow(result);
    });
  });

  describe('Selection Set', () => {
    it('Should support fragment spread correctly with simple type with no other fields', async () => {
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
      const result = await plugin(
        schema,
        [
          {
            filePath: '',
            content: ast
          }
        ],
        { skipTypename: true },
        { outputFile: '' }
      );

      expect(result).toBeSimilarStringTo(`export type MeQuery = { me: ?UserFieldsFragment };`);
      validateFlow(result);
    });

    it('Should support fragment spread correctly with simple type with other fields', async () => {
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
      const result = await plugin(
        schema,
        [
          {
            filePath: '',
            content: ast
          }
        ],
        { skipTypename: true },
        { outputFile: '' }
      );

      expect(result).toBeSimilarStringTo(
        `export type MeQuery = { me: ?($Pick<User, { username: * }> & UserFieldsFragment) };`
      );
      validateFlow(result);
    });

    it('Should support fragment spread correctly with multiple fragment spread', async () => {
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
      const result = await plugin(
        schema,
        [
          {
            filePath: '',
            content: ast
          }
        ],
        { skipTypename: true },
        { outputFile: '' }
      );

      expect(result).toBeSimilarStringTo(
        `export type MeQuery = { me: ?($Pick<User, { username: * }> & (UserFieldsFragment & UserProfileFragment)) };`
      );
      validateFlow(result);
    });

    it('Should support interfaces correctly when used with inline fragments', async () => {
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
      const result = await plugin(
        schema,
        [
          {
            filePath: '',
            content: ast
          }
        ],
        { skipTypename: true },
        { outputFile: '' }
      );

      expect(result).toBeSimilarStringTo(
        'export type NotificationsQuery = { notifications: Array<($Pick<Notifiction, { id: * }> & ($Pick<TextNotification, { text: * }> | ($Pick<ImageNotification, { imageUrl: * }> & { metadata: $Pick<ImageMetadata, { createdBy: * }> })))> };'
      );
      validateFlow(result);
    });

    it('Should support union correctly when used with inline fragments', async () => {
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
      const result = await plugin(
        schema,
        [
          {
            filePath: '',
            content: ast
          }
        ],
        { skipTypename: true },
        { outputFile: '' }
      );

      expect(result).toBeSimilarStringTo(
        `export type UnionTestQuery = { unionTest: ?($Pick<User, { id: * }> | $Pick<Profile, { age: * }>) };`
      );
      validateFlow(result);
    });

    it('Should support inline fragments', async () => {
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
      const result = await plugin(
        schema,
        [
          {
            filePath: '',
            content: ast
          }
        ],
        { skipTypename: true },
        { outputFile: '' }
      );

      expect(result).toBeSimilarStringTo(
        `export type CurrentUserQuery = { me: ?($Pick<User, { id: * }> & (($Pick<User, { username: * }> & { profile: ?$Pick<Profile, { age: * }> }))) };`
      );
      validateFlow(result);
    });

    it('Should build a basic selection set based on basic query on GitHub schema', async () => {
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
      const result = await plugin(
        gitHuntSchema,
        [
          {
            filePath: '',
            content: ast
          }
        ],
        { skipTypename: true },
        { outputFile: '' }
      );
      expect(result).toBeSimilarStringTo(
        `export type MeQueryVariables = {
          repoFullName: $ElementType<Scalars, 'String'>
        };`
      );
      expect(result).toBeSimilarStringTo(
        `export type MeQuery = { currentUser: ?$Pick<User, { login: *, html_url: * }>, entry: ?($Pick<Entry, { id: *, createdAt: * }> & { postedBy: $Pick<User, { login: *, html_url: * }> }) };`
      );
      validateFlow(result);
    });

    it('Should build a basic selection set based on basic query', async () => {
      const ast = parse(`
        query dummy {
          dummy
        }
      `);
      const result = await plugin(
        schema,
        [
          {
            filePath: '',
            content: ast
          }
        ],
        { skipTypename: true },
        { outputFile: '' }
      );
      expect(result).toBeSimilarStringTo(`export type DummyQuery = $Pick<Query, { dummy: * }>;`);
      validateFlow(result);
    });

    it('Should build a basic selection set based on basic query with field aliasing for basic scalar', async () => {
      const ast = parse(`
        query dummy {
          customName: dummy
          customName2: dummyWithType {
            age
          }
        }
      `);
      const result = await plugin(
        schema,
        [
          {
            filePath: '',
            content: ast
          }
        ],
        { skipTypename: true },
        { outputFile: '' }
      );

      expect(result).toBeSimilarStringTo(
        `export type DummyQuery = ({ customName: $ElementType<Query, 'dummy'> } & { customName2: ?$Pick<Profile, { age: * }> });`
      );
      validateFlow(result);
    });

    it('Should build a basic selection set based on a query with inner fields', async () => {
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
      const result = await plugin(
        schema,
        [
          {
            filePath: '',
            content: ast
          }
        ],
        { skipTypename: true },
        { outputFile: '' }
      );

      expect(result).toBeSimilarStringTo(
        `export type CurrentUserQuery = { me: ?($Pick<User, { id: *, username: *, role: * }> & { profile: ?$Pick<Profile, { age: * }> }) };`
      );

      validateFlow(result);
    });
  });

  describe('Fragment Definition', () => {
    it('Should build fragment definition correctly - with name and selection set', async () => {
      const ast = parse(`
        fragment UserFields on User {
          id
          username
          profile {
            age
          }
        }
      `);
      const result = await plugin(
        schema,
        [
          {
            filePath: '',
            content: ast
          }
        ],
        { skipTypename: true },
        { outputFile: '' }
      );

      expect(result).toBeSimilarStringTo(
        `export type UserFieldsFragment = ($Pick<User, { id: *, username: * }> & { profile: ?$Pick<Profile, { age: * }> });`
      );
      validateFlow(result);
    });
  });

  describe('Operation Definition', () => {
    it('Should detect Mutation correctly', async () => {
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
      const result = await plugin(
        schema,
        [
          {
            filePath: '',
            content: ast
          }
        ],
        { skipTypename: true },
        { outputFile: '' }
      );

      expect(result).toBeSimilarStringTo(
        `export type LoginMutation = { login: ?($Pick<User, { id: *, username: * }> & { profile: ?$Pick<Profile, { age: * }> }) };`
      );
      validateFlow(result);
    });

    it('Should detect Query correctly', async () => {
      const ast = parse(`
        query test {
          dummy
        }
      `);
      const result = await plugin(
        schema,
        [
          {
            filePath: '',
            content: ast
          }
        ],
        { skipTypename: true },
        { outputFile: '' }
      );

      expect(result).toBeSimilarStringTo(`export type TestQuery = $Pick<Query, { dummy: * }>;`);
      validateFlow(result);
    });

    it('Should detect Subscription correctly', async () => {
      const ast = parse(`
        subscription test {
          userCreated {
            id
          }
        }
      `);
      const result = await plugin(
        schema,
        [
          {
            filePath: '',
            content: ast
          }
        ],
        { skipTypename: true },
        { outputFile: '' }
      );
      expect(result).toBeSimilarStringTo(`export type TestSubscription = { userCreated: ?$Pick<User, { id: * }> };`);
      validateFlow(result);
    });

    it('Should handle operation variables correctly', async () => {
      const ast = parse(`
        query testQuery($username: String, $email: String, $password: String!, $input: InputType, $mandatoryInput: InputType!, $testArray: [String], $requireString: [String]!, $innerRequired: [String!]!) {
          dummy
        }
      `);
      const result = await plugin(
        schema,
        [
          {
            filePath: '',
            content: ast
          }
        ],
        { skipTypename: true },
        { outputFile: '' }
      );

      expect(result).toBeSimilarStringTo(
        `export type TestQueryQueryVariables = {
          username?: ?$ElementType<Scalars, 'String'>,
          email?: ?$ElementType<Scalars, 'String'>,
          password: $ElementType<Scalars, 'String'>,
          input?: ?InputType,
          mandatoryInput: InputType,
          testArray?: ?Array<?$ElementType<Scalars, 'String'>>,
          requireString: Array<?$ElementType<Scalars, 'String'>>,
          innerRequired: Array<$ElementType<Scalars, 'String'>>
        };`
      );
      validateFlow(result);
    });

    it('Should create empty variables when there are no operation variables', async () => {
      const ast = parse(`
        query testQuery {
          dummy
        }
      `);
      const result = await plugin(
        schema,
        [
          {
            filePath: '',
            content: ast
          }
        ],
        { skipTypename: true },
        { outputFile: '' }
      );

      expect(result).toBeSimilarStringTo(`export type TestQueryQueryVariables = {};`);
      validateFlow(result);
    });
  });

  describe('Output options', () => {
    it('Should respect flow option useFlowExactObjects', async () => {
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
      const result = await plugin(
        schema,
        [
          {
            filePath: '',
            content: ast
          }
        ],
        { skipTypename: true, useFlowExactObjects: true },
        { outputFile: '' }
      );

      expect(result).toBeSimilarStringTo(
        `export type CurrentUserQuery = {| me: ?($Pick<User, {| id: *, username: *, role: * |}> & {| profile: ?$Pick<Profile, {| age: * |}> |}) |};`
      );

      validateFlow(result);
    });

    it('Should respect flow option useFlowReadOnlyTypes', async () => {
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
      const result = await plugin(
        schema,
        [
          {
            filePath: '',
            content: ast
          }
        ],
        { skipTypename: true, useFlowReadOnlyTypes: true },
        { outputFile: '' }
      );
      expect(result).toBeSimilarStringTo(
        `export type CurrentUserQuery = { +me: ?($Pick<User, { +id: *, +username: *, +role: * }> & { +profile: ?$Pick<Profile, { +age: * }> }) };`
      );

      validateFlow(result);
    });
  });
});
