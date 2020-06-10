import { validateTs } from '@graphql-codegen/testing';
import { parse, buildClientSchema, buildSchema } from 'graphql';
import { plugin } from '../src/index';
import { plugin as tsPlugin } from '../../typescript/src';
import { mergeOutputs, Types } from '@graphql-codegen/plugin-helpers';

describe('TypeScript Operations Plugin', () => {
  const gitHuntSchema = buildClientSchema(require('../../../../../dev-test/githunt/schema.json'));

  const schema = buildSchema(/* GraphQL */ `
    scalar DateTime

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
      test: String
      login(username: String!, password: String!): User
    }

    type Subscription {
      userCreated: User
    }

    interface Notifiction {
      id: ID!
      createdAt: String!
    }

    type TextNotification implements Notifiction {
      id: ID!
      text: String!
      createdAt: String!
    }

    type ImageNotification implements Notifiction {
      id: ID!
      imageUrl: String!
      metadata: ImageMetadata!
      createdAt: String!
    }

    type ImageMetadata {
      createdBy: String!
    }

    enum Role {
      USER
      ADMIN
    }

    union MyUnion = User | Profile

    union AnyNotification = TextNotification | ImageNotification
    union SearchResult = TextNotification | ImageNotification | User

    type Query {
      me: User
      unionTest: MyUnion
      notifications: [Notifiction!]!
      mixedNotifications: [AnyNotification!]!
      search(term: String!): [SearchResult!]!
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

  const validate = async (
    content: Types.PluginOutput,
    config: any = {},
    pluginSchema = schema,
    usage = '',
    openPlayground = false
  ) => {
    const m = mergeOutputs([await tsPlugin(pluginSchema, [], config, { outputFile: '' }), content, usage]);
    await validateTs(m, null, null, null, openPlayground);

    return m;
  };

  describe('Config', () => {
    it('Should not generate "export" when noExport is set to true', async () => {
      const ast = parse(/* GraphQL */ `
        query notifications {
          notifications {
            id

            ... on TextNotification {
              text
            }

            ... on ImageNotification {
              imageUrl
              metadata {
                created: createdBy
              }
            }
          }
        }
      `);
      const config = { noExport: true };
      const { content } = await plugin(schema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });

      expect(content).not.toContain('export');
      await validate(content, config);
    });

    it('Should handle "namespacedImportName" and add it when specified', async () => {
      const ast = parse(/* GraphQL */ `
        query notifications {
          notifications {
            id

            ... on TextNotification {
              text
              textAlias: text
            }

            ... on TextNotification {
              text
            }

            ... on ImageNotification {
              imageUrl
              metadata {
                created: createdBy
              }
            }
          }
        }
      `);
      const config = { namespacedImportName: 'Types' };
      const { content } = await plugin(schema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });

      expect(content).toBeSimilarStringTo(`
        export type NotificationsQuery = (
          { __typename?: 'Query' }
          & { notifications: Array<(
            { __typename?: 'TextNotification' }
            & Pick<Types.TextNotification, 'text' | 'id'>
            & { textAlias: Types.TextNotification['text'] }
          ) | (
            { __typename?: 'ImageNotification' }
            & Pick<Types.ImageNotification, 'imageUrl' | 'id'>
            & { metadata: (
              { __typename?: 'ImageMetadata' }
              & { created: Types.ImageMetadata['createdBy'] }
            ) }
          )> }
        );
      `);
      await validate(content, config);
    });

    it('Should handle "namespacedImportName" and "preResolveTypes" together', async () => {
      const testSchema = buildSchema(/* GraphQL */ `
        type Query {
          f: E
          user: User!
        }

        enum E {
          A
          B
        }

        scalar JSON

        type User {
          id: ID!
          f: E
          j: JSON
        }
      `);
      const ast = parse(/* GraphQL */ `
        query test {
          f
          user {
            id
            f
            j
          }
        }
      `);
      const config = { namespacedImportName: 'Types', preResolveTypes: true };
      const { content } = await plugin(testSchema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });

      expect(content).toBeSimilarStringTo(
        `export type TestQuery = { __typename?: 'Query', f?: Types.Maybe<Types.E>, user: { __typename?: 'User', id: string, f?: Types.Maybe<Types.E>, j?: Types.Maybe<any> } };`
      );

      await validate(content, config);
    });

    it('Should generate the correct output when using immutableTypes config', async () => {
      const ast = parse(/* GraphQL */ `
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
      const config = { namingConvention: 'lower-case#lowerCase', immutableTypes: true };
      const { content } = await plugin(schema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });

      expect(content).toBeSimilarStringTo(`
        export type notificationsquery = (
          { readonly __typename?: 'Query' }
          & { readonly notifications: ReadonlyArray<(
            { readonly __typename?: 'TextNotification' }
            & Pick<textnotification, 'text' | 'id'>
          ) | (
            { readonly __typename?: 'ImageNotification' }
            & Pick<imagenotification, 'imageUrl' | 'id'>
            & { readonly metadata: (
              { readonly __typename?: 'ImageMetadata' }
              & Pick<imagemetadata, 'createdBy'>
            ) }
          )> }
        );
      `);
      await validate(content, config);
    });
  });

  describe('Scalars', () => {
    it('Should include scalars when doing pick', async () => {
      const testSchema = buildSchema(/* GraphQL */ `
        scalar Date
        type Query {
          me: User
        }
        type User {
          id: ID!
          joinDate: Date!
        }
      `);

      const doc = parse(/* GraphQL */ `
        query {
          me {
            id
            joinDate
          }
        }
      `);
      const config = {};
      const { content } = await plugin(testSchema, [{ location: 'test-file.ts', document: doc }], config, {
        outputFile: '',
      });
      expect(content).toContain(`Pick<User, 'id' | 'joinDate'>`);
      await validate(content, config, testSchema);
    });
  });

  describe('Custom Operation Result Name Suffix', () => {
    it('Should generate custom operation result name', async () => {
      const ast = parse(/* GraphQL */ `
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
      const config = { operationResultSuffix: 'Result' };
      const { content } = await plugin(schema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });

      expect(content).toBeSimilarStringTo(
        `export type NotificationsQueryVariables = Exact<{ [key: string]: never; }>;`
      );
      expect(content).toBeSimilarStringTo(`
        export type NotificationsQueryResult = (
          { __typename?: 'Query' }
          & { notifications: Array<(
            { __typename?: 'TextNotification' }
            & Pick<TextNotification, 'text' | 'id'>
          ) | (
            { __typename?: 'ImageNotification' }
            & Pick<ImageNotification, 'imageUrl' | 'id'>
            & { metadata: (
              { __typename?: 'ImageMetadata' }
              & Pick<ImageMetadata, 'createdBy'>
            ) }
          )> }
        );
      `);

      await validate(content, config);
    });
  });

  describe('Naming Convention & Types Prefix', () => {
    it('Should allow custom naming and point to the correct type', async () => {
      const ast = parse(/* GraphQL */ `
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
      const config = { namingConvention: 'lower-case#lowerCase' };
      const { content } = await plugin(schema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });

      expect(content).toBeSimilarStringTo(`
        export type notificationsquery = (
          { __typename?: 'Query' }
          & { notifications: Array<(
            { __typename?: 'TextNotification' }
            & Pick<textnotification, 'text' | 'id'>
          ) | (
            { __typename?: 'ImageNotification' }
            & Pick<imagenotification, 'imageUrl' | 'id'>
            & { metadata: (
              { __typename?: 'ImageMetadata' }
              & Pick<imagemetadata, 'createdBy'>
            ) }
          )> }
        );
      `);
      await validate(content, config);
    });

    it('Should allow custom naming and point to the correct type - with custom prefix', async () => {
      const ast = parse(/* GraphQL */ `
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

      const config = { typesPrefix: 'i', namingConvention: 'lower-case#lowerCase' };
      const { content } = await plugin(schema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });

      expect(content).toBeSimilarStringTo(
        `export type inotificationsqueryvariables = Exact<{ [key: string]: never; }>;`
      );
      expect(content).toBeSimilarStringTo(`
        export type inotificationsquery = (
          { __typename?: 'Query' }
          & { notifications: Array<(
            { __typename?: 'TextNotification' }
            & Pick<itextnotification, 'text' | 'id'>
          ) | (
            { __typename?: 'ImageNotification' }
            & Pick<iimagenotification, 'imageUrl' | 'id'>
            & { metadata: (
                { __typename?: 'ImageMetadata' }
                & Pick<iimagemetadata, 'createdBy'>
              ) }
          )> }
        );
      `);
      await validate(content, config);
    });

    it('Test for dedupeOperationSuffix', async () => {
      const ast = parse(/* GraphQL */ `
        query notificationsQuery {
          notifications {
            id
          }
        }

        fragment MyFragment on Query {
          notifications {
            id
          }
        }
      `);
      const ast2 = parse(/* GraphQL */ `
        query notifications {
          notifications {
            id
          }
        }

        fragment My on Query {
          notifications {
            id
          }
        }
      `);
      const ast3 = parse(/* GraphQL */ `
        query notificationsQuery {
          ...MyFragment
        }

        fragment MyFragment on Query {
          notifications {
            id
          }
        }
      `);

      expect(
        (await plugin(schema, [{ location: 'test-file.ts', document: ast }], {}, { outputFile: '' })).content
      ).toContain('export type NotificationsQueryQuery =');
      expect(
        (await plugin(schema, [{ location: 'test-file.ts', document: ast }], {}, { outputFile: '' })).content
      ).toContain('export type MyFragmentFragment =');
      expect(
        (
          await plugin(
            schema,
            [{ location: 'test-file.ts', document: ast }],
            { dedupeOperationSuffix: false },
            { outputFile: '' }
          )
        ).content
      ).toContain('export type NotificationsQueryQuery =');
      expect(
        (
          await plugin(
            schema,
            [{ location: 'test-file.ts', document: ast }],
            { dedupeOperationSuffix: true },
            { outputFile: '' }
          )
        ).content
      ).toContain('export type NotificationsQuery =');
      expect(
        (
          await plugin(
            schema,
            [{ location: 'test-file.ts', document: ast }],
            { dedupeOperationSuffix: true },
            { outputFile: '' }
          )
        ).content
      ).toContain('export type MyFragment =');
      expect(
        (
          await plugin(
            schema,
            [{ location: 'test-file.ts', document: ast2 }],
            { dedupeOperationSuffix: true },
            { outputFile: '' }
          )
        ).content
      ).toContain('export type NotificationsQuery =');
      expect(
        (
          await plugin(
            schema,
            [{ location: 'test-file.ts', document: ast2 }],
            { dedupeOperationSuffix: false },
            { outputFile: '' }
          )
        ).content
      ).toContain('export type NotificationsQuery =');
      expect(
        (
          await plugin(
            schema,
            [{ location: 'test-file.ts', document: ast2 }],
            { dedupeOperationSuffix: false },
            { outputFile: '' }
          )
        ).content
      ).toContain('export type MyFragment =');

      const withUsage = (
        await plugin(
          schema,
          [{ location: 'test-file.ts', document: ast3 }],
          { dedupeOperationSuffix: true },
          { outputFile: '' }
        )
      ).content;
      expect(withUsage).toBeSimilarStringTo(`
        export type MyFragment = (
          { __typename?: 'Query' }
          & { notifications: Array<(
            { __typename?: 'TextNotification' }
            & Pick<TextNotification, 'id'>
          ) | (
            { __typename?: 'ImageNotification' }
            & Pick<ImageNotification, 'id'>
          )> }
        );
      `);
      expect(withUsage).toBeSimilarStringTo(`
      export type NotificationsQuery = (
        { __typename?: 'Query' }
        & MyFragment
      );
      `);
    });
  });

  it('Test for omitOperationSuffix', async () => {
    const ast = parse(/* GraphQL */ `
      query notificationsQuery {
        notifications {
          id
        }
      }

      fragment MyFragment on Query {
        notifications {
          id
        }
      }
    `);
    const ast2 = parse(/* GraphQL */ `
      query notifications {
        notifications {
          id
        }
      }

      fragment My on Query {
        notifications {
          id
        }
      }
    `);
    const ast3 = parse(/* GraphQL */ `
      query notifications {
        ...My
      }

      fragment My on Query {
        notifications {
          id
        }
      }
    `);

    expect(
      (await plugin(schema, [{ location: 'test-file.ts', document: ast }], {}, { outputFile: '' })).content
    ).toContain('export type NotificationsQueryQuery =');
    expect(
      (await plugin(schema, [{ location: 'test-file.ts', document: ast }], {}, { outputFile: '' })).content
    ).toContain('export type MyFragmentFragment =');
    expect(
      (
        await plugin(
          schema,
          [{ location: 'test-file.ts', document: ast }],
          { omitOperationSuffix: true },
          { outputFile: '' }
        )
      ).content
    ).toContain('export type NotificationsQuery =');
    expect(
      (
        await plugin(
          schema,
          [{ location: 'test-file.ts', document: ast }],
          { omitOperationSuffix: true },
          { outputFile: '' }
        )
      ).content
    ).toContain('export type MyFragment =');
    expect(
      (
        await plugin(
          schema,
          [{ location: 'test-file.ts', document: ast2 }],
          { omitOperationSuffix: true },
          { outputFile: '' }
        )
      ).content
    ).toContain('export type Notifications =');
    expect(
      (
        await plugin(
          schema,
          [{ location: 'test-file.ts', document: ast2 }],
          { omitOperationSuffix: true },
          { outputFile: '' }
        )
      ).content
    ).toContain('export type My =');
    expect(
      (
        await plugin(
          schema,
          [{ location: 'test-file.ts', document: ast2 }],
          { omitOperationSuffix: false },
          { outputFile: '' }
        )
      ).content
    ).toContain('export type NotificationsQuery =');
    expect(
      (
        await plugin(
          schema,
          [{ location: 'test-file.ts', document: ast2 }],
          { omitOperationSuffix: false },
          { outputFile: '' }
        )
      ).content
    ).toContain('export type MyFragment =');

    const withUsage = (
      await plugin(
        schema,
        [{ location: 'test-file.ts', document: ast3 }],
        { omitOperationSuffix: true },
        { outputFile: '' }
      )
    ).content;
    expect(withUsage).toBeSimilarStringTo(`
      export type My = (
        { __typename?: 'Query' }
        & { notifications: Array<(
          { __typename?: 'TextNotification' }
          & Pick<TextNotification, 'id'>
        ) | (
          { __typename?: 'ImageNotification' }
          & Pick<ImageNotification, 'id'>
        )> }
      );
    `);
    expect(withUsage).toBeSimilarStringTo(`
    export type Notifications = (
      { __typename?: 'Query' }
      & My
    );
    `);
  });

  describe('__typename', () => {
    it('Should add __typename correctly with nonOptionalTypename=false,skipTypename=true,preResolveTypes=true and explicit field', async () => {
      const testSchema = buildSchema(/* GraphQL */ `
        type Search {
          search: [SearchResult!]!
        }

        type Movie {
          id: ID!
          title: String!
        }
        type Person {
          id: ID!
          name: String!
        }

        union SearchResult = Movie | Person

        type Query {
          search(term: String!): [SearchResult!]!
        }
      `);
      const ast = parse(/* GraphQL */ `
        query q1 {
          search {
            ... on Movie {
              __typename
              id
              title
            }
            ... on Person {
              __typename
              id
              name
            }
          }
        }

        query q2 {
          search {
            __typename
            ... on Movie {
              id
              title
            }
            ... on Person {
              id
              name
            }
          }
        }
      `);
      const config = {
        nonOptionalTypename: false,
        skipTypename: true,
        preResolveTypes: true,
      };
      const { content } = await plugin(testSchema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });

      expect(content).toContain(
        `export type Q1Query = { search: Array<{ __typename: 'Movie', id: string, title: string } | { __typename: 'Person', id: string, name: string }> };`
      );
      expect(content).toContain(
        `export type Q2Query = { search: Array<{ __typename: 'Movie', id: string, title: string } | { __typename: 'Person', id: string, name: string }> };`
      );
      await validate(content, config, testSchema);
    });

    it('Should skip __typename when skipTypename is set to true', async () => {
      const ast = parse(/* GraphQL */ `
        query {
          dummy
        }
      `);
      const config = { skipTypename: true };
      const { content } = await plugin(schema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });

      expect(content).not.toContain(`__typename`);
      await validate(content, config);
    });

    it('Should add __typename when dealing with fragments', async () => {
      const testSchema = buildSchema(/* GraphQL */ `
        interface Node {
          id: ID!
        }

        type A implements Node {
          id: ID!
          A: String
        }

        type B implements Node {
          id: ID!
          B: String
        }

        type Query {
          some: Node
        }
      `);
      const ast = parse(/* GraphQL */ `
        fragment Node on Node {
          __typename
          id
        }

        query Test {
          some {
            ...Node
          }
        }
      `);
      const config = {};
      const { content } = await plugin(testSchema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });
      expect(content).toBeSimilarStringTo(`
      export type TestQuery = (
        { __typename?: 'Query' }
        & { some?: Maybe<(
          { __typename?: 'A' }
          & Node_A_Fragment
        ) | (
          { __typename?: 'B' }
          & Node_B_Fragment
        )> }
      );
      `);
      await validate(content, config, testSchema);
    });

    it('Should add aliased __typename correctly', async () => {
      const ast = parse(/* GraphQL */ `
        query {
          type: __typename
          dummy
        }
      `);
      const config = {};
      const { content } = await plugin(schema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });
      expect(content).toBeSimilarStringTo(`
      export type Unnamed_1_Query = (
        { __typename?: 'Query' }
        & Pick<Query, 'dummy'>
        & { type: 'Query' }
      );
      `);
      await validate(content, config);
    });

    it('Should add aliased __typename correctly with preResovleTypes', async () => {
      const ast = parse(/* GraphQL */ `
        query {
          type: __typename
          dummy
        }
      `);
      const config = { preResolveTypes: true };
      const { content } = await plugin(schema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });
      expect(content).toBeSimilarStringTo(`
      export type Unnamed_1_Query = { __typename?: 'Query', dummy?: Maybe<string>, type: 'Query' };
      `);
      await validate(content, config);
    });

    it('Should add __typename as non-optional when explicitly specified', async () => {
      const ast = parse(/* GraphQL */ `
        query {
          __typename
          dummy
        }
      `);
      const config = {};
      const { content } = await plugin(schema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });
      expect(content).toBeSimilarStringTo(`
        export type Unnamed_1_Query = (
          { __typename: 'Query' }
          & Pick<Query, 'dummy'>
        );
      `);
      await validate(content, config);
    });

    it('Should add __typename as non-optional when forced', async () => {
      const ast = parse(/* GraphQL */ `
        query {
          dummy
        }
      `);
      const config = { nonOptionalTypename: true };
      const { content } = await plugin(schema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });
      expect(content).toBeSimilarStringTo(`
        export type Unnamed_1_Query = (
          { __typename: 'Query' }
          & Pick<Query, 'dummy'>
        );
      `);
      await validate(content, config);
    });

    it('Should add __typename as optional when its not specified', async () => {
      const ast = parse(/* GraphQL */ `
        query {
          dummy
        }
      `);
      const config = {};
      const { content } = await plugin(schema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });
      expect(content).toBeSimilarStringTo(`
        export type Unnamed_1_Query = (
          { __typename?: 'Query' }
          & Pick<Query, 'dummy'>
        );
      `);
      await validate(content, config);
    });

    it('Should add __typename as non-optional when its explictly specified, even if skipTypename is true', async () => {
      const ast = parse(/* GraphQL */ `
        query {
          __typename
          dummy
        }
      `);
      const config = { skipTypename: true };
      const { content } = await plugin(schema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });

      expect(content).toBeSimilarStringTo(`
        export type Unnamed_1_Query = (
          { __typename: 'Query' }
          & Pick<Query, 'dummy'>
        );
      `);
      await validate(content, config);
    });

    it('Should add __typename correctly when unions are in use', async () => {
      const ast = parse(/* GraphQL */ `
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
      const { content } = await plugin(schema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });
      expect(content).toBeSimilarStringTo(`
        export type UnionTestQuery = (
          { __typename?: 'Query' } 
          & { unionTest?: Maybe<(
            { __typename?: 'User' }
            & Pick<User, 'id'>
          ) | (
            { __typename?: 'Profile' }
            & Pick<Profile, 'age'>
          )> }
        );
      `);
      await validate(content, config);
    });

    it('Should add __typename correctly when interfaces are in use', async () => {
      const ast = parse(/* GraphQL */ `
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
      const { content } = await plugin(schema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });
      expect(content).toBeSimilarStringTo(`
        export type NotificationsQuery = (
          { __typename?: 'Query' }
          & { notifications: Array<(
            { __typename?: 'TextNotification' }
            & Pick<TextNotification, 'text' | 'id'>
          ) | (
            { __typename?: 'ImageNotification' }
            & Pick<ImageNotification, 'imageUrl' | 'id'>
            & { metadata: (
                { __typename?: 'ImageMetadata' }
                & Pick<ImageMetadata, 'createdBy'>
              ) }
          )> }
        );
      `);
      await validate(content, config);
    });
    it('should mark __typename as non optional in case it is included in the selection set of an interface field', async () => {
      const ast = parse(/* GraphQL */ `
        query notifications {
          notifications {
            __typename
            ... on TextNotification {
              text
            }
            ... on ImageNotification {
              imageUrl
            }
          }
        }
      `);
      const config = {};
      const { content } = await plugin(schema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });
      expect(content).toBeSimilarStringTo(`
        export type NotificationsQuery = (
          { __typename?: 'Query' }
          & { notifications: Array<(
            { __typename: 'TextNotification' }
            & Pick<TextNotification, 'text'>
          ) | (
            { __typename: 'ImageNotification' }
            & Pick<ImageNotification, 'imageUrl'>
          )> }
        );
      `);
      await validate(content, config);
    });
    it('should mark __typename as non optional in case it is included in the selection set of an union field', async () => {
      const ast = parse(/* GraphQL */ `
        query unionTest {
          unionTest {
            __typename
            ... on Profile {
              firstName
            }
            ... on User {
              email
            }
          }
        }
      `);
      const config = {};
      const { content } = await plugin(schema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });
      expect(content).toBeSimilarStringTo(`
      { __typename?: 'Query' }
      & { unionTest?: Maybe<(
        { __typename: 'User' }
        & Pick<User, 'email'>
      ) | (
        { __typename: 'Profile' }
        & Pick<Profile, 'firstName'>
      )> }
    );
      `);
      await validate(content, config);
    });
  });

  describe('Unnamed Documents', () => {
    it('Should handle unnamed documents correctly', async () => {
      const ast = parse(/* GraphQL */ `
        query {
          dummy
        }
      `);
      const config = { skipTypename: true };
      const { content } = await plugin(schema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });
      expect(content).toBeSimilarStringTo(`
        export type Unnamed_1_Query = Pick<Query, 'dummy'>;
      `);
      expect(content).toBeSimilarStringTo(`
        export type Unnamed_1_QueryVariables = Exact<{ [key: string]: never; }>;
      `);
      await validate(content, config);
    });

    it('Should handle unnamed documents correctly with multiple documents', async () => {
      const ast = parse(/* GraphQL */ `
        query {
          dummy
        }

        query {
          dummy
        }
      `);
      const config = { skipTypename: true };
      const { content } = await plugin(schema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });

      expect(content).toBeSimilarStringTo(`
        export type Unnamed_1_Query = Pick<Query, 'dummy'>;
      `);
      expect(content).toBeSimilarStringTo(`
        export type Unnamed_1_QueryVariables = Exact<{ [key: string]: never; }>;
      `);
      expect(content).toBeSimilarStringTo(`
        export type Unnamed_2_Query = Pick<Query, 'dummy'>;
      `);
      expect(content).toBeSimilarStringTo(`
        export type Unnamed_2_QueryVariables = Exact<{ [key: string]: never; }>;
      `);
      await validate(content, config);
    });
  });

  describe('Selection Set', () => {
    it('Should detect invalid types as parent and notify', async () => {
      const ast = parse(/* GraphQL */ `
        mutation test {
          test
        }
      `);
      const config = {};

      try {
        await plugin(
          buildSchema(/* GraphQL */ `
            type Query {
              foo: String
            }
          `),
          [{ location: 'test-file.ts', document: ast }],
          config,
          { outputFile: '' }
        );
        expect(true).toBeFalsy();
      } catch (e) {
        expect(e.message).toBe('Unable to find root schema type for operation type "mutation"!');
      }
    });

    it('Should have valid __typename usage and split types according to that (with usage)', async () => {
      const testSchema = buildSchema(/* GraphQL */ `
        scalar IPV4
        scalar IPV6

        type IPV4Route {
          address: IPV4
          gateway: IPV4
        }

        type IPV6Route {
          address: IPV6
          gateway: IPV6
        }

        union RouteUnion = IPV4Route | IPV6Route

        type Query {
          routes: [RouteUnion!]!
        }
      `);
      const ast = parse(/* GraphQL */ `
        fragment NetRoute on RouteUnion {
          __typename
          ... on IPV4Route {
            ipv4Address: address
            ipv4Gateway: gateway
          }
          ... on IPV6Route {
            ipv6Address: address
            ipv6Gateway: gateway
          }
        }

        query QQ {
          routes {
            ...NetRoute
          }
        }
      `);
      const config = {};
      const { content } = await plugin(testSchema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });

      const usage = `
      type Route = QqQuery['routes'][0];

      function validateGateway(route: Route) {
          if (route.__typename === 'IPV4Route') {
              console.log(route.ipv4Gateway)
          } else {
              console.log(route.ipv6Gateway)
          }
      }
      `;

      await validate(content, config, testSchema, usage);
      expect(mergeOutputs([content])).toMatchSnapshot();
    });

    it('Should generate the correct __typename when using fragment over type', async () => {
      const testSchema = buildSchema(/* GraphQL */ `
        type Query {
          user: User
        }

        type User {
          id: ID!
          name: String
        }
      `);
      const ast = parse(/* GraphQL */ `
        query userQuery {
          user {
            ... on User {
              id
              name
            }
          }
        }
      `);
      const config = {};
      const { content } = await plugin(testSchema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });
      await validate(content, config, testSchema);
      expect(mergeOutputs([content])).toMatchSnapshot();
    });

    it('Should generate the correct __typename when using both inline fragment and spread over type', async () => {
      const testSchema = buildSchema(/* GraphQL */ `
        type Query {
          user: User
        }

        type User {
          id: ID!
          name: String
        }
      `);
      const ast = parse(/* GraphQL */ `
        query userQuery {
          user {
            ... on User {
              ...user
            }
          }
        }

        fragment user on User {
          id
          name
        }
      `);
      const config = {};
      const { content } = await plugin(testSchema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });
      await validate(content, config, testSchema);
      expect(mergeOutputs([content])).toMatchSnapshot();
    });

    it('Should generate the correct __typename when using fragment spread over type', async () => {
      const testSchema = buildSchema(/* GraphQL */ `
        type Query {
          user: User
        }

        type User {
          id: ID!
          name: String
        }
      `);
      const ast = parse(/* GraphQL */ `
        query userQuery {
          user {
            ...user
          }
        }

        fragment user on User {
          id
          name
        }
      `);
      const config = {};
      const { content } = await plugin(testSchema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });
      await validate(content, config, testSchema);
      expect(mergeOutputs([content])).toMatchSnapshot();
    });

    it('Should generate the correct __typename when using fragment spread over union', async () => {
      const testSchema = buildSchema(/* GraphQL */ `
        type User {
          id: ID!
        }

        type Error {
          message: String!
        }

        union UserResult = User | Error

        type Query {
          user: UserResult!
        }
      `);
      const ast = parse(/* GraphQL */ `
        fragment UserFragment on User {
          id
        }
        query aaa {
          user {
            ...UserFragment
          }
        }
      `);
      const config = {};
      const { content } = await plugin(testSchema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });
      await validate(
        content,
        config,
        testSchema,
        `function test(q: AaaQuery) {
        console.log(q.user.__typename === 'User' ? q.user.id : null);
        console.log(q.user.__typename === 'Error' ? q.user.__typename : null);
      }`
      );
      expect(mergeOutputs([content])).toMatchSnapshot();
    });

    it('Should have valid fragments intersection on different types (with usage) #2498', async () => {
      const testSchema = buildSchema(/* GraphQL */ `
        interface User {
          id: ID!
        }

        type Tom implements User {
          id: ID!
          foo: String!
        }

        type Jerry implements User {
          id: ID!
          bar: String!
        }

        type Query {
          user: User
        }
      `);
      const ast = parse(/* GraphQL */ `
        fragment tom on Tom {
          id
          foo
        }

        fragment jerry on Jerry {
          id
          bar
        }

        fragment user on User {
          ...tom
          ...jerry
        }

        query userQuery {
          user {
            ...user
          }
        }
      `);
      const config = {};
      const { content } = await plugin(testSchema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });

      await validate(
        content,
        config,
        testSchema,
        `
          function test(a: UserFragment) {
              if (a.__typename === 'Tom') {
                  console.log(a.foo);
              } else if (a.__typename === 'Jerry') {
                  console.log(a.bar);
              }
          }`
      );
      expect(mergeOutputs([content])).toMatchSnapshot();
    });

    it('Should have valid __typename usage and split types according to that (with usage)', async () => {
      const testSchema = buildSchema(/* GraphQL */ `
        scalar IPV4
        scalar IPV6

        type IPV4Route {
          address: IPV4
          gateway: IPV4
        }

        type IPV6Route {
          address: IPV6
          gateway: IPV6
        }

        union RouteUnion = IPV4Route | IPV6Route

        type Query {
          routes: [RouteUnion!]!
        }
      `);
      const ast = parse(/* GraphQL */ `
        fragment NetRoute on RouteUnion {
          __typename
          ... on IPV4Route {
            ipv4Address: address
            ipv4Gateway: gateway
          }
          ...test
        }

        fragment test on IPV6Route {
          ipv6Address: address
          ipv6Gateway: gateway
        }

        query QQ {
          routes {
            ...NetRoute
          }
        }
      `);
      const config = {};
      const { content } = await plugin(testSchema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });

      const usage = `
      type Route = QqQuery['routes'][0];

      function validateGateway(route: Route) {
          if (route.__typename === 'IPV4Route') {
              console.log(route.ipv4Gateway)
          } else {
              console.log(route.ipv6Gateway)
          }
      }
      `;

      await validate(content, config, testSchema, usage);
      expect(mergeOutputs([content])).toMatchSnapshot();
    });

    it('Should support fragment spread correctly with simple type with no other fields', async () => {
      const ast = parse(/* GraphQL */ `
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
      const { content } = await plugin(schema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });
      expect(content).toBeSimilarStringTo(`
        export type MeQuery = { me?: Maybe<UserFieldsFragment> };
      `);
      await validate(content, config);
    });

    it('Should support fragment spread correctly with simple type with other fields', async () => {
      const ast = parse(/* GraphQL */ `
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
      const { content } = await plugin(schema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });

      expect(content).toBeSimilarStringTo(`
      export type MeQuery = { me?: Maybe<(
        Pick<User, 'username'>
        & UserFieldsFragment
      )> };
      `);
      await validate(content, config);
    });

    it('Should support fragment spread correctly with multiple fragment spread', async () => {
      const ast = parse(/* GraphQL */ `
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
      const config = { skipTypename: false };
      const { content } = await plugin(schema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });

      expect(content).toBeSimilarStringTo(`
      export type MeQuery = (
        { __typename?: 'Query' }
        & { me?: Maybe<(
          { __typename?: 'User' }
          & Pick<User, 'username'>
          & UserFieldsFragment
          & UserProfileFragment
        )> }
      );
      `);
      expect(content).toBeSimilarStringTo(`
        export type UserProfileFragment = (
          { __typename?: 'User' }
          & { profile?: Maybe<(
            { __typename?: 'Profile' }
            & Pick<Profile, 'age'>
          )> }
        );
      `);
      expect(content).toBeSimilarStringTo(`
        export type UserFieldsFragment = (
          { __typename?: 'User' }
          & Pick<User, 'id'>
        );
      `);
      await validate(content, config);
    });

    it('Should generate the correct intersection for fragments when using with interfaces with different type', async () => {
      const schema = buildSchema(/* GraphQL */ `
        interface Base {
          id: ID!
        }

        type A implements Base {
          id: ID!
          x: Int!
        }

        type B implements Base {
          id: ID!
          y: Int!
        }

        type Query {
          b: Base
        }
      `);

      const ast = parse(/* GraphQL */ `
        query {
          b {
            ...a
            ...b
          }
        }

        fragment a on A {
          id
          x
        }

        fragment b on B {
          id
          y
        }
      `);
      const config = {};
      const { content } = await plugin(schema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });

      expect(content).toBeSimilarStringTo(`
      export type Unnamed_1_Query = (
        { __typename?: 'Query' }
        & { b?: Maybe<(
          { __typename?: 'A' }
          & AFragment
        ) | (
          { __typename?: 'B' }
          & BFragment
        )> }
      );

        export type AFragment = (
          { __typename?: 'A' }
          & Pick<A, 'id' | 'x'>
        );

        export type BFragment = (
          { __typename?: 'B' }
          & Pick<B, 'id' | 'y'>
        );
      `);
      await validate(content, config, schema);
    });

    it('Should generate the correct intersection for fragments when type implements 2 interfaces', async () => {
      const schema = buildSchema(/* GraphQL */ `
        interface Base1 {
          foo: String!
        }

        interface Base2 {
          bar: String!
        }

        type MyType implements Base1 & Base2 {
          foo: String!
          bar: String!
          test: String!
        }

        type Query {
          myType: MyType!
        }
      `);

      const ast = parse(/* GraphQL */ `
        query {
          myType {
            ...a
            ...b
            ...c
          }
        }

        fragment c on MyType {
          test
        }

        fragment a on Base1 {
          foo
        }

        fragment b on Base2 {
          bar
        }
      `);
      const config = {};
      const { content } = await plugin(schema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });
      expect(content).toBeSimilarStringTo(`
      export type Unnamed_1_Query = (
        { __typename?: 'Query' }
        & { myType: (
          { __typename?: 'MyType' }
          & AFragment
          & BFragment
          & CFragment
        ) }
      );
      `);
      await validate(content, config);
    });

    it('Should generate the correct intersection for fragments when using with interfaces with same type', async () => {
      const schema = buildSchema(/* GraphQL */ `
        interface Base {
          id: ID!
        }

        type A implements Base {
          id: ID!
          x: Int!
        }

        type B implements Base {
          id: ID!
          y: Int!
        }

        type Query {
          b: Base
        }
      `);

      const ast = parse(/* GraphQL */ `
        query {
          b {
            ...a
            ...b
          }
        }

        fragment a on A {
          id
        }

        fragment b on A {
          x
        }
      `);
      const config = {};
      const { content } = await plugin(schema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });

      expect(content).toBeSimilarStringTo(`
      export type Unnamed_1_Query = (
        { __typename?: 'Query' }
        & { b?: Maybe<(
          { __typename?: 'A' }
          & AFragment
          & BFragment
        ) | { __typename?: 'B' }> }
      );
  
        export type AFragment = (
          { __typename?: 'A' }
          & Pick<A, 'id'>
        );
  
        export type BFragment = (
          { __typename?: 'A' }
          & Pick<A, 'x'>
        );
      `);
      validateTs(mergeOutputs([content]), config);
      expect(mergeOutputs([content])).toMatchSnapshot();
    });

    it('Should support interfaces correctly when used with inline fragments', async () => {
      const ast = parse(/* GraphQL */ `
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
      const { content } = await plugin(schema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });
      expect(content).toBeSimilarStringTo(`
        export type NotificationsQuery = (
          { __typename?: 'Query' }
          & { notifications: Array<(
            { __typename?: 'TextNotification' }
            & Pick<TextNotification, 'text' | 'id'>
          ) | (
            { __typename?: 'ImageNotification' }
            & Pick<ImageNotification, 'imageUrl' | 'id'>
            & { metadata: (
                { __typename?: 'ImageMetadata' }
                & Pick<ImageMetadata, 'createdBy'>
              ) }
          )> }
        );
      `);
      await validate(content, config);
    });

    it('Should support union correctly when used with inline fragments', async () => {
      const ast = parse(/* GraphQL */ `
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
      const { content } = await plugin(schema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });

      expect(content).toBeSimilarStringTo(`
        export type UnionTestQuery = (
          { __typename?: 'Query' }
            & { unionTest?: Maybe<(
            { __typename?: 'User' }
            & Pick<User, 'id'>
          ) | (
            { __typename?: 'Profile' }
            & Pick<Profile, 'age'>
          )> }
        );
      `);
      await validate(content, config);
    });

    it('Should support union correctly when used with inline fragments on types implementing common interface', async () => {
      const ast = parse(/* GraphQL */ `
        query unionTest {
          mixedNotifications {
            ... on Notifiction {
              id
            }

            ... on TextNotification {
              text
            }

            ... on ImageNotification {
              imageUrl
            }
          }
        }
      `);
      const config = {};
      const { content } = await plugin(schema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });

      expect(content).toBeSimilarStringTo(`
        export type UnionTestQuery = (
          { __typename?: 'Query' }
          & { mixedNotifications: Array<(
            { __typename?: 'TextNotification' }
            & Pick<TextNotification, 'id' | 'text'>
          ) | (
            { __typename?: 'ImageNotification' }
            & Pick<ImageNotification, 'id' | 'imageUrl'>
          )> }
        );
      `);
      await validate(content, config);
    });

    it('Should support union correctly when used with inline fragments on types implementing common interface and also other types', async () => {
      const ast = parse(/* GraphQL */ `
        query unionTest {
          search(term: "a") {
            ... on User {
              id
            }

            ... on Notifiction {
              id
            }

            ... on TextNotification {
              text
            }

            ... on ImageNotification {
              imageUrl
            }
          }
        }
      `);
      const config = {};
      const { content } = await plugin(schema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });

      expect(content).toBeSimilarStringTo(`
        export type UnionTestQuery = (
          { __typename?: 'Query' }
          & { search: Array<(
            { __typename?: 'TextNotification' }
            & Pick<TextNotification, 'id' | 'text'>
          ) | (
            { __typename?: 'ImageNotification' }
            & Pick<ImageNotification, 'id' | 'imageUrl'>
          ) | (
            { __typename?: 'User' }
            & Pick<User, 'id'>
          )> }
        );
      `);
      await validate(content, config);
    });

    it('Should support inline fragments', async () => {
      const ast = parse(/* GraphQL */ `
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
      const { content } = await plugin(schema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });
      expect(content).toBeSimilarStringTo(`
        export type CurrentUserQuery = { me?: Maybe<(
            Pick<User, 'username' | 'id'>
            & { profile?: Maybe<Pick<Profile, 'age'>> }
        )> };
      `);

      await validate(content, config);
    });

    it('Should build a basic selection set based on basic query on GitHub schema', async () => {
      const ast = parse(/* GraphQL */ `
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
      const { content } = await plugin(gitHuntSchema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });

      expect(content).toBeSimilarStringTo(
        `export type MeQueryVariables = Exact<{
          repoFullName: Scalars['String'];
        }>;`
      );
      expect(content).toBeSimilarStringTo(`
        export type MeQuery = { currentUser?: Maybe<Pick<User, 'login' | 'html_url'>>, entry?: Maybe<(
          Pick<Entry, 'id' | 'createdAt'>
          & { postedBy: Pick<User, 'login' | 'html_url'> }
        )> };
      `);
      await validate(content, config, gitHuntSchema);
    });

    it('Should build a basic selection set based on basic query on GitHub schema with preResolveTypes=true', async () => {
      const ast = parse(/* GraphQL */ `
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
      const config = { preResolveTypes: true };
      const { content } = await plugin(gitHuntSchema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });

      expect(content).toBeSimilarStringTo(`
        export type MeQuery = { __typename?: 'Query', currentUser?: Maybe<{ __typename?: 'User', login: string, html_url: string }>, entry?: Maybe<{ __typename?: 'Entry', id: number, createdAt: number, postedBy: { __typename?: 'User', login: string, html_url: string } }> };
      `);
      await validate(content, config, gitHuntSchema);
    });

    it('Should produce valid output with preResolveTypes=true and enums', async () => {
      const ast = parse(/* GraphQL */ `
        query test {
          info {
            ...information
          }
        }

        fragment information on Information {
          entries {
            id
            value
          }
        }
      `);
      const testSchema = buildSchema(/* GraphQL */ `
        type Information {
          entries: [Information_Entry!]!
        }

        enum Information_EntryType {
          NAME
          ADDRESS
        }

        type Information_Entry {
          id: Information_EntryType!
          value: String
        }

        type Query {
          info: Information
        }
      `);
      const config = { preResolveTypes: true };
      const { content } = await plugin(testSchema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });

      const o = await validate(content, config, testSchema);
      expect(o).toContain(`export enum Information_EntryType {`);
      expect(o).toContain(`__typename?: 'Information_Entry', id: Information_EntryType,`);
    });

    it('Should produce valid output with preResolveTypes=true and enums with prefixes set', async () => {
      const ast = parse(/* GraphQL */ `
        query test($e: Information_EntryType!) {
          info {
            ...information
          }
          infoArgTest(e: $e) {
            ...information
          }
        }

        fragment information on Information {
          entries {
            id
            value
          }
        }
      `);
      const testSchema = buildSchema(/* GraphQL */ `
        type Information {
          entries: [Information_Entry!]!
        }

        enum Information_EntryType {
          NAME
          ADDRESS
        }

        type Information_Entry {
          id: Information_EntryType!
          value: String
        }

        type Query {
          infoArgTest(e: Information_EntryType!): Information
          info: Information
        }
      `);
      const config = { preResolveTypes: true, typesPrefix: 'I', enumPrefix: false };
      const { content } = await plugin(testSchema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });

      const o = await validate(content, config, testSchema);
      expect(o).toBeSimilarStringTo(` export type ITestQueryVariables = Exact<{
        e: Information_EntryType;
      }>;`);
      expect(o).toContain(`export type IQuery = {`);
      expect(o).toContain(`export enum Information_EntryType {`);
      expect(o).toContain(`__typename?: 'Information_Entry', id: Information_EntryType,`);
    });

    it('Should build a basic selection set based on basic query', async () => {
      const ast = parse(/* GraphQL */ `
        query dummy {
          dummy
        }
      `);
      const config = { skipTypename: true };
      const { content } = await plugin(schema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });

      expect(content).toBeSimilarStringTo(`
        export type DummyQuery = Pick<Query, 'dummy'>;
      `);
      await validate(content, config);
    });

    it('Should build a basic selection set based on basic query with field aliasing for basic scalar', async () => {
      const ast = parse(/* GraphQL */ `
        query dummy {
          customName: dummy
          customName2: dummyWithType {
            age
          }
        }
      `);
      const config = { skipTypename: true };
      const { content } = await plugin(schema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });

      expect(content).toBeSimilarStringTo(`
        export type DummyQuery = (
          { customName: Query['dummy'] }
          & { customName2?: Maybe<Pick<Profile, 'age'>> }
        );
      `);
      await validate(content, config);
    });

    it('Should build a basic selection set based on a query with inner fields', async () => {
      const ast = parse(/* GraphQL */ `
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
      const { content } = await plugin(schema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });

      expect(content).toBeSimilarStringTo(`
        export type CurrentUserQuery = { me?: Maybe<(
          Pick<User, 'id' | 'username' | 'role'>
          & { profile?: Maybe<Pick<Profile, 'age'>> }
        )> };
      `);
      await validate(content, config);
    });
  });

  describe('Fragment Definition', () => {
    it('Should build fragment definition correctly - with name and selection set', async () => {
      const ast = parse(/* GraphQL */ `
        fragment UserFields on User {
          id
          username
          profile {
            age
          }
        }
      `);
      const config = { skipTypename: true };
      const { content } = await plugin(schema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });

      expect(content).toBeSimilarStringTo(`
        export type UserFieldsFragment = (
          Pick<User, 'id' | 'username'>
          & { profile?: Maybe<Pick<Profile, 'age'>> }
        );
      `);
      await validate(content, config);
    });
  });

  describe('Operation Definition', () => {
    it('Should detect Mutation correctly', async () => {
      const ast = parse(/* GraphQL */ `
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
      const { content } = await plugin(schema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });

      expect(content).toBeSimilarStringTo(`
        export type LoginMutation = { login?: Maybe<(
          Pick<User, 'id' | 'username'>
          & { profile?: Maybe<Pick<Profile, 'age'>> }
        )> };
      `);
      await validate(content, config);
    });

    it('Should detect Query correctly', async () => {
      const ast = parse(/* GraphQL */ `
        query test {
          dummy
        }
      `);
      const config = { skipTypename: true };
      const { content } = await plugin(schema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });

      expect(content).toBeSimilarStringTo(`
        export type TestQuery = Pick<Query, 'dummy'>;
      `);
      await validate(content, config);
    });

    it('Should detect Subscription correctly', async () => {
      const ast = parse(/* GraphQL */ `
        subscription test {
          userCreated {
            id
          }
        }
      `);
      const config = { skipTypename: true };
      const { content } = await plugin(schema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });

      expect(content).toBeSimilarStringTo(`
        export type TestSubscription = { userCreated?: Maybe<Pick<User, 'id'>> };
      `);
      await validate(content, config);
    });

    it('Should handle operation variables correctly', async () => {
      const ast = parse(/* GraphQL */ `
        query testQuery(
          $username: String
          $email: String
          $password: String!
          $input: InputType
          $mandatoryInput: InputType!
          $testArray: [String]
          $requireString: [String]!
          $innerRequired: [String!]!
        ) {
          dummy
        }
      `);
      const config = { skipTypename: true };
      const { content } = await plugin(schema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });

      expect(content).toBeSimilarStringTo(
        `export type TestQueryQueryVariables = Exact<{
          username?: Maybe<Scalars['String']>;
          email?: Maybe<Scalars['String']>;
          password: Scalars['String'];
          input?: Maybe<InputType>;
          mandatoryInput: InputType;
          testArray?: Maybe<Array<Maybe<Scalars['String']>>>;
          requireString: Array<Maybe<Scalars['String']>>;
          innerRequired: Array<Scalars['String']>;
        }>;`
      );
      await validate(content, config);
    });

    it('Should handle operation variables correctly when they use custom scalars', async () => {
      const ast = parse(/* GraphQL */ `
        query testQuery($test: DateTime) {
          dummy
        }
      `);
      const config = { skipTypename: true };
      const { content } = await plugin(schema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });

      expect(content).toBeSimilarStringTo(
        `export type TestQueryQueryVariables = Exact<{
          test?: Maybe<Scalars['DateTime']>;
        }>;`
      );
      await validate(content, config);
    });

    it('Should create empty variables when there are no operation variables', async () => {
      const ast = parse(/* GraphQL */ `
        query testQuery {
          dummy
        }
      `);
      const config = { skipTypename: true };
      const { content } = await plugin(schema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });

      expect(content).toBeSimilarStringTo(`export type TestQueryQueryVariables = Exact<{ [key: string]: never; }>;`);
      await validate(content, config);
    });

    it('avoid duplicates - each type name should be unique', async () => {
      const testSchema = buildSchema(/* GraphQL */ `
        type DeleteMutation {
          deleted: Boolean!
        }
        type UpdateMutation {
          updated: Boolean!
        }
        union MessageMutationType = DeleteMutation | UpdateMutation
        type Query {
          dummy: String
        }
        type Mutation {
          mutation(message: String!, type: String!): MessageMutationType!
        }
      `);
      const query = parse(/* GraphQL */ `
        mutation SubmitMessage($message: String!) {
          mutation(message: $message) {
            ... on DeleteMutation {
              deleted
            }
            ... on UpdateMutation {
              updated
            }
          }
        }
      `);

      const { content } = await plugin(
        testSchema,
        [{ location: '', document: query }],
        {},
        {
          outputFile: 'graphql.ts',
        }
      );

      expect(content).toBeSimilarStringTo(`
        export type SubmitMessageMutation = (
          { __typename?: 'Mutation' }
          & { mutation: (
            { __typename?: 'DeleteMutation' }
            & Pick<DeleteMutation, 'deleted'>
          ) | (
            { __typename?: 'UpdateMutation' }
          & Pick<UpdateMutation, 'updated'>
          ) }
        );
      `);
    });

    it('should use __typename in fragments when requested', async () => {
      const testSchema = buildSchema(/* GraphQL */ `
        type Post {
          title: String
        }
        type Query {
          post: Post!
        }
      `);
      const query = parse(/* GraphQL */ `
        query Post {
          post {
            ... on Post {
              __typename
            }
          }
        }
      `);

      const { content } = await plugin(
        testSchema,
        [{ location: '', document: query }],
        {},
        {
          outputFile: 'graphql.ts',
        }
      );

      expect(content).toBeSimilarStringTo(`
        export type PostQuery = (
          { __typename?: 'Query' }
          & { post: { __typename: 'Post' } }
        );
      `);
    });

    it('should handle introspection types (__schema)', async () => {
      const testSchema = buildSchema(/* GraphQL */ `
        type Post {
          title: String
        }
        type Query {
          post: Post!
        }
      `);
      const query = parse(/* GraphQL */ `
        query Info {
          __schema {
            queryType {
              fields {
                name
              }
            }
          }
        }
      `);

      const { content } = await plugin(
        testSchema,
        [{ location: '', document: query }],
        {},
        {
          outputFile: 'graphql.ts',
        }
      );

      expect(content).toBeSimilarStringTo(`
        export type InfoQuery = (
          { __typename?: 'Query' }
          & { __schema: (
            { __typename?: '__Schema' }
            & { queryType: (
              { __typename?: '__Type' }
              & { fields?: Maybe<Array<(
                { __typename?: '__Field' }
                & Pick<__Field, 'name'>
              )>> }
            ) }
          ) }
        );`);
    });

    it('should handle introspection types (__type)', async () => {
      const testSchema = buildSchema(/* GraphQL */ `
        type Post {
          title: String
        }
        type Query {
          post: Post!
        }
      `);
      const query = parse(/* GraphQL */ `
        query Info {
          __type(name: "Post") {
            name
            fields {
              name
              type {
                name
                kind
              }
            }
          }
        }
      `);

      const { content } = await plugin(
        testSchema,
        [{ location: '', document: query }],
        {},
        {
          outputFile: 'graphql.ts',
        }
      );

      expect(content).toBeSimilarStringTo(`
        export type InfoQuery = (
          { __typename?: 'Query' }
          & { __type?: Maybe<(
            { __typename?: '__Type' }
            & Pick<__Type, 'name'>
            & { fields?: Maybe<Array<(
              { __typename?: '__Field' }
              & Pick<__Field, 'name'>
              & { type: (
                { __typename?: '__Type' }
                & Pick<__Type, 'name' | 'kind'>
              ) }
            )>> }
          )> }
        );
      `);
    });

    it('should handle introspection types (like __TypeKind)', async () => {
      const testSchema = buildSchema(/* GraphQL */ `
        type Post {
          title: String
        }
        type Query {
          post: Post!
        }
      `);
      const query = parse(/* GraphQL */ `
        query Info {
          __type(name: "Post") {
            name
            fields {
              name
              type {
                name
                kind
              }
            }
          }
        }
      `);

      const coreContent = await tsPlugin(
        testSchema,
        [{ location: '', document: query }],
        {},
        {
          outputFile: 'graphql.ts',
        }
      );

      const pluginContent = await plugin(
        testSchema,
        [{ location: '', document: query }],
        {},
        {
          outputFile: 'graphql.ts',
        }
      );

      const content = mergeOutputs([coreContent, pluginContent]);

      expect(content).toBeSimilarStringTo(`
      /** An enum describing what kind of type a given \`__Type\` is. */
      export enum __TypeKind {
        /** Indicates this type is a scalar. */
        Scalar = 'SCALAR',
        /** Indicates this type is an object. \`fields\` and \`interfaces\` are valid fields. */
        Object = 'OBJECT',
        /** Indicates this type is an interface. \`fields\`, \`interfaces\`, and \`possibleTypes\` are valid fields. */
        Interface = 'INTERFACE',
        /** Indicates this type is a union. \`possibleTypes\` is a valid field. */
        Union = 'UNION',
        /** Indicates this type is an enum. \`enumValues\` is a valid field. */
        Enum = 'ENUM',
        /** Indicates this type is an input object. \`inputFields\` is a valid field. */
        InputObject = 'INPUT_OBJECT',
        /** Indicates this type is a list. \`ofType\` is a valid field. */
        List = 'LIST',
        /** Indicates this type is a non-null. \`ofType\` is a valid field. */
        NonNull = 'NON_NULL'
      }
      `);

      validateTs(content);
    });

    it('Should generate correctly when using enums and typesPrefix', async () => {
      const testSchema = buildSchema(/* GraphQL */ `
        enum Access {
          Read
          Write
          All
        }
        type User {
          access: Access
        }
        input Filter {
          match: String!
        }
        type Query {
          users(filter: Filter!): [User]
        }
      `);
      const query = parse(/* GraphQL */ `
        query users($filter: Filter!) {
          users(filter: $filter) {
            access
          }
        }
      `);

      const { content } = await plugin(
        testSchema,
        [{ location: '', document: query }],
        { typesPrefix: 'PREFIX_' },
        {
          outputFile: 'graphql.ts',
        }
      );

      expect(content).toBeSimilarStringTo(`
        export type PREFIX_UsersQueryVariables = Exact<{
          filter: PREFIX_Filter;
        }>;
      `);
      expect(content).toBeSimilarStringTo(`
        export type PREFIX_UsersQuery = (
          { __typename?: 'Query' }
          & { users?: Maybe<Array<Maybe<(
            { __typename?: 'User' }
            & Pick<PREFIX_User, 'access'>
          )>>> }
        );
      `);
    });

    it('Should make arguments optional when there is a default value', async () => {
      const testSchema = buildSchema(/* GraphQL */ `
        type User {
          name: String!
        }
        type Query {
          users(reverse: Boolean!): [User!]!
        }
      `);
      const query = parse(/* GraphQL */ `
        query users($reverse: Boolean = true) {
          users(reverse: $reverse) {
            name
          }
        }
      `);

      const { content } = await plugin(
        testSchema,
        [{ location: '', document: query }],
        {},
        {
          outputFile: 'graphql.ts',
        }
      );

      expect(content).toBeSimilarStringTo(`
        export type UsersQueryVariables = Exact<{
          reverse?: Maybe<Scalars['Boolean']>;
        }>;
      `);
    });
  });

  describe('Union & Interfaces', () => {
    it('should generate correct types for union that returns interface types', async () => {
      const schema = buildSchema(/* GraphQL */ `
        interface Error {
          message: String!
        }
        type Error1 implements Error {
          message: String!
        }
        type Error2 implements Error {
          message: String!
        }
        type Error3 implements Error {
          message: String!
        }
        type ComplexError implements Error {
          message: String!
          additionalInfo: String!
        }

        type FieldResultSuccess {
          someValue: Boolean!
        }

        union FieldResult = Error1 | Error2 | ComplexError | FieldResultSuccess

        type Query {
          field: FieldResult!
        }
      `);

      const query = parse(/* GraphQL */ `
        query field {
          field {
            __typename
            ... on Error {
              message
            }
            ... on ComplexError {
              additionalInfo
            }
            ... on FieldResultSuccess {
              someValue
            }
          }
        }
      `);

      const { content } = await plugin(
        schema,
        [{ location: '', document: query }],
        {},
        {
          outputFile: 'graphql.ts',
        }
      );
      expect(content).toBeSimilarStringTo(`
      export type FieldQuery = (
        { __typename?: 'Query' }
        & { field: (
          { __typename: 'Error1' }
          & Pick<Error1, 'message'>
        ) | (
          { __typename: 'Error2' }
          & Pick<Error2, 'message'>
        ) | (
          { __typename: 'ComplexError' }
          & Pick<ComplexError, 'message' | 'additionalInfo'>
        ) | (
          { __typename: 'FieldResultSuccess' }
          & Pick<FieldResultSuccess, 'someValue'>
        ) }
      );
      `);
    });

    it('should generate correct types for union that returns interface types (variant __typename in fragment)', async () => {
      const schema = buildSchema(/* GraphQL */ `
        interface Error {
          message: String!
        }
        type Error1 implements Error {
          message: String!
        }
        type Error2 implements Error {
          message: String!
        }
        type Error3 implements Error {
          message: String!
        }
        type ComplexError implements Error {
          message: String!
          additionalInfo: String!
        }

        type FieldResultSuccess {
          someValue: Boolean!
        }

        union FieldResult = Error1 | Error2 | ComplexError | FieldResultSuccess

        type Query {
          field: FieldResult!
        }
      `);

      const query = parse(/* GraphQL */ `
        query field {
          field {
            ... on Error {
              __typename
              message
            }
            ... on ComplexError {
              additionalInfo
            }
            ... on FieldResultSuccess {
              someValue
            }
          }
        }
      `);

      const { content } = await plugin(
        schema,
        [{ location: '', document: query }],
        {},
        {
          outputFile: 'graphql.ts',
        }
      );
      expect(content).toBeSimilarStringTo(`
        export type FieldQuery = (
          { __typename?: 'Query' }
          & { field: (
            { __typename: 'Error1' }
            & Pick<Error1, 'message'>
          ) | (
            { __typename: 'Error2' }
            & Pick<Error2, 'message'>
          ) | (
            { __typename: 'ComplexError' }
            & Pick<ComplexError, 'message' | 'additionalInfo'>
          ) | (
            { __typename?: 'FieldResultSuccess' }
            & Pick<FieldResultSuccess, 'someValue'>
          ) }
        );
      `);
    });
    it('interface with same field names', async () => {
      const testSchema = buildSchema(/* GraphQL */ `
        interface Node {
          id: ID!
        }

        type A implements Node {
          id: ID!
          a: String
        }

        type B implements Node {
          id: ID!
          a: Boolean
        }

        type Query {
          node: Node
        }
      `);

      const query = parse(/* GraphQL */ `
        query something {
          node {
            ... on A {
              a
            }

            ... on B {
              a
            }
          }
        }
      `);

      const { content } = await plugin(
        testSchema,
        [{ location: '', document: query }],
        {},
        {
          outputFile: 'graphql.ts',
        }
      );

      expect(content).toBeSimilarStringTo(`
        export type SomethingQuery = (
          { __typename?: 'Query' }
          & { node?: Maybe<(
            { __typename?: 'A' }
            & Pick<A, 'a'>
          ) | (
            { __typename?: 'B' }
            & Pick<B, 'a'>
          )> }
        );
      `);
    });
    it('union returning single interface types', async () => {
      const testSchema = buildSchema(/* GraphQL */ `
        interface Error {
          message: String!
        }
        type Error1 implements Error {
          message: String!
        }
        type Error2 implements Error {
          message: String!
        }
        type Error3 implements Error {
          message: String!
          info: AdditionalInfo
        }
        type AdditionalInfo {
          message: String!
        }
        type User {
          id: ID!
          login: String!
        }

        union UserResult = User | Error2 | Error3
        type Query {
          user: UserResult
        }
      `);

      const query = parse(/* GraphQL */ `
        query user {
          user {
            ... on User {
              id
              login
            }
            ... on Error {
              message
            }
            ... on Error3 {
              info {
                message
              }
            }
          }
        }
      `);

      const { content } = await plugin(
        testSchema,
        [{ location: '', document: query }],
        {},
        {
          outputFile: 'graphql.ts',
        }
      );

      expect(content).toBeSimilarStringTo(`
        export type UserQuery = (
          { __typename?: 'Query' }
          & { user?: Maybe<(
            { __typename?: 'User' }
            & Pick<User, 'id' | 'login'>
          ) | (
            { __typename?: 'Error2' }
            & Pick<Error2, 'message'>
          ) | (
            { __typename?: 'Error3' }
            & Pick<Error3, 'message'>
            & { info?: Maybe<(
              { __typename?: 'AdditionalInfo' }
              & Pick<AdditionalInfo, 'message'>
            )> }
          )> }
        );
      `);
    });

    it('duplicated fragment on type includes combined types only once', async () => {
      const testSchema = buildSchema(/* GraphQL */ `
        interface Error {
          message: String!
        }
        type Error1 implements Error {
          message: String!
        }
        type Error2 implements Error {
          message: String!
        }
        type Error3 implements Error {
          message: String!
          info: AdditionalInfo
        }
        type AdditionalInfo {
          message: String!
          message2: String!
        }
        type User {
          id: ID!
          login: String!
        }

        union UserResult = User | Error2 | Error3
        type Query {
          user: UserResult
        }
      `);

      const query = parse(/* GraphQL */ `
        query user {
          user {
            ... on User {
              id
              login
            }
            ... on Error {
              message
              ... on Error3 {
                info {
                  message
                  message2
                }
              }
            }
            ... on Error {
              ... on Error3 {
                info {
                  message
                  message2
                }
              }
            }
            ... on Error3 {
              info {
                message
              }
            }
          }
        }
      `);

      const { content } = await plugin(
        testSchema,
        [{ location: '', document: query }],
        {},
        {
          outputFile: 'graphql.ts',
        }
      );

      expect(content).toBeSimilarStringTo(`
        export type UserQuery = (
          { __typename?: 'Query' } 
          & { user?: Maybe<(
            { __typename?: 'User' }
            & Pick<User, 'id' | 'login'>
          ) | (
            { __typename?: 'Error2' }
            & Pick<Error2, 'message'>
          ) | (
            { __typename?: 'Error3' }
            & Pick<Error3, 'message'>
            & { info?: Maybe<(
                { __typename?: 'AdditionalInfo' }
                & Pick<AdditionalInfo, 'message' | 'message2'>
              )> }
          )> }
        );
      `);
    });

    it('Should merge inline fragments fields correctly', async () => {
      const testSchema = buildSchema(/* GraphQL */ `
        type User {
          id: ID!
          login: String!
        }

        type Query {
          user: User!
        }
      `);

      const query = parse(/* GraphQL */ `
        query UserQuery {
          user {
            ... on User {
              id
            }

            ... on User {
              login
            }
          }
        }
      `);

      const { content } = await plugin(
        testSchema,
        [{ location: '', document: query }],
        {},
        {
          outputFile: 'graphql.ts',
        }
      );

      const o = await validate(content, {}, testSchema);

      expect(o).toBeSimilarStringTo(`
      export type UserQueryQuery = (
        { __typename?: 'Query' }
        & { user: (
          { __typename?: 'User' }
          & Pick<User, 'id' | 'login'>
        ) }
      );
      `);
    });

    it('Should merge inline fragments fields correctly with fragment spread over the same type', async () => {
      const testSchema = buildSchema(/* GraphQL */ `
        type User {
          id: ID!
          login: String!
        }

        type Query {
          user: User!
        }
      `);

      const query = parse(/* GraphQL */ `
        query UserQuery {
          user {
            ... on User {
              id
            }

            ...test
          }
        }

        fragment test on User {
          login
        }
      `);

      const { content } = await plugin(
        testSchema,
        [{ location: '', document: query }],
        {},
        {
          outputFile: 'graphql.ts',
        }
      );

      const o = await validate(content, {}, testSchema);

      expect(o).toBeSimilarStringTo(`
      export type UserQueryQuery = (
        { __typename?: 'Query' }
        & { user: (
          { __typename?: 'User' }
          & Pick<User, 'id'>
          & TestFragment
        ) }
      );`);

      expect(o).toBeSimilarStringTo(`export type TestFragment = (
        { __typename?: 'User' }
        & Pick<User, 'login'>
      );`);
    });

    it('Should handle union selection sets with both FragmentSpreads and InlineFragments', async () => {
      const testSchema = buildSchema(/* GraphQL */ `
        interface Error {
          message: String!
        }
        type Error1 implements Error {
          message: String!
        }
        type Error2 implements Error {
          message: String!
        }
        type Error3 implements Error {
          message: String!
          info: AdditionalInfo
        }
        type AdditionalInfo {
          message: String!
          message2: String!
        }
        type User {
          id: ID!
          login: String!
        }

        union UserResult = User | Error2 | Error3

        type Query {
          user: UserResult!
        }
      `);

      const query = parse(/* GraphQL */ `
        query UserQuery {
          user {
            ...UserResult
            ...UserResult1
            ... on User {
              login
            }
            ... on Error3 {
              message
              info {
                ...AdditionalInfo
              }
            }
          }
        }

        fragment AdditionalInfo on AdditionalInfo {
          message
        }

        fragment UserResult1 on UserResult {
          ... on User {
            id
          }
          ... on Error3 {
            info {
              message2
            }
          }
        }

        fragment UserResult on UserResult {
          ... on User {
            id
          }
          ... on Error2 {
            message
          }
        }
      `);

      const { content } = await plugin(
        testSchema,
        [{ location: '', document: query }],
        {},
        {
          outputFile: 'graphql.ts',
        }
      );

      const output = await validate(
        content,
        {},
        testSchema,
        `
        function t(q: UserQueryQuery) {
            if (q.user) {
                if (q.user.__typename === 'User') {
                    if (q.user.id) {
                        const u = q.user.login;
                    }
                }
                if (q.user.__typename === 'Error2') {
                    console.log(q.user.message);
                }
                if (q.user.__typename === 'Error3') {
                    if (q.user.info) {
                        console.log(q.user.info.__typename)
                    }
                }
            }
        }`
      );
      expect(mergeOutputs([content])).toMatchSnapshot();

      expect(output).toBeSimilarStringTo(`
      export type UserQueryQuery = (
        { __typename?: 'Query' }
        & { user: (
          { __typename?: 'User' }
          & Pick<User, 'login'>
          & UserResult_User_Fragment
          & UserResult1_User_Fragment
        ) | (
          { __typename?: 'Error2' }
          & UserResult_Error2_Fragment
          & UserResult1_Error2_Fragment
        ) | (
          { __typename?: 'Error3' }
          & Pick<Error3, 'message'>
          & { info?: Maybe<(
            { __typename?: 'AdditionalInfo' }
            & AdditionalInfoFragment
          )> }
          & UserResult_Error3_Fragment
          & UserResult1_Error3_Fragment
        ) }
      );`);

      expect(output).toBeSimilarStringTo(`
      export type AdditionalInfoFragment = (
        { __typename?: 'AdditionalInfo' }
        & Pick<AdditionalInfo, 'message'>
      );
  
      type UserResult1_User_Fragment = (
        { __typename?: 'User' }
        & Pick<User, 'id'>
      );
  
      type UserResult1_Error2_Fragment = { __typename?: 'Error2' };
  
      type UserResult1_Error3_Fragment = (
        { __typename?: 'Error3' }
        & { info?: Maybe<(
          { __typename?: 'AdditionalInfo' }
          & Pick<AdditionalInfo, 'message2'>
        )> }
      );
  
      export type UserResult1Fragment = UserResult1_User_Fragment | UserResult1_Error2_Fragment | UserResult1_Error3_Fragment;
  
      type UserResult_User_Fragment = (
        { __typename?: 'User' }
        & Pick<User, 'id'>
      );
  
      type UserResult_Error2_Fragment = (
        { __typename?: 'Error2' }
        & Pick<Error2, 'message'>
      );
  
      type UserResult_Error3_Fragment = { __typename?: 'Error3' };
  
      export type UserResultFragment = UserResult_User_Fragment | UserResult_Error2_Fragment | UserResult_Error3_Fragment;`);
    });

    it('Should handle union selection sets with both FragmentSpreads and InlineFragments with flattenGeneratedTypes', async () => {
      const testSchema = buildSchema(/* GraphQL */ `
        interface Error {
          message: String!
        }
        type Error1 implements Error {
          message: String!
        }
        type Error2 implements Error {
          message: String!
        }
        type Error3 implements Error {
          message: String!
          info: AdditionalInfo
        }
        type AdditionalInfo {
          message: String!
          message2: String!
        }
        type User {
          id: ID!
          login: String!
        }

        union UserResult = User | Error2 | Error3

        type Query {
          user: UserResult!
        }
      `);

      const query = parse(/* GraphQL */ `
        query UserQuery {
          user {
            ...UserResult
            ...UserResult1
            ... on User {
              login
            }
            ... on Error3 {
              message
              info {
                ...AdditionalInfo
              }
            }
          }
        }

        fragment AdditionalInfo on AdditionalInfo {
          message
        }

        fragment UserResult1 on UserResult {
          ... on User {
            id
          }
          ... on Error3 {
            info {
              message2
            }
          }
        }

        fragment UserResult on UserResult {
          ... on User {
            id
          }
          ... on Error2 {
            message
          }
        }
      `);

      const config = {
        flattenGeneratedTypes: true,
      };

      const { content } = await plugin(testSchema, [{ location: '', document: query }], config, {
        outputFile: 'graphql.ts',
      });

      const output = await validate(
        content,
        config,
        testSchema,
        `
        function t(q: UserQueryQuery) {
            if (q.user) {
                if (q.user.__typename === 'User') {
                    if (q.user.id) {
                        const u = q.user.login;
                    }
                }
                if (q.user.__typename === 'Error2') {
                    console.log(q.user.message);
                }
                if (q.user.__typename === 'Error3') {
                    if (q.user.info) {
                        console.log(q.user.info.__typename)
                    }
                }
            }
        }`
      );
      expect(mergeOutputs([output])).toMatchSnapshot();

      expect(output).toBeSimilarStringTo(`
      export type UserQueryQuery = (
        { __typename?: 'Query' }
        & { user: (
          { __typename?: 'User' }
          & Pick<User, 'id' | 'login'>
        ) | (
          { __typename?: 'Error2' }
          & Pick<Error2, 'message'>
        ) | (
          { __typename?: 'Error3' }
          & Pick<Error3, 'message'>
          & { info?: Maybe<(
            { __typename?: 'AdditionalInfo' }
            & Pick<AdditionalInfo, 'message2' | 'message'>
          )> }
        ) }
      );
      `);
    });

    it('Should handle union selection sets with both FragmentSpreads and InlineFragments with flattenGeneratedTypes and directives', async () => {
      const testSchema = buildSchema(/* GraphQL */ `
        interface Error {
          message: String!
        }
        type Error1 implements Error {
          message: String!
        }
        type Error2 implements Error {
          message: String!
        }
        type Error3 implements Error {
          message: String!
          info: AdditionalInfo
        }
        type AdditionalInfo {
          message: String!
          message2: String!
        }
        type User {
          id: ID!
          login: String!
          test: String
          test2: String
        }

        union UserResult = User | Error2 | Error3

        type Query {
          user: UserResult!
        }

        directive @client on FIELD
        directive @connection on FIELD
      `);

      const query = parse(/* GraphQL */ `
        query UserQuery {
          user {
            ...UserResult
            ...UserResult1
            ... on User {
              login
              test @client
            }
            ... on Error3 {
              message
              info {
                ...AdditionalInfo
              }
            }
          }
        }

        fragment AdditionalInfo on AdditionalInfo {
          message
        }

        fragment UserResult1 on UserResult {
          ... on User {
            id
            test2 @connection
          }
          ... on Error3 {
            info {
              message2
            }
          }
        }

        fragment UserResult on UserResult {
          ... on User {
            id
          }
          ... on Error2 {
            message
          }
        }
      `);

      const config = {
        flattenGeneratedTypes: true,
      };

      const { content } = await plugin(testSchema, [{ location: '', document: query }], config, {
        outputFile: 'graphql.ts',
      });

      const output = await validate(
        content,
        config,
        testSchema,
        `
        function t(q: UserQueryQuery) {
            if (q.user) {
                if (q.user.__typename === 'User') {
                    if (q.user.id) {
                        const u = q.user.login;
                    }
                }
                if (q.user.__typename === 'Error2') {
                    console.log(q.user.message);
                }
                if (q.user.__typename === 'Error3') {
                    if (q.user.info) {
                        console.log(q.user.info.__typename)
                    }
                }
            }
        }`
      );
      expect(mergeOutputs([output])).toMatchSnapshot();

      expect(output).toBeSimilarStringTo(`
      export type UserQueryQuery = (
        { __typename?: 'Query' }
        & { user: (
          { __typename?: 'User' }
          & Pick<User, 'id' | 'test2' | 'login' | 'test'>
        ) | (
          { __typename?: 'Error2' }
          & Pick<Error2, 'message'>
        ) | (
          { __typename?: 'Error3' }
          & Pick<Error3, 'message'>
          & { info?: Maybe<(
            { __typename?: 'AdditionalInfo' }
            & Pick<AdditionalInfo, 'message2' | 'message'>
          )> }
        ) }
      );
      `);
    });
  });

  describe('Issues', () => {
    it('#3064 - fragments over interfaces causes issues with fields', async () => {
      const testSchema = buildSchema(/* GraphQL */ `
        interface Venue {
          id: String!
          name: String!
        }

        type GPSPosition {
          lat: Float!
          lng: Float!
        }

        interface VenueWithPosition {
          id: String!
          gpsPosition: GPSPosition!
        }

        type Hotel implements VenueWithPosition & Venue {
          id: String!
          gpsPosition: GPSPosition!
          name: String!
        }

        type Transport implements Venue {
          id: String!
          name: String!
        }

        type Query {
          hotel: Hotel!
          transport: Transport!
        }
      `);

      const query = parse(/* GraphQL */ `
        fragment venue on Venue {
          id
          ... on VenueWithPosition {
            gpsPosition {
              lat
              lng
            }
          }
        }

        query q {
          hotel {
            ...venue
          }
          transport {
            ...venue
          }
        }
      `);

      const config = {};

      const { content } = await plugin(testSchema, [{ location: '', document: query }], config, {
        outputFile: 'graphql.ts',
      });

      expect(content).toMatchSnapshot();

      const result = await validate(
        content,
        {},
        testSchema,
        `function test(q: QQuery) {
        if (q.hotel) {
            const t1 = q.hotel.gpsPosition.lat
        }
        
        if (q.transport) {
            const t2 = q.transport.id;
        }
    }`
      );
      expect(mergeOutputs([result])).toMatchSnapshot();
    });

    it('#2916 - Missing import prefix with preResolveTypes: true and near-operation-file preset', async () => {
      const testSchema = buildSchema(/* GraphQL */ `
        type Query {
          user(id: ID!): User!
        }

        enum Department {
          Direction
          Development
        }

        type User {
          id: ID!
          username: String!
          email: String!
          department: Department!
        }
      `);

      const query = parse(/* GraphQL */ `
        query user {
          user(id: 1) {
            id
            username
            email
            dep: department
          }
        }
      `);

      const config = {
        skipTypename: true,
        preResolveTypes: true,
        namespacedImportName: 'Types',
      };

      const { content } = await plugin(testSchema, [{ location: '', document: query }], config, {
        outputFile: 'graphql.ts',
      });

      expect(content).toContain(`dep: Types.Department`);
      expect(content).toMatchSnapshot();
    });

    it('#2699 - Issues with multiple interfaces and unions', async () => {
      const testSchema = buildSchema(/* GraphQL */ `
        interface Node {
          id: ID!
        }

        scalar DateTime

        interface Element {
          active: Boolean!
          createdAt: DateTime!
          createdBy: User
          updatedAt: DateTime!
          updatedBy: User
        }

        interface Entity {
          brandData(brand: ID!): EntityBrandData
        }

        type EntityBrandData {
          active: Boolean!
          browsable: Boolean!
          description: String!
          alternateTitle: String
          title: String!
        }

        type Query {
          node(id: ID!): Node!
        }

        type Company implements Element & Node & Entity {
          active: Boolean!
          createdAt: DateTime!
          createdBy: User
          updatedAt: DateTime!
          updatedBy: User
          id: ID!
          brandData(brand: ID!): EntityBrandData
        }

        type Theater implements Element & Node & Entity {
          active: Boolean!
          createdAt: DateTime!
          createdBy: User
          updatedAt: DateTime!
          updatedBy: User
          id: ID!
          brandData(brand: ID!): EntityBrandData
        }

        type Movie implements Element & Node & Entity {
          active: Boolean!
          createdAt: DateTime!
          createdBy: User
          updatedAt: DateTime!
          updatedBy: User
          id: ID!
          brandData(brand: ID!): EntityBrandData
        }

        type User implements Element & Node & Entity {
          active: Boolean!
          name: String!
          createdAt: DateTime!
          createdBy: User
          updatedAt: DateTime!
          updatedBy: User
          id: ID!
          brandData(brand: ID!): EntityBrandData
        }
      `);

      const query = parse(/* GraphQL */ `
        query getEntityBrandData($gid: ID!, $brand: ID!) {
          node(gid: $gid) {
            __typename
            id
            ... on Entity {
              ...EntityBrandData
            }
            ... on Element {
              ...ElementMetadata
            }
            ... on Company {
              active
            }
            ... on Theater {
              active
            }
          }
        }

        fragment EntityBrandData on Entity {
          brandData(brand: $brand) {
            active
            browsable
            title
            alternateTitle
            description
          }
        }

        fragment ElementMetadata on Element {
          createdAt
          createdBy {
            id
            name
          }
          updatedAt
          updatedBy {
            id
            name
          }
        }
      `);

      const { content } = await plugin(
        testSchema,
        [{ location: '', document: query }],
        {},
        {
          outputFile: 'graphql.ts',
        }
      );

      expect(mergeOutputs([content])).toMatchSnapshot();

      await validate(
        content,
        {},
        testSchema,
        `
function test(q: GetEntityBrandDataQuery): void {
  const typeName: 'Company' | 'Theater' | 'User' | 'Movie' = q.node.__typename; // just to check that those are the types we want here
  const brandData = q.node.brandData; // this was missing in the original issue
  const createdAt = q.node.createdAt; // this was missing in the original issue

  if (q.node.__typename === 'Company') {
    console.log('Company:', q.node.active);
  } else if (q.node.__typename === 'Theater') {
    console.log('Theater:', q.node.active);
  } else if (q.node.__typename === 'User') {
    console.log('User:', q.node.id);
  } else if (q.node.__typename === 'Movie') {
    console.log('Movie:', q.node.id);
  }
}`
      );
    });

    it('#1624 - Should work with fragment on union type', async () => {
      const testSchema = buildSchema(/* GraphQL */ `
        type Query {
          fooBar: [FooBar!]!
        }

        union FooBar = Foo | Bar

        type Foo {
          id: ID!
        }

        type Bar {
          id: ID!
        }
      `);

      const query = parse(/* GraphQL */ `
        query TestQuery {
          fooBar {
            ...FooBarFragment
          }
        }

        fragment FooBarFragment on FooBar {
          ... on Foo {
            id
          }
          ... on Bar {
            id
          }
        }
      `);

      const { content } = await plugin(
        testSchema,
        [{ location: '', document: query }],
        {},
        {
          outputFile: 'graphql.ts',
        }
      );

      expect(content).toBeSimilarStringTo(`
      export type TestQueryQuery = (
        { __typename?: 'Query' }
        & { fooBar: Array<( { __typename?: 'Foo' } & FooBarFragment_Foo_Fragment ) | ( { __typename?: 'Bar' } & FooBarFragment_Bar_Fragment )> }
      );

      type FooBarFragment_Foo_Fragment = (
        { __typename?: 'Foo' }
        & Pick<Foo, 'id'>
      );

      type FooBarFragment_Bar_Fragment = (
        { __typename?: 'Bar' }
        & Pick<Bar, 'id'>
      );

      export type FooBarFragmentFragment = FooBarFragment_Foo_Fragment | FooBarFragment_Bar_Fragment;
      `);
    });

    it('#2407 Fragment on Fragment Spread on Union type', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type Price {
          id: ID!
          item: [PriceItemUnion]!
        }

        type Product {
          id: ID!
          title: String!
        }

        union PriceItemUnion = Product

        type Query {
          price: Price!
        }
      `);

      const productFragmentDocument = parse(/* GraphQL */ `
        fragment ProductFragment on Product {
          id
          title
        }
      `);

      const priceFragmentDocument = parse(/* GraphQL */ `
        fragment PriceFragment on Price {
          id
          item {
            ... on Product {
              ...ProductFragment
            }
          }
        }
      `);

      const { content } = await plugin(
        schema,
        [
          { location: '', document: productFragmentDocument },
          { location: '', document: priceFragmentDocument },
        ],
        {},
        {
          outputFile: 'graphql.ts',
        }
      );

      expect(content).toBeSimilarStringTo(`
      export type ProductFragmentFragment = (
        { __typename?: 'Product' }
        & Pick<Product, 'id' | 'title'>
      );

        export type PriceFragmentFragment = (
          { __typename?: 'Price' }
          & Pick<Price, 'id'>
          & { item: Array<Maybe<(
            { __typename?: 'Product' }
            & ProductFragmentFragment
          )>> }
        );
      `);
    });

    it('#2506 - inline fragment without typeCondition specified', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type Query {
          user: User
        }

        type User {
          name: String
        }
      `);

      const fragment = parse(/* GraphQL */ `
        query user($withUser: Boolean! = false) {
          ... @include(if: $withUser) {
            user {
              name
            }
          }
        }
      `);

      const { content } = await plugin(
        schema,
        [{ location: '', document: fragment }],
        {},
        {
          outputFile: 'graphql.ts',
        }
      );

      expect(content).toBeSimilarStringTo(`
      export type UserQuery = (
        { __typename?: 'Query' }
        & { user?: Maybe<(
          { __typename?: 'User' }
          & Pick<User, 'name'>
        )> }
      );`);
    });

    it('#2436 - interface with field of same name but different type is correctly handled', async () => {
      const schema = buildSchema(/* GraphQL */ `
        interface DashboardTile {
          tileId: ID!
        }
        type TileFilterMetadata {
          viz: String!
          columnInfo: String!
        }
        type DashboardTileFilterDetails implements DashboardTile {
          tileId: ID!
          md: TileFilterMetadata!
        }
        type TileParameterMetadata {
          viz: String!
          columnInfo: String!
        }
        type DashboardTileParameterDetails implements DashboardTile {
          tileId: ID!
          md: TileParameterMetadata!
        }
        type DashboardVersion {
          id: ID!
          tiles: DashboardTile!
        }
      `);

      const fragment = parse(/* GraphQL */ `
        fragment DashboardVersionFragment on DashboardVersion {
          tiles {
            ... on DashboardTileFilterDetails {
              tileId
              md {
                viz
                columnInfo
              }
            }
            ... on DashboardTileParameterDetails {
              tileId
              md {
                viz
                columnInfo
              }
            }
          }
        }
      `);

      const { content } = await plugin(
        schema,
        [{ location: '', document: fragment }],
        {},
        {
          outputFile: 'graphql.ts',
        }
      );

      expect(content).toBeSimilarStringTo(`
        export type DashboardVersionFragmentFragment = (
          { __typename?: 'DashboardVersion' }
          & { tiles: (
            { __typename?: 'DashboardTileFilterDetails' }
            & Pick<DashboardTileFilterDetails, 'tileId'>
            & { md: (
              { __typename?: 'TileFilterMetadata' }
              & Pick<TileFilterMetadata, 'viz' | 'columnInfo'>
            ) }
          ) | (
            { __typename?: 'DashboardTileParameterDetails' }
            & Pick<DashboardTileParameterDetails, 'tileId'>
            & { md: (
              { __typename?: 'TileParameterMetadata' }
              & Pick<TileParameterMetadata, 'viz' | 'columnInfo'>
            ) }
          ) }
        );
      `);
    });

    it('#2436 - union with field of same name but different type is correctly handled', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type TileFilterMetadata {
          viz: String!
          columnInfo: String!
        }
        type DashboardTileFilterDetails {
          tileId: ID!
          md: TileFilterMetadata!
        }
        type TileParameterMetadata {
          viz: String!
          columnInfo: String!
        }
        type DashboardTileParameterDetails {
          tileId: ID!
          md: TileParameterMetadata!
        }
        union DashboardTile = DashboardTileFilterDetails | DashboardTileParameterDetails

        type DashboardVersion {
          id: ID!
          tiles: DashboardTile!
        }
      `);

      const fragment = parse(/* GraphQL */ `
        fragment DashboardVersionFragment on DashboardVersion {
          tiles {
            ... on DashboardTileFilterDetails {
              tileId
              md {
                viz
                columnInfo
              }
            }
            ... on DashboardTileParameterDetails {
              tileId
              md {
                viz
                columnInfo
              }
            }
          }
        }
      `);

      const { content } = await plugin(
        schema,
        [{ location: '', document: fragment }],
        {},
        {
          outputFile: 'graphql.ts',
        }
      );

      expect(content).toBeSimilarStringTo(`
        export type DashboardVersionFragmentFragment = (
          { __typename?: 'DashboardVersion' }
          & { tiles: (
            { __typename?: 'DashboardTileFilterDetails' }
            & Pick<DashboardTileFilterDetails, 'tileId'>
            & { md: (
              { __typename?: 'TileFilterMetadata' }
              & Pick<TileFilterMetadata, 'viz' | 'columnInfo'>
            ) }
          ) | (
            { __typename?: 'DashboardTileParameterDetails' }
            & Pick<DashboardTileParameterDetails, 'tileId'>
            & { md: (
              { __typename?: 'TileParameterMetadata' }
              & Pick<TileParameterMetadata, 'viz' | 'columnInfo'>
            ) }
          ) }
        );
      `);
    });

    it('#2489 - Union that only covers one possible type with selection set and no typename', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type NotFoundError {
          message: String!
        }
        type UserBannedError {
          message: String!
        }
        type User {
          id: ID!
          login: String
        }
        union UserResult = NotFoundError | UserBannedError | User

        type Query {
          user: UserResult!
        }
      `);

      const query = parse(/* GraphQL */ `
        query user {
          user {
            ... on User {
              id
              login
            }
          }
        }
      `);
      const { content } = await plugin(
        schema,
        [{ location: '', document: query }],
        {
          skipTypename: true,
        },
        {
          outputFile: 'graphql.ts',
        }
      );

      expect(content).toBeSimilarStringTo(`
        export type UserQuery = { user: Pick<User, 'id' | 'login'> };
      `);
    });
  });
});
