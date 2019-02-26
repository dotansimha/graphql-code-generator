import 'graphql-codegen-core/dist/testing';
import { parse, buildClientSchema } from 'graphql';
import { makeExecutableSchema } from 'graphql-tools';
import { readFileSync } from 'fs';
import { plugin } from '../src/index';
import { validateTs } from '../../typescript/tests/validate';
import { plugin as tsPlugin } from '../../typescript/src/index';

describe('TypeScript Documents Plugin', async () => {
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

  const validate = async (content: string, config: any = {}) =>
    validateTs((await tsPlugin(schema, [], config, { outputFile: '' })) + '\n' + content);

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
      const config = { namingConvention: 'change-case#lowerCase' };
      const result = await plugin(schema, [{ filePath: 'test-file.ts', content: ast }], config, { outputFile: '' });

      expect(result).toBeSimilarStringTo(
        `export type notificationsquery = ({ __typename?: 'Query' } & { notifications: Array<(Pick<notifiction, 'id'> & (({ __typename?: 'TextNotification' } & Pick<textnotification, 'text'>) | ({ __typename?: 'ImageNotification' } & Pick<imagenotification, 'imageUrl'> & { metadata: ({ __typename?: 'ImageMetadata' } & Pick<imagemetadata, 'createdBy'>) })))> });`
      );
      await validate(result, config);
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

      const config = { typesPrefix: 'i', namingConvention: 'change-case#lowerCase' };
      const result = await plugin(schema, [{ filePath: 'test-file.ts', content: ast }], config, { outputFile: '' });

      expect(result).toBeSimilarStringTo(`export type iinotificationsqueryvariables = {};`);
      expect(result).toBeSimilarStringTo(
        `export type iinotificationsquery = ({ __typename?: 'Query' } & { notifications: Array<(Pick<inotifiction, 'id'> & (({ __typename?: 'TextNotification' } & Pick<itextnotification, 'text'>) | ({ __typename?: 'ImageNotification' } & Pick<iimagenotification, 'imageUrl'> & { metadata: ({ __typename?: 'ImageMetadata' } & Pick<iimagemetadata, 'createdBy'>) })))> });`
      );
      validate(result, config);
    });
  });

  describe('__typename', () => {
    it('Should skip __typename when skipTypename is set to true', async () => {
      const ast = parse(`
        query {
          dummy
        }
      `);
      const config = { skipTypename: true };
      const result = await plugin(schema, [{ filePath: 'test-file.ts', content: ast }], config, { outputFile: '' });

      expect(result).not.toContain(`__typename`);
      validate(result, config);
    });

    it('Should add __typename as non-optional when explicitly specified', async () => {
      const ast = parse(`
        query {
          __typename
          dummy
        }
      `);
      const config = {};
      const result = await plugin(schema, [{ filePath: 'test-file.ts', content: ast }], config, { outputFile: '' });
      expect(result).toBeSimilarStringTo(
        `export type Unnamed_1_Query = ({ __typename: 'Query' } & Pick<Query, 'dummy'>);`
      );
      validate(result, config);
    });

    it('Should add __typename as optional when its not specified', async () => {
      const ast = parse(`
        query {
          dummy
        }
      `);
      const config = {};
      const result = await plugin(schema, [{ filePath: 'test-file.ts', content: ast }], config, { outputFile: '' });
      expect(result).toBeSimilarStringTo(
        `export type Unnamed_1_Query = ({ __typename?: 'Query' } & Pick<Query, 'dummy'>);`
      );
      validate(result, config);
    });

    it('Should add __typename as non-optional when its explictly specified, even if skipTypename is true', async () => {
      const ast = parse(`
        query {
          __typename
          dummy
        }
      `);
      const config = { skipTypename: true };
      const result = await plugin(schema, [{ filePath: 'test-file.ts', content: ast }], config, { outputFile: '' });

      expect(result).toBeSimilarStringTo(
        `export type Unnamed_1_Query = ({ __typename: 'Query' } & Pick<Query, 'dummy'>);`
      );
      validate(result, config);
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
      const config = {};
      const result = await plugin(schema, [{ filePath: 'test-file.ts', content: ast }], config, { outputFile: '' });
      expect(result).toBeSimilarStringTo(
        `export type UnionTestQuery = ({ __typename?: 'Query' } & { unionTest: Maybe<(({ __typename?: 'User' } & Pick<User, 'id'>) | ({ __typename?: 'Profile' } & Pick<Profile, 'age'>))> });`
      );
      validate(result, config);
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
      const config = {};
      const result = await plugin(schema, [{ filePath: 'test-file.ts', content: ast }], config, { outputFile: '' });
      expect(result).toBeSimilarStringTo(
        `export type NotificationsQuery = ({ __typename?: 'Query' } & { notifications: Array<(Pick<Notifiction, 'id'> & (({ __typename?: 'TextNotification' } & Pick<TextNotification, 'text'>) | ({ __typename?: 'ImageNotification' } & Pick<ImageNotification, 'imageUrl'> & { metadata: ({ __typename?: 'ImageMetadata' } & Pick<ImageMetadata, 'createdBy'>) })))> });`
      );
      validate(result, config);
    });
  });

  describe('Unnamed Documents', () => {
    it('Should handle unnamed documents correctly', async () => {
      const ast = parse(`
        query {
          dummy
        }
      `);
      const config = { skipTypename: true };
      const result = await plugin(schema, [{ filePath: 'test-file.ts', content: ast }], config, { outputFile: '' });
      expect(result).toBeSimilarStringTo(`export type Unnamed_1_Query = Pick<Query, 'dummy'>;`);
      expect(result).toBeSimilarStringTo(`export type Unnamed_1_QueryVariables = {};`);
      validate(result, config);
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
      const config = { skipTypename: true };
      const result = await plugin(schema, [{ filePath: 'test-file.ts', content: ast }], config, { outputFile: '' });

      expect(result).toBeSimilarStringTo(`export type Unnamed_1_Query = Pick<Query, 'dummy'>;`);
      expect(result).toBeSimilarStringTo(`export type Unnamed_1_QueryVariables = {};`);
      expect(result).toBeSimilarStringTo(`export type Unnamed_2_Query = Pick<Query, 'dummy'>;`);
      expect(result).toBeSimilarStringTo(`export type Unnamed_2_QueryVariables = {};`);
      validate(result, config);
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
      const config = { skipTypename: true };
      const result = await plugin(schema, [{ filePath: 'test-file.ts', content: ast }], config, { outputFile: '' });
      expect(result).toBeSimilarStringTo(`export type MeQuery = { me: Maybe<UserFieldsFragment> };`);
      validate(result, config);
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
      const config = { skipTypename: true };
      const result = await plugin(schema, [{ filePath: 'test-file.ts', content: ast }], config, { outputFile: '' });

      expect(result).toBeSimilarStringTo(
        `export type MeQuery = { me: Maybe<(Pick<User, 'username'> & UserFieldsFragment)> };`
      );
      validate(result, config);
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
      const config = { skipTypename: true };
      const result = await plugin(schema, [{ filePath: 'test-file.ts', content: ast }], config, { outputFile: '' });

      expect(result).toBeSimilarStringTo(
        `export type MeQuery = { me: Maybe<(Pick<User, 'username'> & (UserFieldsFragment & UserProfileFragment))> };`
      );
      validate(result, config);
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

      const config = { skipTypename: true };
      const result = await plugin(schema, [{ filePath: 'test-file.ts', content: ast }], config, { outputFile: '' });
      expect(result).toBeSimilarStringTo(
        `export type NotificationsQuery = { notifications: Array<(Pick<Notifiction, 'id'> & (Pick<TextNotification, 'text'> | (Pick<ImageNotification, 'imageUrl'> & { metadata: Pick<ImageMetadata, 'createdBy'> })))> };`
      );
      validate(result, config);
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
      const config = { skipTypename: true };
      const result = await plugin(schema, [{ filePath: 'test-file.ts', content: ast }], config, { outputFile: '' });

      expect(result).toBeSimilarStringTo(
        `export type UnionTestQuery = { unionTest: Maybe<(Pick<User, 'id'> | Pick<Profile, 'age'>)> };`
      );
      validate(result, config);
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
      const config = { skipTypename: true };
      const result = await plugin(schema, [{ filePath: 'test-file.ts', content: ast }], config, { outputFile: '' });
      expect(result).toBeSimilarStringTo(
        `export type CurrentUserQuery = { me: Maybe<(Pick<User, 'id'> & ((Pick<User, 'username'> & { profile: Maybe<Pick<Profile, 'age'>> })))> };`
      );
      validate(result, config);
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
      const config = { skipTypename: true };
      const result = await plugin(gitHuntSchema, [{ filePath: 'test-file.ts', content: ast }], config, {
        outputFile: ''
      });

      expect(result).toBeSimilarStringTo(
        `export type MeQueryVariables = {
          repoFullName: string
        };`
      );
      expect(result).toBeSimilarStringTo(
        `export type MeQuery = { currentUser: Maybe<Pick<User, 'login' | 'html_url'>>, entry: Maybe<(Pick<Entry, 'id' | 'createdAt'> & { postedBy: Pick<User, 'login' | 'html_url'> })> };`
      );
      validate(result, config);
    });

    it('Should build a basic selection set based on basic query', async () => {
      const ast = parse(`
        query dummy {
          dummy
        }
      `);
      const config = { skipTypename: true };
      const result = await plugin(schema, [{ filePath: 'test-file.ts', content: ast }], config, { outputFile: '' });

      expect(result).toBeSimilarStringTo(`export type DummyQuery = Pick<Query, 'dummy'>;`);
      validate(result, config);
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
      const config = { skipTypename: true };
      const result = await plugin(schema, [{ filePath: 'test-file.ts', content: ast }], config, { outputFile: '' });

      expect(result).toBeSimilarStringTo(
        `export type DummyQuery = ({ customName: Query['dummy'] } & { customName2: Maybe<Pick<Profile, 'age'>> });`
      );
      validate(result, config);
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
      const config = { skipTypename: true };
      const result = await plugin(schema, [{ filePath: 'test-file.ts', content: ast }], config, { outputFile: '' });

      expect(result).toBeSimilarStringTo(
        `export type CurrentUserQuery = { me: Maybe<(Pick<User, 'id' | 'username' | 'role'> & { profile: Maybe<Pick<Profile, 'age'>> })> };`
      );
      validate(result, config);
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
      const config = { skipTypename: true };
      const result = await plugin(schema, [{ filePath: 'test-file.ts', content: ast }], config, { outputFile: '' });

      expect(result).toBeSimilarStringTo(
        `export type UserFieldsFragment = (Pick<User, 'id' | 'username'> & { profile: Maybe<Pick<Profile, 'age'>> });`
      );
      validate(result, config);
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
      const config = { skipTypename: true };
      const result = await plugin(schema, [{ filePath: 'test-file.ts', content: ast }], config, { outputFile: '' });

      expect(result).toBeSimilarStringTo(
        `export type LoginMutation = { login: Maybe<(Pick<User, 'id' | 'username'> & { profile: Maybe<Pick<Profile, 'age'>> })> };`
      );
      validate(result, config);
    });

    it('Should detect Query correctly', async () => {
      const ast = parse(`
        query test {
          dummy
        }
      `);
      const config = { skipTypename: true };
      const result = await plugin(schema, [{ filePath: 'test-file.ts', content: ast }], config, { outputFile: '' });

      expect(result).toBeSimilarStringTo(`export type TestQuery = Pick<Query, 'dummy'>;`);
      validate(result, config);
    });

    it('Should detect Subscription correctly', async () => {
      const ast = parse(`
        subscription test {
          userCreated {
            id
          }
        }
      `);
      const config = { skipTypename: true };
      const result = await plugin(schema, [{ filePath: 'test-file.ts', content: ast }], config, { outputFile: '' });

      expect(result).toBeSimilarStringTo(`export type TestSubscription = { userCreated: Maybe<Pick<User, 'id'>> };`);
      validate(result, config);
    });

    it('Should handle operation variables correctly', async () => {
      const ast = parse(`
        query testQuery($username: String, $email: String, $password: String!, $input: InputType, $mandatoryInput: InputType!, $testArray: [String], $requireString: [String]!, $innerRequired: [String!]!) {
          dummy
        }
      `);
      const config = { skipTypename: true };
      const result = await plugin(schema, [{ filePath: 'test-file.ts', content: ast }], config, { outputFile: '' });

      expect(result).toBeSimilarStringTo(
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
      validate(result, config);
    });

    it('Should create empty variables when there are no operation variables', async () => {
      const ast = parse(`
        query testQuery {
          dummy
        }
      `);
      const config = { skipTypename: true };
      const result = await plugin(schema, [{ filePath: 'test-file.ts', content: ast }], config, { outputFile: '' });

      expect(result).toBeSimilarStringTo(`export type TestQueryQueryVariables = {};`);
      validate(result, config);
    });
  });
});
