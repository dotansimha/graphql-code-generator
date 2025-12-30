import { mergeOutputs, Types } from '@graphql-codegen/plugin-helpers';
import { validateTs } from '@graphql-codegen/testing';
import { buildClientSchema, buildSchema, parse } from 'graphql';
import { plugin } from '../src/index.js';
import { schema } from './shared/schema.js';

describe('TypeScript Operations Plugin', () => {
  const gitHuntSchema = buildClientSchema(require('../../../../../dev-test/githunt/schema.json'));

  const validate = async (content: Types.PluginOutput, usage = '', suspenseErrors = []) => {
    const m = mergeOutputs([content, usage]);
    validateTs(m, undefined, undefined, undefined, suspenseErrors);

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
      const config = { noExport: true, preResolveTypes: false };
      const { content } = await plugin(schema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });

      expect(content).not.toContain('export');
      await validate(content);
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
      const config = { preResolveTypes: false, namespacedImportName: 'Types' };
      const { content } = await plugin(schema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });

      expect(content).toMatchInlineSnapshot(`
        "export type NotificationsQueryVariables = Exact<{ [key: string]: never; }>;


        export type NotificationsQuery = { notifications: Array<
            | (
              Pick<Types.TextNotification, 'text' | 'id'>
              & { textAlias: Types.TextNotification['text'] }
            )
            | (
              Pick<Types.ImageNotification, 'imageUrl' | 'id'>
              & { metadata: { created: Types.ImageMetadata['createdBy'] } }
            )
          > };
        "
      `);
      await validate(content, '', [`Cannot find namespace 'Types'.`]);
    });

    it('Can merge an inline fragment with a spread', async () => {
      const testSchema = buildSchema(/* GraphQL */ `
        interface Comment {
          id: ID!
          title: String!
        }

        type TextComment implements Comment {
          id: ID!
          title: String!
          text: String!
        }

        type ImageComment implements Comment {
          id: ID!
          title: String!
          image: String!
        }

        type Post {
          id: ID!
          comments: [Comment!]!
        }
      `);

      const ast = parse(/* GraphQL */ `
        fragment Post on Post {
          id
          comments {
            ... on TextComment {
              text
            }
          }
        }

        fragment PostPlus on Post {
          ...Post
          comments {
            id
          }
        }
      `);

      const { content } = await plugin(
        testSchema,
        [{ location: 'test-file.ts', document: ast }],
        {},
        {
          outputFile: '',
        }
      );
      expect(content).toMatchInlineSnapshot(`
        "export type PostFragment = { id: string, comments: Array<
            | { text: string }
            | Record<PropertyKey, never>
          > };

        export type PostPlusFragment = { id: string, comments: Array<
            | { text: string, id: string }
            | { id: string }
          > };
        "
      `);
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

      expect(content).toMatchInlineSnapshot(
        `
        "export type E =
          | 'A'
          | 'B';

        export type TestQueryVariables = Exact<{ [key: string]: never; }>;


        export type TestQuery = { f: Types.E | null, user: { id: string, f: Types.E | null, j: any | null } };
        "
      `
      );

      await validate(content, '', [`Cannot find namespace 'Types'.`]);
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
      const config = { preResolveTypes: false, namingConvention: 'change-case-all#lowerCase', immutableTypes: true };
      const { content } = await plugin(schema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });

      expect(content).toMatchInlineSnapshot(`
        "export type notificationsqueryvariables = Exact<{ [key: string]: never; }>;


        export type notificationsquery = { readonly notifications: ReadonlyArray<
            | Pick<textnotification, 'text' | 'id'>
            | (
              Pick<imagenotification, 'imageUrl' | 'id'>
              & { readonly metadata: Pick<imagemetadata, 'createdBy'> }
            )
          > };
        "
      `);
      await validate(content);
    });

    it('should include fragment variable definitions when experimentalFragmentVariables is set', async () => {
      const ast = parse(
        /* GraphQL */ `
          fragment TextNotificationFragment($skip: Boolean!) on TextNotification {
            text @skip(if: $skip)
          }
        `,
        // < v15 compatibility
        { experimentalFragmentVariables: true, allowLegacyFragmentVariables: true } as any
      );
      const config = { experimentalFragmentVariables: true };
      const { content } = await plugin(schema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });
      expect(content).toMatchSnapshot();
    });

    it('should resolve optionals according to maybeValue', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type Query {
          user: User!
        }

        type User {
          name: String!
          age: Int
          address: String!
          nicknames: [String!]
          parents: [User!]!
        }
      `);

      const fragment = parse(/* GraphQL */ `
        query user($showProperty: Boolean!) {
          user {
            name
            age
            address @include(if: $showProperty)
            nicknames @include(if: $showProperty)
            parents @include(if: $showProperty)
          }
        }
      `);

      const { content } = await plugin(
        schema,
        [{ location: '', document: fragment }],
        {
          preResolveTypes: true,
          maybeValue: "T | 'specialType'",
        },
        {
          outputFile: 'graphql.ts',
        }
      );
      expect(content).toMatchInlineSnapshot(`
        "export type UserQueryVariables = Exact<{
          showProperty: boolean;
        }>;


        export type UserQuery = { user: { name: string, age: number | 'specialType', address?: string, nicknames?: Array<string> | 'specialType', parents?: Array<User> } };
        "
      `);
    });

    it('should add undefined as possible value according to allowUndefinedQueryVariables', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type Query {
          user: User!
        }

        type User {
          name: String!
          age: Int
          address: String!
          nicknames: [String!]
          parents: [User!]!
        }
      `);

      const fragment = parse(/* GraphQL */ `
        query user($showProperty: Boolean!) {
          user {
            name
            age
            address @include(if: $showProperty)
            nicknames @include(if: $showProperty)
            parents @include(if: $showProperty)
          }
        }
      `);

      const { content } = await plugin(
        schema,
        [{ location: '', document: fragment }],
        {
          preResolveTypes: true,
          allowUndefinedQueryVariables: true,
        },
        {
          outputFile: 'graphql.ts',
        }
      );

      expect(content).toMatchInlineSnapshot(`
        "export type UserQueryVariables = Exact<{
          showProperty: boolean;
        }> | undefined;


        export type UserQuery = { user: { name: string, age: number | null, address?: string, nicknames?: Array<string> | null, parents?: Array<User> } };
        "
      `);
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
      const config = { preResolveTypes: false };
      const { content } = await plugin(testSchema, [{ location: 'test-file.ts', document: doc }], config, {
        outputFile: '',
      });
      expect(content).toContain(`Pick<User, 'id' | 'joinDate'>`);
      await validate(content);
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
      const config = { operationResultSuffix: 'Result', preResolveTypes: false };
      const { content } = await plugin(schema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });

      expect(content).toMatchInlineSnapshot(
        `
        "export type NotificationsQueryVariables = Exact<{ [key: string]: never; }>;


        export type NotificationsQueryResult = { notifications: Array<
            | Pick<TextNotification, 'text' | 'id'>
            | (
              Pick<ImageNotification, 'imageUrl' | 'id'>
              & { metadata: Pick<ImageMetadata, 'createdBy'> }
            )
          > };
        "
      `
      );
      expect(content).toMatchInlineSnapshot(`
        "export type NotificationsQueryVariables = Exact<{ [key: string]: never; }>;


        export type NotificationsQueryResult = { notifications: Array<
            | Pick<TextNotification, 'text' | 'id'>
            | (
              Pick<ImageNotification, 'imageUrl' | 'id'>
              & { metadata: Pick<ImageMetadata, 'createdBy'> }
            )
          > };
        "
      `);

      await validate(content);
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
      const config = { preResolveTypes: false, namingConvention: 'change-case-all#lowerCase' };
      const { content } = await plugin(schema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });

      expect(content).toMatchInlineSnapshot(`
        "export type notificationsqueryvariables = Exact<{ [key: string]: never; }>;


        export type notificationsquery = { notifications: Array<
            | Pick<textnotification, 'text' | 'id'>
            | (
              Pick<imagenotification, 'imageUrl' | 'id'>
              & { metadata: Pick<imagemetadata, 'createdBy'> }
            )
          > };
        "
      `);
      await validate(content);
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

      const config = { preResolveTypes: false, typesPrefix: 'i', namingConvention: 'change-case-all#lowerCase' };
      const { content } = await plugin(schema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });

      expect(content).toMatchInlineSnapshot(
        `
        "export type inotificationsqueryvariables = Exact<{ [key: string]: never; }>;


        export type inotificationsquery = { notifications: Array<
            | Pick<itextnotification, 'text' | 'id'>
            | (
              Pick<iimagenotification, 'imageUrl' | 'id'>
              & { metadata: Pick<iimagemetadata, 'createdBy'> }
            )
          > };
        "
      `
      );
      expect(content).toMatchInlineSnapshot(`
        "export type inotificationsqueryvariables = Exact<{ [key: string]: never; }>;


        export type inotificationsquery = { notifications: Array<
            | Pick<itextnotification, 'text' | 'id'>
            | (
              Pick<iimagenotification, 'imageUrl' | 'id'>
              & { metadata: Pick<iimagemetadata, 'createdBy'> }
            )
          > };
        "
      `);
      await validate(content);
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
          { dedupeOperationSuffix: true, preResolveTypes: false },
          { outputFile: '' }
        )
      ).content;
      expect(withUsage).toMatchInlineSnapshot(`
        "export type NotificationsQueryVariables = Exact<{ [key: string]: never; }>;


        export type NotificationsQuery = { notifications: Array<
            | Pick<TextNotification, 'id'>
            | Pick<ImageNotification, 'id'>
          > };

        export type MyFragment = { notifications: Array<
            | Pick<TextNotification, 'id'>
            | Pick<ImageNotification, 'id'>
          > };
        "
      `);
      expect(withUsage).toMatchInlineSnapshot(`
        "export type NotificationsQueryVariables = Exact<{ [key: string]: never; }>;


        export type NotificationsQuery = { notifications: Array<
            | Pick<TextNotification, 'id'>
            | Pick<ImageNotification, 'id'>
          > };

        export type MyFragment = { notifications: Array<
            | Pick<TextNotification, 'id'>
            | Pick<ImageNotification, 'id'>
          > };
        "
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
      (
        await plugin(
          schema,
          [{ location: 'test-file.ts', document: ast }],
          { preResolveTypes: false },
          { outputFile: '' }
        )
      ).content
    ).toContain('export type NotificationsQueryQuery =');
    expect(
      (
        await plugin(
          schema,
          [{ location: 'test-file.ts', document: ast }],
          { preResolveTypes: false },
          { outputFile: '' }
        )
      ).content
    ).toContain('export type MyFragmentFragment =');
    expect(
      (
        await plugin(
          schema,
          [{ location: 'test-file.ts', document: ast }],
          { omitOperationSuffix: true, preResolveTypes: false },
          { outputFile: '' }
        )
      ).content
    ).toContain('export type NotificationsQuery =');
    expect(
      (
        await plugin(
          schema,
          [{ location: 'test-file.ts', document: ast }],
          { omitOperationSuffix: true, preResolveTypes: false },
          { outputFile: '' }
        )
      ).content
    ).toContain('export type MyFragment =');
    expect(
      (
        await plugin(
          schema,
          [{ location: 'test-file.ts', document: ast2 }],
          { omitOperationSuffix: true, preResolveTypes: false },
          { outputFile: '' }
        )
      ).content
    ).toContain('export type Notifications =');
    expect(
      (
        await plugin(
          schema,
          [{ location: 'test-file.ts', document: ast2 }],
          { omitOperationSuffix: true, preResolveTypes: false },
          { outputFile: '' }
        )
      ).content
    ).toContain('export type My =');
    expect(
      (
        await plugin(
          schema,
          [{ location: 'test-file.ts', document: ast2 }],
          { omitOperationSuffix: false, preResolveTypes: false },
          { outputFile: '' }
        )
      ).content
    ).toContain('export type NotificationsQuery =');
    expect(
      (
        await plugin(
          schema,
          [{ location: 'test-file.ts', document: ast2 }],
          { omitOperationSuffix: false, preResolveTypes: false },
          { outputFile: '' }
        )
      ).content
    ).toContain('export type MyFragment =');

    const withUsage = (
      await plugin(
        schema,
        [{ location: 'test-file.ts', document: ast3 }],
        { omitOperationSuffix: true, preResolveTypes: false },
        { outputFile: '' }
      )
    ).content;
    expect(withUsage).toMatchInlineSnapshot(`
      "export type NotificationsVariables = Exact<{ [key: string]: never; }>;


      export type Notifications = { notifications: Array<
          | Pick<TextNotification, 'id'>
          | Pick<ImageNotification, 'id'>
        > };

      export type My = { notifications: Array<
          | Pick<TextNotification, 'id'>
          | Pick<ImageNotification, 'id'>
        > };
      "
    `);
    expect(withUsage).toMatchInlineSnapshot(`
      "export type NotificationsVariables = Exact<{ [key: string]: never; }>;


      export type Notifications = { notifications: Array<
          | Pick<TextNotification, 'id'>
          | Pick<ImageNotification, 'id'>
        > };

      export type My = { notifications: Array<
          | Pick<TextNotification, 'id'>
          | Pick<ImageNotification, 'id'>
        > };
      "
    `);
  });

  describe('__typename', () => {
    it('Should ignore __typename for root types with skipTypeNameForRoot = true', async () => {
      const testSchema = buildSchema(/* GraphQL */ `
        type Test {
          foo: String
        }

        type Query {
          test: Test
        }
      `);
      const ast = parse(/* GraphQL */ `
        query q1 {
          test {
            foo
          }
        }
      `);
      const config = {
        skipTypeNameForRoot: true,
        preResolveTypes: false,
      };
      const { content } = await plugin(testSchema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });

      expect(content).toMatchInlineSnapshot(
        `
        "export type Q1QueryVariables = Exact<{ [key: string]: never; }>;


        export type Q1Query = { test: Maybe<Pick<Test, 'foo'>> };
        "
      `
      );
      await validate(content);
    });

    it('Should ignore __typename for root types with skipTypeNameForRoot = true, and with nonOptionalTypename = true', async () => {
      const testSchema = buildSchema(/* GraphQL */ `
        type Test {
          foo: String
        }

        type Query {
          test: Test
        }
      `);
      const ast = parse(/* GraphQL */ `
        query q1 {
          test {
            foo
          }
        }
      `);
      const config = {
        nonOptionalTypename: true,
        skipTypeNameForRoot: true,
        preResolveTypes: false,
      };
      const { content } = await plugin(testSchema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });

      expect(content).toMatchInlineSnapshot(
        `
        "export type Q1QueryVariables = Exact<{ [key: string]: never; }>;


        export type Q1Query = { test: Maybe<(
            { __typename: 'Test' }
            & Pick<Test, 'foo'>
          )> };
        "
      `
      );
      await validate(content);
    });

    it('Should ignore skipTypeNameForRoot = true when __typename is specified manually', async () => {
      const testSchema = buildSchema(/* GraphQL */ `
        type Test {
          foo: String
        }

        type Query {
          test: Test
        }
      `);
      const ast = parse(/* GraphQL */ `
        query q1 {
          __typename
          test {
            foo
          }
        }
      `);
      const config = {
        nonOptionalTypename: true,
        skipTypeNameForRoot: true,
        preResolveTypes: false,
      };
      const { content } = await plugin(testSchema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });

      expect(content).toMatchInlineSnapshot(
        `
        "export type Q1QueryVariables = Exact<{ [key: string]: never; }>;


        export type Q1Query = (
          { __typename: 'Query' }
          & { test: Maybe<(
            { __typename: 'Test' }
            & Pick<Test, 'foo'>
          )> }
        );
        "
      `
      );
      await validate(content);
    });

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
      };
      const { content } = await plugin(testSchema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });

      expect(content).toContain(
        `\
export type Q1Query = { search: Array<
    | { __typename: 'Movie', id: string, title: string }
    | { __typename: 'Person', id: string, name: string }
  > };`
      );
      expect(content).toContain(
        `\
export type Q2Query = { search: Array<
    | { __typename: 'Movie', id: string, title: string }
    | { __typename: 'Person', id: string, name: string }
  > };`
      );
      await validate(content);
    });

    it('Should skip __typename when skipTypename is set to true', async () => {
      const ast = parse(/* GraphQL */ `
        query {
          dummy
        }
      `);
      const config = { skipTypename: true, preResolveTypes: false };
      const { content } = await plugin(schema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });

      expect(content).not.toContain(`__typename`);
      await validate(content);
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
      const config = { preResolveTypes: false };
      const { content } = await plugin(testSchema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });
      expect(content).toMatchInlineSnapshot(`
        "type Node_A_Fragment = (
          { __typename: 'A' }
          & Pick<A, 'id'>
        );

        type Node_B_Fragment = (
          { __typename: 'B' }
          & Pick<B, 'id'>
        );

        export type NodeFragment =
          | Node_A_Fragment
          | Node_B_Fragment
        ;

        export type TestQueryVariables = Exact<{ [key: string]: never; }>;


        export type TestQuery = { some: Maybe<
            | (
              { __typename: 'A' }
              & Pick<A, 'id'>
            )
            | (
              { __typename: 'B' }
              & Pick<B, 'id'>
            )
          > };
        "
      `);
      await validate(content);
    });

    it('Should add aliased __typename correctly', async () => {
      const ast = parse(/* GraphQL */ `
        query {
          type: __typename
          dummy
        }
      `);
      const config = { preResolveTypes: false };
      const { content } = await plugin(schema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });
      expect(content).toMatchInlineSnapshot(`
        "export type Unnamed_1_QueryVariables = Exact<{ [key: string]: never; }>;


        export type Unnamed_1_Query = (
          Pick<Query, 'dummy'>
          & { type: 'Query' }
        );
        "
      `);
      await validate(content);
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
      expect(content).toMatchInlineSnapshot(`
        "export type Unnamed_1_QueryVariables = Exact<{ [key: string]: never; }>;


        export type Unnamed_1_Query = { dummy: string | null, type: 'Query' };
        "
      `);
      await validate(content);
    });

    it('Should add __typename as non-optional when explicitly specified', async () => {
      const ast = parse(/* GraphQL */ `
        query {
          __typename
          dummy
        }
      `);
      const config = { preResolveTypes: false };
      const { content } = await plugin(schema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });
      expect(content).toMatchInlineSnapshot(`
        "export type Unnamed_1_QueryVariables = Exact<{ [key: string]: never; }>;


        export type Unnamed_1_Query = (
          { __typename: 'Query' }
          & Pick<Query, 'dummy'>
        );
        "
      `);
      await validate(content);
    });

    it('Should add __typename as non-optional when forced', async () => {
      const ast = parse(/* GraphQL */ `
        query {
          dummy
        }
      `);
      const config = { nonOptionalTypename: true, preResolveTypes: false };
      const { content } = await plugin(schema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });
      expect(content).toMatchInlineSnapshot(`
        "export type Unnamed_1_QueryVariables = Exact<{ [key: string]: never; }>;


        export type Unnamed_1_Query = (
          { __typename: 'Query' }
          & Pick<Query, 'dummy'>
        );
        "
      `);
      await validate(content);
    });

    it('Should add __typename as optional when its not specified', async () => {
      const ast = parse(/* GraphQL */ `
        query {
          dummy
        }
      `);
      const config = { preResolveTypes: false };
      const { content } = await plugin(schema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });
      expect(content).toMatchInlineSnapshot(`
        "export type Unnamed_1_QueryVariables = Exact<{ [key: string]: never; }>;


        export type Unnamed_1_Query = Pick<Query, 'dummy'>;
        "
      `);
      await validate(content);
    });

    it('Should add __typename as non-optional when its explictly specified, even if skipTypename is true', async () => {
      const ast = parse(/* GraphQL */ `
        query {
          __typename
          dummy
        }
      `);
      const config = { skipTypename: true, preResolveTypes: false };
      const { content } = await plugin(schema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });

      expect(content).toMatchInlineSnapshot(`
        "export type Unnamed_1_QueryVariables = Exact<{ [key: string]: never; }>;


        export type Unnamed_1_Query = (
          { __typename: 'Query' }
          & Pick<Query, 'dummy'>
        );
        "
      `);
      await validate(content);
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
      const config = { preResolveTypes: false };
      const { content } = await plugin(schema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });
      expect(content).toMatchInlineSnapshot(`
        "export type UnionTestQueryVariables = Exact<{ [key: string]: never; }>;


        export type UnionTestQuery = { unionTest: Maybe<
            | Pick<User, 'id'>
            | Pick<Profile, 'age'>
          > };
        "
      `);
      await validate(content);
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
      const config = { preResolveTypes: false };
      const { content } = await plugin(schema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });
      expect(content).toMatchInlineSnapshot(`
        "export type NotificationsQueryVariables = Exact<{ [key: string]: never; }>;


        export type NotificationsQuery = { notifications: Array<
            | Pick<TextNotification, 'text' | 'id'>
            | (
              Pick<ImageNotification, 'imageUrl' | 'id'>
              & { metadata: Pick<ImageMetadata, 'createdBy'> }
            )
          > };
        "
      `);
      await validate(content);
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
      const config = { preResolveTypes: false };
      const { content } = await plugin(schema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });
      expect(content).toMatchInlineSnapshot(`
        "export type NotificationsQueryVariables = Exact<{ [key: string]: never; }>;


        export type NotificationsQuery = { notifications: Array<
            | (
              { __typename: 'TextNotification' }
              & Pick<TextNotification, 'text'>
            )
            | (
              { __typename: 'ImageNotification' }
              & Pick<ImageNotification, 'imageUrl'>
            )
          > };
        "
      `);
      await validate(content);
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
      const config = { preResolveTypes: false };
      const { content } = await plugin(schema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });
      expect(content).toMatchInlineSnapshot(`
        "export type UnionTestQueryVariables = Exact<{ [key: string]: never; }>;


        export type UnionTestQuery = { unionTest: Maybe<
            | (
              { __typename: 'User' }
              & Pick<User, 'email'>
            )
            | (
              { __typename: 'Profile' }
              & Pick<Profile, 'firstName'>
            )
          > };
        "
      `);
      await validate(content);
    });
  });

  describe('Unnamed Documents', () => {
    it('Should handle unnamed documents correctly', async () => {
      const ast = parse(/* GraphQL */ `
        query {
          dummy
        }
      `);
      const config = { skipTypename: true, preResolveTypes: false };
      const { content } = await plugin(schema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });
      expect(content).toMatchInlineSnapshot(`
        "export type Unnamed_1_QueryVariables = Exact<{ [key: string]: never; }>;


        export type Unnamed_1_Query = Pick<Query, 'dummy'>;
        "
      `);
      expect(content).toMatchInlineSnapshot(`
        "export type Unnamed_1_QueryVariables = Exact<{ [key: string]: never; }>;


        export type Unnamed_1_Query = Pick<Query, 'dummy'>;
        "
      `);
      await validate(content);
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
      const config = { skipTypename: true, preResolveTypes: false };
      const { content } = await plugin(schema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });

      expect(content).toMatchInlineSnapshot(`
        "export type Unnamed_1_QueryVariables = Exact<{ [key: string]: never; }>;


        export type Unnamed_1_Query = Pick<Query, 'dummy'>;

        export type Unnamed_2_QueryVariables = Exact<{ [key: string]: never; }>;


        export type Unnamed_2_Query = Pick<Query, 'dummy'>;
        "
      `);
      expect(content).toMatchInlineSnapshot(`
        "export type Unnamed_1_QueryVariables = Exact<{ [key: string]: never; }>;


        export type Unnamed_1_Query = Pick<Query, 'dummy'>;

        export type Unnamed_2_QueryVariables = Exact<{ [key: string]: never; }>;


        export type Unnamed_2_Query = Pick<Query, 'dummy'>;
        "
      `);
      expect(content).toMatchInlineSnapshot(`
        "export type Unnamed_1_QueryVariables = Exact<{ [key: string]: never; }>;


        export type Unnamed_1_Query = Pick<Query, 'dummy'>;

        export type Unnamed_2_QueryVariables = Exact<{ [key: string]: never; }>;


        export type Unnamed_2_Query = Pick<Query, 'dummy'>;
        "
      `);
      expect(content).toMatchInlineSnapshot(`
        "export type Unnamed_1_QueryVariables = Exact<{ [key: string]: never; }>;


        export type Unnamed_1_Query = Pick<Query, 'dummy'>;

        export type Unnamed_2_QueryVariables = Exact<{ [key: string]: never; }>;


        export type Unnamed_2_Query = Pick<Query, 'dummy'>;
        "
      `);
      await validate(content);
    });
  });

  describe('Selection Set', () => {
    it('Should detect invalid types as parent and notify', async () => {
      const ast = parse(/* GraphQL */ `
        mutation test {
          test
        }
      `);
      const config = { preResolveTypes: false };

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
      const config = { preResolveTypes: false };
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

      await validate(content, usage);
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
      const config = { preResolveTypes: false };
      const { content } = await plugin(testSchema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });
      await validate(content);
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
      const config = { preResolveTypes: false };
      const { content } = await plugin(testSchema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });
      await validate(content);
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
      const config = { preResolveTypes: false };
      const { content } = await plugin(testSchema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });
      await validate(content);
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
      const config = { preResolveTypes: false };
      const { content } = await plugin(testSchema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });
      await validate(
        content,
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
      const config = { preResolveTypes: false };
      const { content } = await plugin(testSchema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });

      await validate(
        content,
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
      const config = { preResolveTypes: false };
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

      await validate(content, usage);
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
      const config = { skipTypename: true, preResolveTypes: false };
      const { content } = await plugin(schema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });
      expect(content).toMatchInlineSnapshot(`
        "export type Role =
          | 'USER'
          | 'ADMIN';

        export type UserFieldsFragment = (
          Pick<User, 'id' | 'username' | 'role'>
          & { profile: Maybe<Pick<Profile, 'age'>> }
        );

        export type MeQueryVariables = Exact<{ [key: string]: never; }>;


        export type MeQuery = { me: Maybe<(
            Pick<User, 'id' | 'username' | 'role'>
            & { profile: Maybe<Pick<Profile, 'age'>> }
          )> };
        "
      `);
      await validate(content);
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
      const config = { skipTypename: true, preResolveTypes: false };
      const { content } = await plugin(schema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });

      expect(content).toMatchInlineSnapshot(`
        "export type UserFieldsFragment = (
          Pick<User, 'id'>
          & { profile: Maybe<Pick<Profile, 'age'>> }
        );

        export type MeQueryVariables = Exact<{ [key: string]: never; }>;


        export type MeQuery = { me: Maybe<(
            Pick<User, 'username' | 'id'>
            & { profile: Maybe<Pick<Profile, 'age'>> }
          )> };
        "
      `);
      await validate(content);
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
      const config = { skipTypename: false, preResolveTypes: false };
      const { content } = await plugin(schema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });

      expect(content).toMatchInlineSnapshot(`
        "export type UserFieldsFragment = Pick<User, 'id'>;

        export type UserProfileFragment = { profile: Maybe<Pick<Profile, 'age'>> };

        export type MeQueryVariables = Exact<{ [key: string]: never; }>;


        export type MeQuery = { me: Maybe<(
            Pick<User, 'username' | 'id'>
            & { profile: Maybe<Pick<Profile, 'age'>> }
          )> };
        "
      `);
      expect(content).toMatchInlineSnapshot(`
        "export type UserFieldsFragment = Pick<User, 'id'>;

        export type UserProfileFragment = { profile: Maybe<Pick<Profile, 'age'>> };

        export type MeQueryVariables = Exact<{ [key: string]: never; }>;


        export type MeQuery = { me: Maybe<(
            Pick<User, 'username' | 'id'>
            & { profile: Maybe<Pick<Profile, 'age'>> }
          )> };
        "
      `);
      expect(content).toMatchInlineSnapshot(`
        "export type UserFieldsFragment = Pick<User, 'id'>;

        export type UserProfileFragment = { profile: Maybe<Pick<Profile, 'age'>> };

        export type MeQueryVariables = Exact<{ [key: string]: never; }>;


        export type MeQuery = { me: Maybe<(
            Pick<User, 'username' | 'id'>
            & { profile: Maybe<Pick<Profile, 'age'>> }
          )> };
        "
      `);
      await validate(content);
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
      const config = { preResolveTypes: false };
      const { content } = await plugin(schema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });

      expect(content).toMatchInlineSnapshot(`
        "export type Unnamed_1_QueryVariables = Exact<{ [key: string]: never; }>;


        export type Unnamed_1_Query = { b: Maybe<
            | Pick<A, 'id' | 'x'>
            | Pick<B, 'id' | 'y'>
          > };

        export type AFragment = Pick<A, 'id' | 'x'>;

        export type BFragment = Pick<B, 'id' | 'y'>;
        "
      `);
      await validate(content);
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
      const config = { preResolveTypes: false };
      const { content } = await plugin(schema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });
      expect(content).toMatchInlineSnapshot(`
        "export type Unnamed_1_QueryVariables = Exact<{ [key: string]: never; }>;


        export type Unnamed_1_Query = { myType: Pick<MyType, 'foo' | 'bar' | 'test'> };

        export type CFragment = Pick<MyType, 'test'>;

        export type AFragment = Pick<MyType, 'foo'>;

        export type BFragment = Pick<MyType, 'bar'>;
        "
      `);
      await validate(content);
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
      const config = { preResolveTypes: false };
      const { content } = await plugin(schema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });

      expect(content).toMatchInlineSnapshot(`
        "export type Unnamed_1_QueryVariables = Exact<{ [key: string]: never; }>;


        export type Unnamed_1_Query = { b: Maybe<
            | Pick<A, 'id' | 'x'>
            | Record<PropertyKey, never>
          > };

        export type AFragment = Pick<A, 'id'>;

        export type BFragment = Pick<A, 'x'>;
        "
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

      const config = { preResolveTypes: false };
      const { content } = await plugin(schema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });
      expect(content).toMatchInlineSnapshot(`
        "export type NotificationsQueryVariables = Exact<{ [key: string]: never; }>;


        export type NotificationsQuery = { notifications: Array<
            | Pick<TextNotification, 'text' | 'id'>
            | (
              Pick<ImageNotification, 'imageUrl' | 'id'>
              & { metadata: Pick<ImageMetadata, 'createdBy'> }
            )
          > };
        "
      `);
      await validate(content);
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
      const config = { preResolveTypes: false };
      const { content } = await plugin(schema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });

      expect(content).toMatchInlineSnapshot(`
        "export type UnionTestQueryVariables = Exact<{ [key: string]: never; }>;


        export type UnionTestQuery = { unionTest: Maybe<
            | Pick<User, 'id'>
            | Pick<Profile, 'age'>
          > };
        "
      `);
      await validate(content);
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
      const config = { preResolveTypes: false };
      const { content } = await plugin(schema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });

      expect(content).toMatchInlineSnapshot(`
        "export type UnionTestQueryVariables = Exact<{ [key: string]: never; }>;


        export type UnionTestQuery = { mixedNotifications: Array<
            | Pick<TextNotification, 'id' | 'text'>
            | Pick<ImageNotification, 'id' | 'imageUrl'>
          > };
        "
      `);
      await validate(content);
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
      const config = { preResolveTypes: false };
      const { content } = await plugin(schema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });

      expect(content).toMatchInlineSnapshot(`
        "export type UnionTestQueryVariables = Exact<{ [key: string]: never; }>;


        export type UnionTestQuery = { search: Array<
            | Pick<TextNotification, 'id' | 'text'>
            | Pick<ImageNotification, 'id' | 'imageUrl'>
            | Pick<User, 'id'>
          > };
        "
      `);
      await validate(content);
    });

    it('Should support merging identical fragment union types', async () => {
      const ast = parse(/* GraphQL */ `
        query test {
          notifications {
            ...N
          }
        }

        fragment N on Notifiction {
          id
        }
      `);
      const config = { preResolveTypes: true, mergeFragmentTypes: true, namingConvention: 'keep' };
      const { content } = await plugin(schema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });

      expect(content).toMatchInlineSnapshot(`
        "export type testQueryVariables = Exact<{ [key: string]: never; }>;


        export type testQuery = { notifications: Array<{ id: string }> };

        export type NFragment = { id: string };
        "
      `);
      await validate(content);
    });

    it('Should support computing correct names for merged fragment union types', async () => {
      const ast = parse(/* GraphQL */ `
        fragment N on Notifiction {
          id
          ... on TextNotification {
            text
          }
        }
      `);
      const config = { preResolveTypes: true, mergeFragmentTypes: true, namingConvention: 'keep' };
      const { content } = await plugin(schema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });

      expect(content).toMatchInlineSnapshot(`
        "type N_TextNotification_Fragment = { text: string, id: string };

        type N_ImageNotification_Fragment = { id: string };

        export type NFragment =
          | N_TextNotification_Fragment
          | N_ImageNotification_Fragment
        ;
        "
      `);
      await validate(content);
    });

    it('Should support computing correct names for large merged fragment union types', async () => {
      const testSchema = buildSchema(/* GraphQL */ `
        interface Node {
          id: ID!
        }

        type A implements Node {
          id: ID!
          text: String!
        }

        type B implements Node {
          id: ID!
          text: String!
        }

        type C implements Node {
          id: ID!
          text: String!
        }

        type D implements Node {
          id: ID!
          text: String!
        }

        type E implements Node {
          id: ID!
          text: String!
        }
      `);

      const ast = parse(/* GraphQL */ `
        fragment N on Node {
          id
          ... on A {
            text
          }
        }
      `);
      const config = { preResolveTypes: true, mergeFragmentTypes: true, namingConvention: 'keep' };
      const { content } = await plugin(testSchema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });

      expect(content).toMatchInlineSnapshot(`
        "type N_A_Fragment = { text: string, id: string };

        type N_ZMkK3KeglIQrCEb6gIP8zgzig3OXIb4iuHrFFPW86a4_Fragment = { id: string };

        export type NFragment =
          | N_A_Fragment
          | N_ZMkK3KeglIQrCEb6gIP8zgzig3OXIb4iuHrFFPW86a4_Fragment
        ;
        "
      `);
      await validate(content);
    });

    it('Should not create empty types when merging fragment union types', async () => {
      const ast = parse(/* GraphQL */ `
        fragment N on Query {
          notifications {
            ... on TextNotification {
              text
            }
          }
        }
      `);
      const config = { preResolveTypes: true, mergeFragmentTypes: true, namingConvention: 'keep' };
      const { content } = await plugin(schema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });

      expect(content).toMatchInlineSnapshot(`
        "export type NFragment = { notifications: Array<{ text: string }> };
        "
      `);
      await validate(content);
    });

    it('Should support merging identical fragment union types with skipTypename', async () => {
      const ast = parse(/* GraphQL */ `
        query test {
          notifications {
            ...N
          }
        }

        fragment N on Notifiction {
          id
        }
      `);
      const config = { preResolveTypes: true, skipTypename: true, mergeFragmentTypes: true, namingConvention: 'keep' };
      const { content } = await plugin(schema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });

      expect(content).toMatchInlineSnapshot(`
        "export type testQueryVariables = Exact<{ [key: string]: never; }>;


        export type testQuery = { notifications: Array<{ id: string }> };

        export type NFragment = { id: string };
        "
      `);
      await validate(content);
    });

    it('Should support computing correct names for merged fragment union types with skipTypename', async () => {
      const ast = parse(/* GraphQL */ `
        fragment N on Notifiction {
          id
          ... on TextNotification {
            text
          }
        }
      `);
      const config = { preResolveTypes: true, skipTypename: true, mergeFragmentTypes: true, namingConvention: 'keep' };
      const { content } = await plugin(schema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });

      expect(content).toMatchInlineSnapshot(`
        "type N_TextNotification_Fragment = { text: string, id: string };

        type N_ImageNotification_Fragment = { id: string };

        export type NFragment =
          | N_TextNotification_Fragment
          | N_ImageNotification_Fragment
        ;
        "
      `);
      await validate(content);
    });

    it('Ignores merging when enabled alongside inline fragment masking', async () => {
      const ast = parse(/* GraphQL */ `
        query test {
          notifications {
            ...N
          }
        }

        fragment N on Notifiction {
          id
        }
      `);
      const config = { preResolveTypes: true, mergeFragmentTypes: true, inlineFragmentTypes: 'mask' } as const;
      const { content } = await plugin(schema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });

      expect(content).toMatchInlineSnapshot(`
        "export type TestQueryVariables = Exact<{ [key: string]: never; }>;


        export type TestQuery = { notifications: Array<
            | { ' $fragmentRefs'?: { 'N_TextNotification_Fragment': N_TextNotification_Fragment } }
            | { ' $fragmentRefs'?: { 'N_ImageNotification_Fragment': N_ImageNotification_Fragment } }
          > };

        type N_TextNotification_Fragment = { id: string } & { ' $fragmentName'?: 'N_TextNotification_Fragment' };

        type N_ImageNotification_Fragment = { id: string } & { ' $fragmentName'?: 'N_ImageNotification_Fragment' };

        export type NFragment =
          | N_TextNotification_Fragment
          | N_ImageNotification_Fragment
        ;
        "
      `);
      await validate(content);
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
      const config = { skipTypename: true, preResolveTypes: false };
      const { content } = await plugin(schema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });
      expect(content).toMatchInlineSnapshot(`
        "export type CurrentUserQueryVariables = Exact<{ [key: string]: never; }>;


        export type CurrentUserQuery = { me: Maybe<(
            Pick<User, 'username' | 'id'>
            & { profile: Maybe<Pick<Profile, 'age'>> }
          )> };
        "
      `);

      await validate(content);
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
      const config = { skipTypename: true, preResolveTypes: false };
      const { content } = await plugin(gitHuntSchema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });

      expect(content).toMatchInlineSnapshot(
        `
        "export type MeQueryVariables = Exact<{
          repoFullName: string;
        }>;


        export type MeQuery = {
            currentUser: Maybe<Pick<User, 'login' | 'html_url'>>,
            entry: Maybe<(
              Pick<Entry, 'id' | 'createdAt'>
              & { postedBy: Pick<User, 'login' | 'html_url'> }
            )>,
          };
        "
      `
      );
      expect(content).toMatchInlineSnapshot(`
        "export type MeQueryVariables = Exact<{
          repoFullName: string;
        }>;


        export type MeQuery = {
            currentUser: Maybe<Pick<User, 'login' | 'html_url'>>,
            entry: Maybe<(
              Pick<Entry, 'id' | 'createdAt'>
              & { postedBy: Pick<User, 'login' | 'html_url'> }
            )>,
          };
        "
      `);
      await validate(content);
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

      expect(content).toMatchInlineSnapshot(`
        "export type MeQueryVariables = Exact<{
          repoFullName: string;
        }>;


        export type MeQuery = { currentUser: { login: string, html_url: string } | null, entry: { id: number, createdAt: number, postedBy: { login: string, html_url: string } } | null };
        "
      `);
      await validate(content);
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

      const o = await validate(content);
      expect(o).toMatchInlineSnapshot(`
        "export type Information_EntryType =
          | 'NAME'
          | 'ADDRESS';

        export type TestQueryVariables = Exact<{ [key: string]: never; }>;


        export type TestQuery = { info: { entries: Array<{ id: Information_EntryType, value: string | null }> } | null };

        export type InformationFragment = { entries: Array<{ id: Information_EntryType, value: string | null }> };
        "
      `);
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

      const o = await validate(content);
      expect(o).toMatchInlineSnapshot(`
        "export type Information_EntryType =
          | 'NAME'
          | 'ADDRESS';

        export type ITestQueryVariables = Exact<{
          e: Information_EntryType;
        }>;


        export type ITestQuery = { info: { entries: Array<{ id: Information_EntryType, value: string | null }> } | null, infoArgTest: { entries: Array<{ id: Information_EntryType, value: string | null }> } | null };

        export type IInformationFragment = { entries: Array<{ id: Information_EntryType, value: string | null }> };
        "
      `);
    });

    it('Should produce valid output with preResolveTypes=true and enums with no suffixes', async () => {
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
      const config = { preResolveTypes: true, typesSuffix: 'I', enumSuffix: false };
      const { content } = await plugin(testSchema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });

      const o = await validate(content);
      expect(o).toMatchInlineSnapshot(`
        "export type Information_EntryType =
          | 'NAME'
          | 'ADDRESS';

        export type TestQueryVariablesI = Exact<{
          e: Information_EntryType;
        }>;


        export type TestQueryI = { info: { entries: Array<{ id: Information_EntryType, value: string | null }> } | null, infoArgTest: { entries: Array<{ id: Information_EntryType, value: string | null }> } | null };

        export type InformationFragmentI = { entries: Array<{ id: Information_EntryType, value: string | null }> };
        "
      `);
    });

    it('Should build a basic selection set based on basic query', async () => {
      const ast = parse(/* GraphQL */ `
        query dummy {
          dummy
        }
      `);
      const config = { skipTypename: true, preResolveTypes: false };
      const { content } = await plugin(schema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });

      expect(content).toMatchInlineSnapshot(`
        "export type DummyQueryVariables = Exact<{ [key: string]: never; }>;


        export type DummyQuery = Pick<Query, 'dummy'>;
        "
      `);
      await validate(content);
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
      const config = { skipTypename: true, preResolveTypes: false };
      const { content } = await plugin(schema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });

      expect(content).toMatchInlineSnapshot(`
        "export type DummyQueryVariables = Exact<{ [key: string]: never; }>;


        export type DummyQuery = (
          { customName: Query['dummy'] }
          & { customName2: Maybe<Pick<Profile, 'age'>> }
        );
        "
      `);
      await validate(content);
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
      const config = { skipTypename: true, preResolveTypes: false };
      const { content } = await plugin(schema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });

      expect(content).toMatchInlineSnapshot(`
        "export type Role =
          | 'USER'
          | 'ADMIN';

        export type CurrentUserQueryVariables = Exact<{ [key: string]: never; }>;


        export type CurrentUserQuery = { me: Maybe<(
            Pick<User, 'id' | 'username' | 'role'>
            & { profile: Maybe<Pick<Profile, 'age'>> }
          )> };
        "
      `);
      await validate(content);
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
      const config = { skipTypename: true, preResolveTypes: false };
      const { content } = await plugin(schema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });

      expect(content).toMatchInlineSnapshot(`
        "export type UserFieldsFragment = (
          Pick<User, 'id' | 'username'>
          & { profile: Maybe<Pick<Profile, 'age'>> }
        );
        "
      `);
      await validate(content);
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
      const config = { skipTypename: true, preResolveTypes: false };
      const { content } = await plugin(schema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });

      expect(content).toMatchInlineSnapshot(`
        "export type LoginMutationVariables = Exact<{ [key: string]: never; }>;


        export type LoginMutation = { login: Maybe<(
            Pick<User, 'id' | 'username'>
            & { profile: Maybe<Pick<Profile, 'age'>> }
          )> };
        "
      `);
      await validate(content);
    });

    it('Should detect Query correctly', async () => {
      const ast = parse(/* GraphQL */ `
        query test {
          dummy
        }
      `);
      const config = { skipTypename: true, preResolveTypes: false };
      const { content } = await plugin(schema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });

      expect(content).toMatchInlineSnapshot(`
        "export type TestQueryVariables = Exact<{ [key: string]: never; }>;


        export type TestQuery = Pick<Query, 'dummy'>;
        "
      `);
      await validate(content);
    });

    it('Should detect Subscription correctly', async () => {
      const ast = parse(/* GraphQL */ `
        subscription test {
          userCreated {
            id
          }
        }
      `);
      const config = { skipTypename: true, preResolveTypes: false };
      const { content } = await plugin(schema, [{ location: 'test-file.ts', document: ast }], config, {
        outputFile: '',
      });

      expect(content).toMatchInlineSnapshot(`
        "export type TestSubscriptionVariables = Exact<{ [key: string]: never; }>;


        export type TestSubscription = { userCreated: Maybe<Pick<User, 'id'>> };
        "
      `);
      await validate(content);
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

      expect(content).toMatchInlineSnapshot(
        `
        "type InputType = {
          t?: string | null | undefined;
        };

        export type TestQueryQueryVariables = Exact<{
          username?: string | null;
          email?: string | null;
          password: string;
          input?: InputType | null;
          mandatoryInput: InputType;
          testArray?: Array<string | null> | string | null;
          requireString: Array<string | null> | string;
          innerRequired: Array<string> | string;
        }>;


        export type TestQueryQuery = { dummy: string | null };
        "
      `
      );
      await validate(content);
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

      expect(content).toMatchInlineSnapshot(
        `
        "export type TestQueryQueryVariables = Exact<{
          test?: any | null;
        }>;


        export type TestQueryQuery = { dummy: string | null };
        "
      `
      );
      await validate(content);
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

      expect(content).toMatchInlineSnapshot(`
        "export type TestQueryQueryVariables = Exact<{ [key: string]: never; }>;


        export type TestQueryQuery = { dummy: string | null };
        "
      `);
      await validate(content);
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
        { preResolveTypes: false },
        {
          outputFile: 'graphql.ts',
        }
      );

      expect(content).toMatchInlineSnapshot(`
        "export type SubmitMessageMutationVariables = Exact<{
          message: string;
        }>;


        export type SubmitMessageMutation = { mutation:
            | Pick<DeleteMutation, 'deleted'>
            | Pick<UpdateMutation, 'updated'>
           };
        "
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
        { preResolveTypes: false },
        {
          outputFile: 'graphql.ts',
        }
      );

      expect(content).toMatchInlineSnapshot(`
        "export type PostQueryVariables = Exact<{ [key: string]: never; }>;


        export type PostQuery = { post: { __typename: 'Post' } };
        "
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
        { preResolveTypes: false },
        {
          outputFile: 'graphql.ts',
        }
      );

      expect(content).toMatchInlineSnapshot(`
        "export type InfoQueryVariables = Exact<{ [key: string]: never; }>;


        export type InfoQuery = { __schema: { queryType: { fields: Maybe<Array<Pick<__Field, 'name'>>> } } };
        "
      `);
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
        { preResolveTypes: false },
        {
          outputFile: 'graphql.ts',
        }
      );

      expect(content).toMatchInlineSnapshot(`
        "export type InfoQueryVariables = Exact<{ [key: string]: never; }>;


        export type InfoQuery = { __type: Maybe<(
            Pick<__Type, 'name'>
            & { fields: Maybe<Array<(
              Pick<__Field, 'name'>
              & { type: Pick<__Type, 'name' | 'kind'> }
            )>> }
          )> };
        "
      `);
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
        { typesPrefix: 'PREFIX_', preResolveTypes: false },
        {
          outputFile: 'graphql.ts',
        }
      );

      expect(content).toMatchInlineSnapshot(`
        "export type PREFIX_Access =
          | 'Read'
          | 'Write'
          | 'All';

        type PREFIX_Filter = {
          match: string;
        };

        export type PREFIX_UsersQueryVariables = Exact<{
          filter: PREFIX_Filter;
        }>;


        export type PREFIX_UsersQuery = { users: Maybe<Array<Maybe<Pick<PREFIX_User, 'access'>>>> };
        "
      `);
      expect(content).toMatchInlineSnapshot(`
        "export type PREFIX_Access =
          | 'Read'
          | 'Write'
          | 'All';

        type PREFIX_Filter = {
          match: string;
        };

        export type PREFIX_UsersQueryVariables = Exact<{
          filter: PREFIX_Filter;
        }>;


        export type PREFIX_UsersQuery = { users: Maybe<Array<Maybe<Pick<PREFIX_User, 'access'>>>> };
        "
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

      expect(content).toMatchInlineSnapshot(`
        "export type UsersQueryVariables = Exact<{
          reverse?: boolean | null;
        }>;


        export type UsersQuery = { users: Array<{ name: string }> };
        "
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
        { preResolveTypes: false },
        {
          outputFile: 'graphql.ts',
        }
      );
      expect(content).toMatchInlineSnapshot(`
        "export type FieldQueryVariables = Exact<{ [key: string]: never; }>;


        export type FieldQuery = { field:
            | (
              { __typename: 'Error1' }
              & Pick<Error1, 'message'>
            )
            | (
              { __typename: 'Error2' }
              & Pick<Error2, 'message'>
            )
            | (
              { __typename: 'ComplexError' }
              & Pick<ComplexError, 'message' | 'additionalInfo'>
            )
            | (
              { __typename: 'FieldResultSuccess' }
              & Pick<FieldResultSuccess, 'someValue'>
            )
           };
        "
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
        { preResolveTypes: false },
        {
          outputFile: 'graphql.ts',
        }
      );
      expect(content).toMatchInlineSnapshot(`
        "export type FieldQueryVariables = Exact<{ [key: string]: never; }>;


        export type FieldQuery = { field:
            | (
              { __typename: 'Error1' }
              & Pick<Error1, 'message'>
            )
            | (
              { __typename: 'Error2' }
              & Pick<Error2, 'message'>
            )
            | (
              { __typename: 'ComplexError' }
              & Pick<ComplexError, 'message' | 'additionalInfo'>
            )
            | Pick<FieldResultSuccess, 'someValue'>
           };
        "
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
        { preResolveTypes: false },
        {
          outputFile: 'graphql.ts',
        }
      );

      expect(content).toMatchInlineSnapshot(`
        "export type SomethingQueryVariables = Exact<{ [key: string]: never; }>;


        export type SomethingQuery = { node: Maybe<
            | Pick<A, 'a'>
            | Pick<B, 'a'>
          > };
        "
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
        { preResolveTypes: false },
        {
          outputFile: 'graphql.ts',
        }
      );

      expect(content).toMatchInlineSnapshot(`
        "export type UserQueryVariables = Exact<{ [key: string]: never; }>;


        export type UserQuery = { user: Maybe<
            | Pick<User, 'id' | 'login'>
            | Pick<Error2, 'message'>
            | (
              Pick<Error3, 'message'>
              & { info: Maybe<Pick<AdditionalInfo, 'message'>> }
            )
          > };
        "
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
        { preResolveTypes: false },
        {
          outputFile: 'graphql.ts',
        }
      );

      expect(content).toMatchInlineSnapshot(`
        "export type UserQueryVariables = Exact<{ [key: string]: never; }>;


        export type UserQuery = { user: Maybe<
            | Pick<User, 'id' | 'login'>
            | Pick<Error2, 'message'>
            | (
              Pick<Error3, 'message'>
              & { info: Maybe<Pick<AdditionalInfo, 'message' | 'message2'>> }
            )
          > };
        "
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
        { preResolveTypes: false },
        {
          outputFile: 'graphql.ts',
        }
      );

      const o = await validate(content);

      expect(o).toMatchInlineSnapshot(`
        "export type UserQueryQueryVariables = Exact<{ [key: string]: never; }>;


        export type UserQueryQuery = { user: Pick<User, 'id' | 'login'> };
        "
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
        { preResolveTypes: false },
        {
          outputFile: 'graphql.ts',
        }
      );

      const o = await validate(content);

      expect(o).toMatchInlineSnapshot(`
        "export type UserQueryQueryVariables = Exact<{ [key: string]: never; }>;


        export type UserQueryQuery = { user: Pick<User, 'id' | 'login'> };

        export type TestFragment = Pick<User, 'login'>;
        "
      `);

      expect(o).toMatchInlineSnapshot(`
        "export type UserQueryQueryVariables = Exact<{ [key: string]: never; }>;


        export type UserQueryQuery = { user: Pick<User, 'id' | 'login'> };

        export type TestFragment = Pick<User, 'login'>;
        "
      `);
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
        { preResolveTypes: false },
        {
          outputFile: 'graphql.ts',
        }
      );

      const output = await validate(
        content,
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

      expect(output).toMatchInlineSnapshot(`
        "export type UserQueryQueryVariables = Exact<{ [key: string]: never; }>;


        export type UserQueryQuery = { user:
            | Pick<User, 'login' | 'id'>
            | Pick<Error2, 'message'>
            | (
              Pick<Error3, 'message'>
              & { info: Maybe<Pick<AdditionalInfo, 'message2' | 'message'>> }
            )
           };

        export type AdditionalInfoFragment = Pick<AdditionalInfo, 'message'>;

        type UserResult1_User_Fragment = Pick<User, 'id'>;

        type UserResult1_Error3_Fragment = { info: Maybe<Pick<AdditionalInfo, 'message2'>> };

        export type UserResult1Fragment =
          | UserResult1_User_Fragment
          | UserResult1_Error3_Fragment
        ;

        type UserResult_User_Fragment = Pick<User, 'id'>;

        type UserResult_Error2_Fragment = Pick<Error2, 'message'>;

        export type UserResultFragment =
          | UserResult_User_Fragment
          | UserResult_Error2_Fragment
        ;

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
                }"
      `);

      expect(output).toMatchInlineSnapshot(`
        "export type UserQueryQueryVariables = Exact<{ [key: string]: never; }>;


        export type UserQueryQuery = { user:
            | Pick<User, 'login' | 'id'>
            | Pick<Error2, 'message'>
            | (
              Pick<Error3, 'message'>
              & { info: Maybe<Pick<AdditionalInfo, 'message2' | 'message'>> }
            )
           };

        export type AdditionalInfoFragment = Pick<AdditionalInfo, 'message'>;

        type UserResult1_User_Fragment = Pick<User, 'id'>;

        type UserResult1_Error3_Fragment = { info: Maybe<Pick<AdditionalInfo, 'message2'>> };

        export type UserResult1Fragment =
          | UserResult1_User_Fragment
          | UserResult1_Error3_Fragment
        ;

        type UserResult_User_Fragment = Pick<User, 'id'>;

        type UserResult_Error2_Fragment = Pick<Error2, 'message'>;

        export type UserResultFragment =
          | UserResult_User_Fragment
          | UserResult_Error2_Fragment
        ;

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
                }"
      `);
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
        preResolveTypes: false,
      };

      const { content } = await plugin(testSchema, [{ location: '', document: query }], config, {
        outputFile: 'graphql.ts',
      });

      const output = await validate(
        content,
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

      expect(output).toMatchInlineSnapshot(`
        "export type UserQueryQueryVariables = Exact<{ [key: string]: never; }>;


        export type UserQueryQuery = { user:
            | Pick<User, 'id' | 'login'>
            | Pick<Error2, 'message'>
            | (
              Pick<Error3, 'message'>
              & { info: Maybe<Pick<AdditionalInfo, 'message2' | 'message'>> }
            )
           };

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
                }"
      `);
    });

    it('#4216 - handle fragments against unions and interfaces with flattenGeneratedTypes', async () => {
      const testSchema = buildSchema(/* GraphQL */ `
        schema {
          query: Query
        }

        type Query {
          search: [Searchable!]
        }

        interface Concept {
          id: String
        }

        type Dimension implements Concept {
          id: String
        }

        type DimValue {
          dimension: Dimension
          value: String!
        }

        union Searchable = Dimension | DimValue
      `);

      const query = parse(/* GraphQL */ `
        query SearchPopular {
          search {
            ...SearchableFragment
          }
        }

        fragment SearchableFragment on Searchable {
          ...SearchConceptFragment
          ...SearchDimValueFragment
        }

        fragment SearchConceptFragment on Concept {
          id
        }

        fragment SearchDimValueFragment on DimValue {
          dimension {
            ...SearchConceptFragment
          }
          value
        }
      `);

      const config = {
        flattenGeneratedTypes: true,
        preResolveTypes: false,
      };

      const { content } = await plugin(testSchema, [{ location: '', document: query }], config, {
        outputFile: 'graphql.ts',
      });

      const output = await validate(content);
      expect(mergeOutputs([output])).toMatchSnapshot();

      expect(output).toMatchInlineSnapshot(`
        "export type SearchPopularQueryVariables = Exact<{ [key: string]: never; }>;


        export type SearchPopularQuery = { search: Maybe<Array<
            | Pick<Dimension, 'id'>
            | (
              Pick<DimValue, 'value'>
              & { dimension: Maybe<Pick<Dimension, 'id'>> }
            )
          >> };
        "
      `);
    });

    it('Handles fragments across files with flattenGeneratedTypes', async () => {
      const testSchema = buildSchema(/* GraphQL */ `
        schema {
          query: Query
        }

        type Query {
          search: [Dimension!]
        }

        type Dimension {
          id: String
        }
      `);

      const query = parse(/* GraphQL */ `
        query SearchPopular {
          search {
            ...SearchableFragment
          }
        }

        # Unreferenced fragments are still dropped
        fragment ExtraFragment on Dimension {
          id
        }
      `);

      const fragment = parse(/* GraphQL */ `
        fragment SearchableFragment on Dimension {
          id
        }
      `);

      const config = {
        flattenGeneratedTypes: true,
        flattenGeneratedTypesIncludeFragments: true,
        preResolveTypes: true,
      };

      const { content } = await plugin(
        testSchema,
        [
          { location: '', document: query },
          { location: '', document: fragment },
        ],
        config,
        {
          outputFile: 'graphql.ts',
        }
      );

      const output = await validate(content);

      expect(output).toMatchInlineSnapshot(`
        "export type SearchableFragmentFragment = { id: string | null };

        export type SearchPopularQueryVariables = Exact<{ [key: string]: never; }>;


        export type SearchPopularQuery = { search: Array<{ id: string | null }> | null };
        "
      `);
    });

    it('Drops fragments with flattenGeneratedTypes', async () => {
      const testSchema = buildSchema(/* GraphQL */ `
        schema {
          query: Query
        }

        type Query {
          search: [Dimension!]
        }

        type Dimension {
          id: String
        }
      `);

      const query = parse(/* GraphQL */ `
        query SearchPopular {
          search {
            ...SearchableFragment
          }
        }

        # Unreferenced fragments should be dropped by flattenGeneratedTypes
        fragment ExtraFragment on Dimension {
          id
        }
      `);

      const fragment = parse(/* GraphQL */ `
        # Referenced fragments should be dropped by flattenGeneratedTypes
        fragment SearchableFragment on Dimension {
          id
        }
      `);

      const config = {
        flattenGeneratedTypes: true,
        flattenGeneratedTypesIncludeFragments: false,
        preResolveTypes: true,
      };

      const { content } = await plugin(
        testSchema,
        [
          { location: '', document: query },
          { location: '', document: fragment },
        ],
        config,
        {
          outputFile: 'graphql.ts',
        }
      );

      const output = await validate(content);

      expect(output).toMatchInlineSnapshot(`
        "export type SearchPopularQueryVariables = Exact<{ [key: string]: never; }>;


        export type SearchPopularQuery = { search: Array<{ id: string | null }> | null };
        "
      `);
    });

    it('Should add operation name when addOperationExport is true', async () => {
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
        query UserIdQuery {
          user {
            id
          }
        }
        query UserLoginQuery {
          user {
            login
          }
        }
      `);

      const config = {
        addOperationExport: true,
        preResolveTypes: false,
      };

      const { content } = await plugin(testSchema, [{ location: '', document: query }], config, {
        outputFile: 'graphql.ts',
      });

      expect(content).toMatchInlineSnapshot(`
        "export type UserIdQueryQueryVariables = Exact<{ [key: string]: never; }>;


        export type UserIdQueryQuery = { user: Pick<User, 'id'> };

        export type UserLoginQueryQueryVariables = Exact<{ [key: string]: never; }>;


        export type UserLoginQueryQuery = { user: Pick<User, 'login'> };

        export declare const UserIdQuery: import("graphql").DocumentNode;
        export declare const UserLoginQuery: import("graphql").DocumentNode;"
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
        preResolveTypes: false,
      };

      const { content } = await plugin(testSchema, [{ location: '', document: query }], config, {
        outputFile: 'graphql.ts',
      });

      const output = await validate(
        content,
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

      expect(output).toMatchInlineSnapshot(`
        "export type UserQueryQueryVariables = Exact<{ [key: string]: never; }>;


        export type UserQueryQuery = { user:
            | Pick<
                User,
                | 'id'
                | 'test2'
                | 'login'
                | 'test'
              >
            | Pick<Error2, 'message'>
            | (
              Pick<Error3, 'message'>
              & { info: Maybe<Pick<AdditionalInfo, 'message2' | 'message'>> }
            )
           };

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
                }"
      `);
    });
  });

  describe('Issues', () => {
    it('#4212 - Should merge TS arrays in a more elegant way', async () => {
      const testSchema = buildSchema(/* GraphQL */ `
        type Item {
          id: ID!
          name: String!
        }

        type Object {
          items: [Item!]!
        }

        type Query {
          obj: Object
        }
      `);

      const query = parse(/* GraphQL */ `
        fragment Object1 on Object {
          items {
            id
          }
        }

        fragment Object2 on Object {
          items {
            name
          }
        }

        fragment CombinedObject on Object {
          ...Object1
          ...Object2
        }

        query test {
          obj {
            ...CombinedObject
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

      await validate(
        content,
        `
          function test (t: TestQuery) {
            for (const item of t.obj!.items) {
              console.log(item.id, item.name, item.__typename);
            }
          }
      `
      );
    });

    it('#5422 - Error when interface doesnt have implemeting types', async () => {
      const testSchema = buildSchema(/* GraphQL */ `
        interface A {
          a: String!
        }

        type Query {
          test: A
        }
      `);

      const query = parse(/* GraphQL */ `
        query test {
          test {
            a
          }
        }
      `);

      const { content } = await plugin(
        testSchema,
        [{ location: '', document: query }],
        { preResolveTypes: false },
        {
          outputFile: 'graphql.ts',
        }
      );

      expect(content).not.toContain(`Maybe<>`);
      expect(content).toContain(`Maybe<never>`);
    });

    it('#4389 - validate issues with interfaces', async () => {
      const testSchema = buildSchema(/* GraphQL */ `
        interface A {
          a: String!
        }

        interface B implements A {
          a: String!
          b: String
        }

        type C implements B {
          a: String!
          b: String
          c: String!
        }

        type Query {
          foo: C
        }
      `);

      const query = parse(/* GraphQL */ `
        query {
          foo {
            ... on A {
              a
            }
          }
        }
      `);

      const { content } = await plugin(
        testSchema,
        [{ location: '', document: query }],
        { preResolveTypes: false },
        {
          outputFile: 'graphql.ts',
        }
      );
      expect(content).toMatchInlineSnapshot(`
        "export type Unnamed_1_QueryVariables = Exact<{ [key: string]: never; }>;


        export type Unnamed_1_Query = { foo: Maybe<Record<PropertyKey, never>> };
        "
      `);
    });

    it('#5001 - incorrect output with typeSuffix', async () => {
      const testSchema = buildSchema(/* GraphQL */ `
        type Query {
          user(id: ID!): User!
        }

        type User {
          id: ID!
          username: String!
          email: String!
        }
      `);

      const query = parse(/* GraphQL */ `
        query user {
          user(id: 1) {
            id
            username
            email
          }
        }
      `);

      const config = {
        typesSuffix: 'Type',
      };

      const { content } = await plugin(testSchema, [{ location: '', document: query }], config, {
        outputFile: 'graphql.ts',
      });

      expect(content).not.toContain('UserTypeQueryVariablesType');
      expect(content).not.toContain('UserTypeQueryType');
      expect(content).toContain('UserQueryVariablesType');
      expect(content).toContain('UserQueryType');
    });

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
        { preResolveTypes: false },
        {
          outputFile: 'graphql.ts',
        }
      );

      expect(content).toMatchInlineSnapshot(`
        "export type TestQueryQueryVariables = Exact<{ [key: string]: never; }>;


        export type TestQueryQuery = { fooBar: Array<
            | Pick<Foo, 'id'>
            | Pick<Bar, 'id'>
          > };

        type FooBarFragment_Foo_Fragment = Pick<Foo, 'id'>;

        type FooBarFragment_Bar_Fragment = Pick<Bar, 'id'>;

        export type FooBarFragmentFragment =
          | FooBarFragment_Foo_Fragment
          | FooBarFragment_Bar_Fragment
        ;
        "
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
        { preResolveTypes: false },
        {
          outputFile: 'graphql.ts',
        }
      );

      expect(content).toMatchInlineSnapshot(`
        "export type ProductFragmentFragment = Pick<Product, 'id' | 'title'>;

        export type PriceFragmentFragment = (
          Pick<Price, 'id'>
          & { item: Array<Maybe<Pick<Product, 'id' | 'title'>>> }
        );
        "
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
        { preResolveTypes: false },
        {
          outputFile: 'graphql.ts',
        }
      );

      expect(content).toMatchInlineSnapshot(`
        "export type UserQueryVariables = Exact<{
          withUser?: boolean;
        }>;


        export type UserQuery = { user?: Maybe<Pick<User, 'name'>> };
        "
      `);
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
        { preResolveTypes: false },
        {
          outputFile: 'graphql.ts',
        }
      );

      expect(content).toMatchInlineSnapshot(`
        "export type DashboardVersionFragmentFragment = { tiles:
            | (
              Pick<DashboardTileFilterDetails, 'tileId'>
              & { md: Pick<TileFilterMetadata, 'viz' | 'columnInfo'> }
            )
            | (
              Pick<DashboardTileParameterDetails, 'tileId'>
              & { md: Pick<TileParameterMetadata, 'viz' | 'columnInfo'> }
            )
           };
        "
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
        { preResolveTypes: false },
        {
          outputFile: 'graphql.ts',
        }
      );

      expect(content).toMatchInlineSnapshot(`
        "export type DashboardVersionFragmentFragment = { tiles:
            | (
              Pick<DashboardTileFilterDetails, 'tileId'>
              & { md: Pick<TileFilterMetadata, 'viz' | 'columnInfo'> }
            )
            | (
              Pick<DashboardTileParameterDetails, 'tileId'>
              & { md: Pick<TileParameterMetadata, 'viz' | 'columnInfo'> }
            )
           };
        "
      `);
    });

    it('#3950 - Invalid output with fragments and skipTypename: true', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type Query {
          animals: [Animal!]!
        }

        interface Animal {
          id: ID!
        }
        type Duck implements Animal {
          id: ID!
        }
        type Lion implements Animal {
          id: ID!
        }
        type Puma implements Animal {
          id: ID!
        }
        type Wolf implements Animal {
          id: ID!
        }
      `);

      const query = parse(/* GraphQL */ `
        fragment CatFragment on Animal {
          ... on Lion {
            id
          }
          ... on Puma {
            id
          }
        }

        query kitty {
          animals {
            ...CatFragment
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

      expect(content).toMatchInlineSnapshot(`
        "type CatFragment_Lion_Fragment = { id: string };

        type CatFragment_Puma_Fragment = { id: string };

        export type CatFragmentFragment =
          | CatFragment_Lion_Fragment
          | CatFragment_Puma_Fragment
        ;

        export type KittyQueryVariables = Exact<{ [key: string]: never; }>;


        export type KittyQuery = { animals: Array<
            | { id: string }
            | { id: string }
            | Record<PropertyKey, never>
          > };
        "
      `);
    });

    it('#3950 - Invalid output with fragments and skipTypename: false', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type Query {
          animals: [Animal!]!
        }

        interface Animal {
          id: ID!
        }
        type Duck implements Animal {
          id: ID!
        }
        type Lion implements Animal {
          id: ID!
        }
        type Puma implements Animal {
          id: ID!
        }
        type Wolf implements Animal {
          id: ID!
        }
      `);

      const query = parse(/* GraphQL */ `
        fragment CatFragment on Animal {
          ... on Lion {
            id
          }
          ... on Puma {
            id
          }
        }

        query kitty {
          animals {
            ...CatFragment
          }
        }
      `);

      const { content } = await plugin(
        schema,
        [{ location: '', document: query }],
        {
          skipTypename: false,
        },
        {
          outputFile: 'graphql.ts',
        }
      );

      expect(content).toMatchInlineSnapshot(`
        "type CatFragment_Lion_Fragment = { id: string };

        type CatFragment_Puma_Fragment = { id: string };

        export type CatFragmentFragment =
          | CatFragment_Lion_Fragment
          | CatFragment_Puma_Fragment
        ;

        export type KittyQueryVariables = Exact<{ [key: string]: never; }>;


        export type KittyQuery = { animals: Array<
            | { id: string }
            | { id: string }
            | Record<PropertyKey, never>
          > };
        "
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
          preResolveTypes: false,
        },
        {
          outputFile: 'graphql.ts',
        }
      );

      expect(content).toMatchInlineSnapshot(`
        "export type UserQueryVariables = Exact<{ [key: string]: never; }>;


        export type UserQuery = { user:
            | Pick<User, 'id' | 'login'>
            | Record<PropertyKey, never>
           };
        "
      `);
    });

    it('#4888 - Types for input Lists do not support coercion', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type User {
          id: ID!
        }

        type Query {
          search(testArray: [String], requireString: [String]!, innerRequired: [String!]!): [User!]
        }
      `);

      const ast = parse(/* GraphQL */ `
        query user($testArray: [String], $requireString: [String]!, $innerRequired: [String!]!) {
          search(testArray: $testArray, requireString: $requireString, innerRequired: $innerRequired) {
            id
          }
        }
      `);
      const config = { preResolveTypes: true };
      const { content } = await plugin(schema, [{ location: '', document: ast }], config, {
        outputFile: 'graphql.ts',
      });

      expect(content).toMatchInlineSnapshot(`
        "export type UserQueryVariables = Exact<{
          testArray?: Array<string | null> | string | null;
          requireString: Array<string | null> | string;
          innerRequired: Array<string> | string;
        }>;


        export type UserQuery = { search: Array<{ id: string }> | null };
        "
      `);
      await validate(content);
    });

    it('#5352 - Prevent array input coercion if arrayInputCoercion = false', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type User {
          id: ID!
        }

        type Query {
          search(testArray: [String], requireString: [String]!, innerRequired: [String!]!): [User!]
        }
      `);

      const ast = parse(/* GraphQL */ `
        query user($testArray: [String], $requireString: [String]!, $innerRequired: [String!]!) {
          search(testArray: $testArray, requireString: $requireString, innerRequired: $innerRequired) {
            id
          }
        }
      `);
      const config = { preResolveTypes: true, arrayInputCoercion: false };
      const { content } = await plugin(schema, [{ location: '', document: ast }], config, {
        outputFile: 'graphql.ts',
      });

      expect(content).toMatchInlineSnapshot(`
        "export type UserQueryVariables = Exact<{
          testArray?: Array<string | null> | null;
          requireString: Array<string | null>;
          innerRequired: Array<string>;
        }>;


        export type UserQuery = { search: Array<{ id: string }> | null };
        "
      `);
      await validate(content);
    });

    it('#5263 - inline fragment spread on interface field results in incorrect types', async () => {
      const schema = buildSchema(/* GraphQL */ `
        interface Entity {
          id: ID!
        }

        interface NamedEntity implements Entity {
          id: ID!
          name: String!
        }

        type Session implements Entity {
          id: ID!
          data: String!
        }

        type User implements NamedEntity & Entity {
          id: ID!
          name: String!
        }

        type Query {
          entity(id: ID!): Entity!
        }
      `);

      const document = parse(/* GraphQL */ `
        query entity {
          entity(id: 1) {
            id
            ... on NamedEntity {
              name
            }
          }
        }
      `);

      const { content } = await plugin(
        schema,
        [{ location: '', document }],
        { preResolveTypes: false },
        {
          outputFile: 'graphql.ts',
        }
      );

      expect(content).toMatchInlineSnapshot(`
        "export type EntityQueryVariables = Exact<{ [key: string]: never; }>;


        export type EntityQuery = { entity:
            | Pick<Session, 'id'>
            | Pick<User, 'name' | 'id'>
           };
        "
      `);
    });

    describe('#6149 - operation fragment merging behavior', () => {
      const schema = buildSchema(/* GraphQL */ `
        type Query {
          user: User!
        }

        type User {
          id: ID!
          name: String!
          friends: [User!]!
        }
      `);

      it('InlineFragmentQuery', async () => {
        const document = parse(/* GraphQL */ `
          query InlineFragmentQuery {
            user {
              ... on User {
                friends {
                  id
                }
              }
              ... on User {
                friends {
                  name
                }
              }
            }
          }
        `);

        const { content } = await plugin(
          schema,
          [{ location: '', document }],
          { preResolveTypes: false },
          {
            outputFile: 'graphql.ts',
          }
        );

        expect(content).toMatchInlineSnapshot(`
          "export type InlineFragmentQueryQueryVariables = Exact<{ [key: string]: never; }>;


          export type InlineFragmentQueryQuery = { user: { friends: Array<Pick<User, 'id' | 'name'>> } };
          "
        `);
      });
      it('SpreadFragmentQuery', async () => {
        const document = parse(/* GraphQL */ `
          fragment UserFriendsIdFragment on Query {
            user {
              friends {
                id
              }
            }
          }

          fragment UserFriendsNameFragment on Query {
            user {
              friends {
                name
              }
            }
          }

          query SpreadFragmentQuery {
            ...UserFriendsIdFragment
            ...UserFriendsNameFragment
          }
        `);

        const { content } = await plugin(
          schema,
          [{ location: '', document }],
          { preResolveTypes: false },
          {
            outputFile: 'graphql.ts',
          }
        );

        expect(content).toMatchInlineSnapshot(`
          "export type UserFriendsIdFragmentFragment = { user: { friends: Array<Pick<User, 'id'>> } };

          export type UserFriendsNameFragmentFragment = { user: { friends: Array<Pick<User, 'name'>> } };

          export type SpreadFragmentQueryQueryVariables = Exact<{ [key: string]: never; }>;


          export type SpreadFragmentQueryQuery = { user: { friends: Array<Pick<User, 'id' | 'name'>> } };
          "
        `);
      });
      it('SpreadFragmentWithSelectionQuery', async () => {
        const document = parse(/* GraphQL */ `
          fragment UserFriendsNameFragment on Query {
            user {
              friends {
                name
              }
            }
          }

          query SpreadFragmentWithSelectionQuery {
            user {
              id
              friends {
                id
              }
            }
            ...UserFriendsNameFragment
          }
        `);

        const { content } = await plugin(
          schema,
          [{ location: '', document }],
          { preResolveTypes: false },
          {
            outputFile: 'graphql.ts',
          }
        );

        expect(content).toMatchInlineSnapshot(`
          "export type UserFriendsNameFragmentFragment = { user: { friends: Array<Pick<User, 'name'>> } };

          export type SpreadFragmentWithSelectionQueryQueryVariables = Exact<{ [key: string]: never; }>;


          export type SpreadFragmentWithSelectionQueryQuery = { user: (
              Pick<User, 'id'>
              & { friends: Array<Pick<User, 'id' | 'name'>> }
            ) };
          "
        `);
      });
      it('SpreadFragmentWithSelectionQuery - flatten', async () => {
        const document = parse(/* GraphQL */ `
          fragment UserFriendsNameFragment on Query {
            user {
              friends {
                name
              }
            }
          }

          query SpreadFragmentWithSelectionQuery {
            user {
              id
              friends {
                id
              }
            }
            ...UserFriendsNameFragment
          }
        `);

        const { content } = await plugin(
          schema,
          [{ location: '', document }],
          { preResolveTypes: false },
          {
            outputFile: 'graphql.ts',
          }
        );

        expect(content).toMatchInlineSnapshot(`
          "export type UserFriendsNameFragmentFragment = { user: { friends: Array<Pick<User, 'name'>> } };

          export type SpreadFragmentWithSelectionQueryQueryVariables = Exact<{ [key: string]: never; }>;


          export type SpreadFragmentWithSelectionQueryQuery = { user: (
              Pick<User, 'id'>
              & { friends: Array<Pick<User, 'id' | 'name'>> }
            ) };
          "
        `);
      });
    });

    it('#7811 - generates $fragmentName for fragment subtypes for fragment masking', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type Character {
          name: String
        }

        type Jedi {
          name: String
          side: String
        }

        type Droid {
          model: String
        }

        union People = Character | Jedi | Droid

        type Query {
          people: People!
        }
      `);

      const query = parse(/* GraphQL */ `
        query GetPeople {
          people {
            ...PeopleInfo
          }
        }
      `);

      const fragment = parse(/* GraphQL */ `
        fragment PeopleInfo on People {
          ... on Character {
            name
          }

          ... on Jedi {
            side
          }

          ... on Droid {
            model
          }
        }
      `);

      const { content } = await plugin(
        schema,
        [
          { location: '', document: query },
          { location: '', document: fragment },
        ],
        { inlineFragmentTypes: 'mask' },
        { outputFile: 'graphql.ts' }
      );

      expect(content).toMatchInlineSnapshot(`
        "export type GetPeopleQueryVariables = Exact<{ [key: string]: never; }>;


        export type GetPeopleQuery = { people:
            | { ' $fragmentRefs'?: { 'PeopleInfo_Character_Fragment': PeopleInfo_Character_Fragment } }
            | { ' $fragmentRefs'?: { 'PeopleInfo_Jedi_Fragment': PeopleInfo_Jedi_Fragment } }
            | { ' $fragmentRefs'?: { 'PeopleInfo_Droid_Fragment': PeopleInfo_Droid_Fragment } }
           };

        type PeopleInfo_Character_Fragment = { name: string | null } & { ' $fragmentName'?: 'PeopleInfo_Character_Fragment' };

        type PeopleInfo_Jedi_Fragment = { side: string | null } & { ' $fragmentName'?: 'PeopleInfo_Jedi_Fragment' };

        type PeopleInfo_Droid_Fragment = { model: string | null } & { ' $fragmentName'?: 'PeopleInfo_Droid_Fragment' };

        export type PeopleInfoFragment =
          | PeopleInfo_Character_Fragment
          | PeopleInfo_Jedi_Fragment
          | PeopleInfo_Droid_Fragment
        ;
        "
      `);
    });

    it('#6874 - generates types when parent type differs from spread fragment member types and preResolveTypes=true', async () => {
      const testSchema = buildSchema(/* GraphQL */ `
        interface Animal {
          name: String!
        }
        type Bat implements Animal {
          name: String!
          features: BatFeatures!
        }
        type BatFeatures {
          color: String!
          wingspan: Int!
        }
        type Snake implements Animal {
          name: String!
          features: SnakeFeatures!
        }
        type SnakeFeatures {
          color: String!
          length: Int!
        }
        type Error {
          message: String!
        }
        union SnakeResult = Snake | Error
        type Query {
          snake: SnakeResult!
        }
      `);

      const query = parse(/* GraphQL */ `
        query SnakeQuery {
          snake {
            ... on Snake {
              name
              ...AnimalFragment
            }
          }
        }
        fragment AnimalFragment on Animal {
          ... on Bat {
            features {
              color
              wingspan
            }
          }
          ... on Snake {
            features {
              color
              length
            }
          }
        }
      `);

      const config = { preResolveTypes: true };

      const { content } = await plugin(testSchema, [{ location: '', document: query }], config, {
        outputFile: 'graphql.ts',
      });

      expect(content).toMatchSnapshot();
    });

    it('#8793 selecting __typename should not be optional', async () => {
      const testSchema = buildSchema(/* GraphQL */ `
        interface Animal {
          name: String!
        }
        type Bat implements Animal {
          name: String!
          features: BatFeatures!
        }
        type BatFeatures {
          color: String!
          wingspan: Int!
        }
        type Snake implements Animal {
          name: String!
          features: SnakeFeatures!
        }
        type SnakeFeatures {
          color: String!
          length: Int!
        }
        type Error {
          message: String!
        }
        union SnakeResult = Snake | Error
        type Query {
          snake: SnakeResult!
        }
      `);

      const query = parse(/* GraphQL */ `
        query SnakeQuery {
          __typename
          snake {
            __typename
          }
        }
      `);

      const config = { preResolveTypes: true };

      const { content } = await plugin(testSchema, [{ location: '', document: query }], config, {
        outputFile: 'graphql.ts',
      });

      expect(content).toMatchSnapshot();
    });

    it('#8461 - conditional directives are ignored on fields with alias', async () => {
      const testSchema = buildSchema(/* GraphQL */ `
        type User {
          firstName: String!
          lastName: Int!
          address: Address!
        }

        type Address {
          postalCode: String!
        }

        type Query {
          viewer: User!
        }
      `);

      const query = parse(/* GraphQL */ `
        query UserQuery($skipFirstName: Boolean!, $skipAddress: Boolean!) {
          viewer {
            givenName: firstName @skip(if: $skipFirstName)
            lastName
            mailingAddress: address @skip(if: $skipAddress) {
              postalCode
            }
          }
        }
      `);

      const config = { preResolveTypes: true };

      const { content } = await plugin(testSchema, [{ location: '', document: query }], config, {
        outputFile: 'graphql.ts',
      });

      expect(content).toMatchInlineSnapshot(`
        "export type UserQueryQueryVariables = Exact<{
          skipFirstName: boolean;
          skipAddress: boolean;
        }>;


        export type UserQueryQuery = { viewer: { lastName: number, givenName?: string, mailingAddress?: { postalCode: string } } };
        "
      `);
    });
  });

  describe('conditional directives handling', () => {
    it('fields with @skip, @include should pre resolve into optional', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type Query {
          user: User!
        }

        type User {
          name: String!
          address: String!
          nicknames: [String!]
          parents: [User!]!
        }
      `);

      const fragment = parse(/* GraphQL */ `
        query user($showAddress: Boolean!) {
          user {
            name
            address @include(if: $showAddress)
            nicknames @include(if: $showNicknames)
            parents @include(if: $showParents)
          }
        }
      `);

      const { content } = await plugin(
        schema,
        [{ location: '', document: fragment }],
        {
          preResolveTypes: true,
        },
        {
          outputFile: 'graphql.ts',
        }
      );

      expect(content).toMatchInlineSnapshot(`
        "export type UserQueryVariables = Exact<{
          showAddress: boolean;
        }>;


        export type UserQuery = { user: { name: string, address?: string, nicknames?: Array<string> | null, parents?: Array<User> } };
        "
      `);
    });

    it('objects with @skip, @include should pre resolve into optional', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type Query {
          user: User!
        }

        type User {
          id: String!
          name: String!
          address: Address!
          friends: [User!]!
          moreFriends: [User!]!
        }

        type Address {
          city: String!
        }
      `);

      const fragment = parse(/* GraphQL */ `
        query user($showAddress: Boolean!, $showName: Boolean!) {
          user {
            id
            name @include(if: $showName)
            address @include(if: $showAddress) {
              city
            }
            friends @include(if: $isFriendly) {
              id
            }
          }
        }
      `);

      const { content } = await plugin(
        schema,
        [{ location: '', document: fragment }],
        {
          preResolveTypes: true,
        },
        {
          outputFile: 'graphql.ts',
        }
      );

      expect(content).toMatchInlineSnapshot(`
        "export type UserQueryVariables = Exact<{
          showAddress: boolean;
          showName: boolean;
        }>;


        export type UserQuery = { user: { id: string, name?: string, address?: { city: string }, friends?: Array<{ id: string }> } };
        "
      `);
    });

    it('fields with @skip, @include should make container resolve into MakeOptional type', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type Query {
          user: User!
        }
        type User {
          id: String!
          name: String!
          address: Address!
          friends: [User!]!
        }
        type Address {
          city: String!
        }
      `);

      const fragment = parse(/* GraphQL */ `
        query user($showAddress: Boolean!, $showName: Boolean!) {
          user {
            id
            name @include(if: $showName)
            address @include(if: $showAddress) {
              city
            }
            friends @include(if: $isFriendly) {
              id
            }
          }
        }
      `);

      const { content } = await plugin(
        schema,
        [{ location: '', document: fragment }],
        { preResolveTypes: false },
        {
          outputFile: 'graphql.ts',
        }
      );

      expect(content).toMatchInlineSnapshot(`
        "export type UserQueryVariables = Exact<{
          showAddress: boolean;
          showName: boolean;
        }>;


        export type UserQuery = { user: (
            MakeOptional<Pick<User, 'id' | 'name'>, 'name'>
            & {
              address?: Pick<Address, 'city'>,
              friends?: Array<Pick<User, 'id'>>,
            }
          ) };
        "
      `);
    });

    it('Should handle "preResolveTypes" ', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type Query {
          user(id: ID!): User!
        }

        type User {
          id: ID!
          username: String!
          email: String
        }
      `);
      const operations = parse(/* GraphQL */ `
        query user {
          user(id: 1) {
            id
            username
            email
          }
        }
      `);
      const config = { preResolveTypes: true };
      const { content } = await plugin(schema, [{ location: '', document: operations }], config, {
        outputFile: 'graphql.ts',
      });

      expect(content).toMatchInlineSnapshot(
        `
        "export type UserQueryVariables = Exact<{ [key: string]: never; }>;


        export type UserQuery = { user: { id: string, username: string, email: string | null } };
        "
      `
      );
    });

    it('optionals (?) on types should be avoided by default', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type Query {
          me: User!
        }

        type User {
          messages: [Message!]!
        }

        type Message {
          content: String!
        }
      `);

      const fragment = parse(/* GraphQL */ `
        query MyQuery($include: Boolean!) {
          me {
            messages @include(if: $include) {
              content
            }
          }
        }
      `);

      const { content } = await plugin(
        schema,
        [{ location: '', document: fragment }],
        {
          nonOptionalTypename: true,
          preResolveTypes: false,
        },
        {
          outputFile: 'graphql.ts',
        }
      );

      expect(content).toMatchInlineSnapshot(`
        "export type MyQueryQueryVariables = Exact<{
          include: boolean;
        }>;


        export type MyQueryQuery = (
          { __typename: 'Query' }
          & { me: (
            { __typename: 'User' }
            & { messages?: Array<(
              { __typename: 'Message' }
              & Pick<Message, 'content'>
            )> }
          ) }
        );
        "
      `);
    });

    it('inline fragment with conditional directives', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type Query {
          user: User
          group: Group!
        }

        type User {
          name: String
        }

        type Group {
          id: Int!
        }
      `);

      const fragment = parse(/* GraphQL */ `
        query user($withUser: Boolean! = false) {
          ... @include(if: $withUser) {
            user {
              name
            }
            group {
              id
            }
          }
        }
      `);

      const { content } = await plugin(
        schema,
        [{ location: '', document: fragment }],
        { preResolveTypes: true },
        {
          outputFile: 'graphql.ts',
        }
      );

      expect(content).toMatchInlineSnapshot(`
        "export type UserQueryVariables = Exact<{
          withUser?: boolean;
        }>;


        export type UserQuery = { user?: { name: string | null } | null, group?: { id: number } };
        "
      `);
    });

    it('resolve optionals according to maybeValue and conditional directives', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type Query {
          user: User!
        }

        type User {
          name: String!
          age: Int
          address: String!
          nicknames: [String!]
          parents: [User!]!
        }
      `);

      const fragment = parse(/* GraphQL */ `
        query user($showProperty: Boolean!) {
          user {
            name
            age
            address @include(if: $showProperty)
            nicknames @include(if: $showProperty)
            parents @include(if: $showProperty)
          }
        }
      `);

      const { content } = await plugin(
        schema,
        [{ location: '', document: fragment }],
        {
          preResolveTypes: true,
          maybeValue: "T | 'specialType'",
        },
        {
          outputFile: 'graphql.ts',
        }
      );
      expect(content).toMatchInlineSnapshot(`
        "export type UserQueryVariables = Exact<{
          showProperty: boolean;
        }>;


        export type UserQuery = { user: { name: string, age: number | 'specialType', address?: string, nicknames?: Array<string> | 'specialType', parents?: Array<User> } };
        "
      `);
    });

    it('inline fragment with conditional directives, without preResolveTypes', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type Query {
          user: User
          group: Group!
        }

        type User {
          name: String
        }

        type Group {
          id: Int!
        }
      `);

      const fragment = parse(/* GraphQL */ `
        query user($withUser: Boolean! = false) {
          ... @include(if: $withUser) {
            user {
              name
            }
            group {
              id
            }
          }
        }
      `);

      const { content } = await plugin(
        schema,
        [{ location: '', document: fragment }],
        { preResolveTypes: false },
        {
          outputFile: 'graphql.ts',
        }
      );

      expect(content).toMatchInlineSnapshot(`
        "export type UserQueryVariables = Exact<{
          withUser?: boolean;
        }>;


        export type UserQuery = {
            user?: Maybe<Pick<User, 'name'>>,
            group?: Pick<Group, 'id'>,
          };
        "
      `);
    });
  });

  describe('incremental delivery directive handling', () => {
    it('should generate an union of initial and deferred fields for fragments (preResolveTypes: true)', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type Address {
          street1: String!
        }

        type Phone {
          home: String!
        }

        type Employment {
          title: String!
        }

        type User {
          name: String!
          email: String!
          address: Address!
          phone: Phone!
          employment: Employment!
          widgetCount: Int!
          widgetPreference: String!
          clearanceLevel: String!
          favoriteFood: String!
          leastFavoriteFood: String!
        }

        type Query {
          user: User!
        }
      `);

      const fragment = parse(/* GraphQL */ `
        fragment WidgetFragment on User {
          widgetCount
          widgetPreference
        }

        fragment FoodFragment on User {
          favoriteFood
          leastFavoriteFood
        }

        fragment EmploymentFragment on User {
          employment {
            title
          }
        }

        query user {
          user {
            # Test inline fragment defer
            ... @defer {
              email
            }

            # Test inline fragment defer with nested selection set
            ... @defer {
              address {
                street1
              }
            }

            # Test named fragment defer
            ...WidgetFragment @defer

            # Test a secondary named fragment defer
            ...FoodFragment @defer

            # Not deferred fields, fragments, selection sets, etc are left alone
            name
            phone {
              home
            }
            ...EmploymentFragment
            ... {
              clearanceLevel
            }
          }
        }
      `);

      const { content } = await plugin(
        schema,
        [{ location: '', document: fragment }],
        { preResolveTypes: true },
        { outputFile: 'graphql.ts' }
      );

      expect(content).toMatchInlineSnapshot(`
        "export type WidgetFragmentFragment = { widgetCount: number, widgetPreference: string };

        export type FoodFragmentFragment = { favoriteFood: string, leastFavoriteFood: string };

        export type EmploymentFragmentFragment = { employment: { title: string } };

        export type UserQueryVariables = Exact<{ [key: string]: never; }>;


        export type UserQuery = { user: { clearanceLevel: string, name: string, phone: { home: string }, employment: { title: string } } & ({ email: string } | { email?: never }) & ({ address: { street1: string } } | { address?: never }) & ({ widgetCount: number, widgetPreference: string } | { widgetCount?: never, widgetPreference?: never }) & ({ favoriteFood: string, leastFavoriteFood: string } | { favoriteFood?: never, leastFavoriteFood?: never }) };
        "
      `);
    });

    it('should generate an union of initial and deferred fields for fragments using MakeEmpty (preResolveTypes: false)', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type Address {
          street1: String!
        }

        type Phone {
          home: String!
        }

        type Employment {
          title: String!
        }

        type User {
          name: String!
          email: String!
          address: Address!
          phone: Phone!
          employment: Employment!
          widgetCount: Int!
          clearanceLevel: String!
        }

        type Query {
          user: User!
        }
      `);

      const fragment = parse(/* GraphQL */ `
        fragment WidgetFragment on User {
          widgetCount
        }

        fragment EmploymentFragment on User {
          employment {
            title
          }
        }

        query user {
          user {
            # Test inline fragment defer
            ... @defer {
              email
            }

            # Test inline fragment defer with nested selection set
            ... @defer {
              address {
                street1
              }
            }

            # Test named fragment defer
            ...WidgetFragment @defer

            # Not deferred fields, fragments, selection sets, etc are left alone
            name
            phone {
              home
            }
            ...EmploymentFragment
            ... {
              clearanceLevel
            }
          }
        }
      `);

      const { content } = await plugin(
        schema,
        [{ location: '', document: fragment }],
        { preResolveTypes: false },
        { outputFile: 'graphql.ts' }
      );

      expect(content).toMatchInlineSnapshot(`
        "export type WidgetFragmentFragment = Pick<User, 'widgetCount'>;

        export type EmploymentFragmentFragment = { employment: Pick<Employment, 'title'> };

        export type UserQueryVariables = Exact<{ [key: string]: never; }>;


        export type UserQuery = { user: (
            Pick<User, 'clearanceLevel' | 'name'>
            & {
              phone: Pick<Phone, 'home'>,
              employment: Pick<Employment, 'title'>,
            }
          ) & (Pick<User, 'email'> | MakeEmpty<User, 'email'>) & ({ address: Pick<Address, 'street1'> } | { address?: Pick<Address, 'street1'> }) & (Pick<User, 'widgetCount'> | MakeEmpty<User, 'widgetCount'>) };
        "
      `);
    });

    it('should generate an union of initial and deferred fields for fragments MakeEmpty', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type Address {
          street1: String!
        }

        type Phone {
          home: String!
        }

        type Employment {
          title: String!
        }

        type User {
          name: String!
          email: String!
          address: Address!
          phone: Phone!
          employment: Employment!
          widgetName: String!
          widgetCount: Int!
          clearanceLevel: String!
        }

        type Query {
          user: User!
        }
      `);

      const fragment = parse(/* GraphQL */ `
        fragment WidgetFragment on User {
          widgetName
          widgetCount
        }

        fragment EmploymentFragment on User {
          employment {
            title
          }
        }

        query user {
          user {
            # Test inline fragment defer
            ... @defer {
              email
            }

            # Test inline fragment defer with nested selection set
            ... @defer {
              address {
                street1
              }
            }

            # Test named fragment defer
            ...WidgetFragment @defer

            # Not deferred fields, fragments, selection sets, etc are left alone
            name
            phone {
              home
            }
            ...EmploymentFragment
            ... {
              clearanceLevel
            }
          }
        }
      `);

      const { content } = await plugin(
        schema,
        [{ location: '', document: fragment }],
        {
          preResolveTypes: false,
        },
        { outputFile: 'graphql.ts' }
      );

      expect(content).toMatchInlineSnapshot(`
        "export type WidgetFragmentFragment = Pick<User, 'widgetName' | 'widgetCount'>;

        export type EmploymentFragmentFragment = { employment: Pick<Employment, 'title'> };

        export type UserQueryVariables = Exact<{ [key: string]: never; }>;


        export type UserQuery = { user: (
            Pick<User, 'clearanceLevel' | 'name'>
            & {
              phone: Pick<Phone, 'home'>,
              employment: Pick<Employment, 'title'>,
            }
          ) & (Pick<User, 'email'> | MakeEmpty<User, 'email'>) & ({ address: Pick<Address, 'street1'> } | { address?: Pick<Address, 'street1'> }) & (Pick<User, 'widgetName' | 'widgetCount'> | MakeEmpty<User, 'widgetName' | 'widgetCount'>) };
        "
      `);
    });

    it('should support "preResolveTypes: true"', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type Address {
          street1: String!
        }

        type Phone {
          home: String!
        }

        type Employment {
          title: String!
        }

        type User {
          name: String!
          email: String!
          address: Address!
          phone: Phone!
          employment: Employment!
          widgetCount: Int!
          clearanceLevel: String!
        }

        type Query {
          user: User!
        }
      `);

      const fragment = parse(/* GraphQL */ `
        fragment WidgetFragment on User {
          widgetCount
        }

        fragment EmploymentFragment on User {
          employment {
            title
          }
        }

        query user {
          user {
            # Test inline fragment defer
            ... @defer {
              email
            }

            # Test inline fragment defer with nested selection set
            ... @defer {
              address {
                street1
              }
            }

            # Test named fragment defer
            ...WidgetFragment @defer

            # Not deferred fields, fragments, selection sets, etc are left alone
            name
            phone {
              home
            }
            ...EmploymentFragment
            ... {
              clearanceLevel
            }
          }
        }
      `);

      const { content } = await plugin(
        schema,
        [{ location: '', document: fragment }],
        {
          preResolveTypes: true,
        },
        { outputFile: 'graphql.ts' }
      );

      expect(content).toMatchInlineSnapshot(`
        "export type WidgetFragmentFragment = { widgetCount: number };

        export type EmploymentFragmentFragment = { employment: { title: string } };

        export type UserQueryVariables = Exact<{ [key: string]: never; }>;


        export type UserQuery = { user: { clearanceLevel: string, name: string, phone: { home: string }, employment: { title: string } } & ({ email: string } | { email?: never }) & ({ address: { street1: string } } | { address?: never }) & ({ widgetCount: number } | { widgetCount?: never }) };
        "
      `);
    });

    it('should resolve optionals according to maybeValue together with deferred fragments', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type Address {
          street1: String
        }

        type Phone {
          home: String!
        }

        type Employment {
          title: String!
        }

        type User {
          name: String!
          email: String!
          address: Address!
          phone: Phone!
          employment: Employment!
          widgetName: String!
          widgetCount: Int!
          clearanceLevel: String!
        }

        type Query {
          user: User!
        }
      `);

      const fragment = parse(/* GraphQL */ `
        fragment WidgetFragment on User {
          widgetName
          widgetCount
        }

        fragment EmploymentFragment on User {
          employment {
            title
          }
        }

        query user {
          user {
            # Test inline fragment defer
            ... @defer {
              email
            }

            # Test inline fragment defer with nested selection set
            ... @defer {
              address {
                street1
              }
            }

            # Test named fragment defer
            ...WidgetFragment @defer

            # Not deferred fields, fragments, selection sets, etc are left alone
            name
            phone {
              home
            }
            ...EmploymentFragment
            ... {
              clearanceLevel
            }
          }
        }
      `);

      const { content } = await plugin(
        schema,
        [{ location: '', document: fragment }],
        {
          preResolveTypes: true,
          maybeValue: "T | 'specialType'",
        },
        { outputFile: 'graphql.ts' }
      );

      expect(content).toMatchInlineSnapshot(`
        "export type WidgetFragmentFragment = { widgetName: string, widgetCount: number };

        export type EmploymentFragmentFragment = { employment: { title: string } };

        export type UserQueryVariables = Exact<{ [key: string]: never; }>;


        export type UserQuery = { user: { clearanceLevel: string, name: string, phone: { home: string }, employment: { title: string } } & ({ email: string } | { email?: never }) & ({ address: { street1: string | 'specialType' } } | { address?: never }) & ({ widgetName: string, widgetCount: number } | { widgetName?: never, widgetCount?: never }) };
        "
      `);
    });

    it('should generate correct types with inlineFragmentTypes: "mask""', async () => {
      const schema = buildSchema(/* GraphQL */ `
        type Address {
          street1: String!
        }

        type Phone {
          home: String!
        }

        type Employment {
          title: String!
        }

        type User {
          name: String!
          email: String!
          address: Address!
          phone: Phone!
          employment: Employment!
          widgetCount: Int!
          widgetPreference: String!
          clearanceLevel: String!
          favoriteFood: String!
          leastFavoriteFood: String!
        }

        type Query {
          user: User!
        }
      `);

      const fragment = parse(/* GraphQL */ `
        fragment WidgetFragment on User {
          widgetCount
          widgetPreference
        }

        fragment FoodFragment on User {
          favoriteFood
          leastFavoriteFood
        }

        fragment EmploymentFragment on User {
          employment {
            title
          }
        }

        query user {
          user {
            # Test inline fragment defer
            ... @defer {
              email
            }

            # Test inline fragment defer with nested selection set
            ... @defer {
              address {
                street1
              }
            }

            # Test named fragment defer
            ...WidgetFragment @defer

            # Test a secondary named fragment defer
            ...FoodFragment @defer

            # Not deferred fields, fragments, selection sets, etc are left alone
            name
            phone {
              home
            }
            ...EmploymentFragment
            ... {
              clearanceLevel
            }
          }
        }
      `);

      const { content } = await plugin(
        schema,
        [{ location: '', document: fragment }],
        { preResolveTypes: true, inlineFragmentTypes: 'mask' },
        { outputFile: 'graphql.ts' }
      );

      expect(content).toMatchInlineSnapshot(`
        "export type WidgetFragmentFragment = { widgetCount: number, widgetPreference: string } & { ' $fragmentName'?: 'WidgetFragmentFragment' };

        export type FoodFragmentFragment = { favoriteFood: string, leastFavoriteFood: string } & { ' $fragmentName'?: 'FoodFragmentFragment' };

        export type EmploymentFragmentFragment = { employment: { title: string } } & { ' $fragmentName'?: 'EmploymentFragmentFragment' };

        export type UserQueryVariables = Exact<{ [key: string]: never; }>;


        export type UserQuery = { user: (
            { clearanceLevel: string, name: string, phone: { home: string } }
            & { ' $fragmentRefs'?: { 'EmploymentFragmentFragment': EmploymentFragmentFragment } }
          ) & ({ email: string } | { email?: never }) & ({ address: { street1: string } } | { address?: never }) & { ' $fragmentRefs'?: { 'WidgetFragmentFragment': Incremental<WidgetFragmentFragment> } } & { ' $fragmentRefs'?: { 'FoodFragmentFragment': Incremental<FoodFragmentFragment> } } };
        "
      `);
    });
  });

  it('handles unnamed queries', async () => {
    const ast = parse(/* GraphQL */ `
      query {
        notifications {
          id
        }
      }
    `);

    const result = await plugin(
      schema,
      [{ location: 'test-file.ts', document: ast }],
      { preResolveTypes: false },
      { outputFile: '' }
    );
    expect(result.content).toMatchInlineSnapshot(`
      "export type Unnamed_1_QueryVariables = Exact<{ [key: string]: never; }>;


      export type Unnamed_1_Query = { notifications: Array<
          | Pick<TextNotification, 'id'>
          | Pick<ImageNotification, 'id'>
        > };
      "
    `);
  });

  describe('inlineFragmentTypes option', () => {
    it("'combine' yields correct types", async () => {
      const ast = parse(/* GraphQL */ `
        query {
          me {
            ...UserFragment
          }
        }
        fragment UserFragment on User {
          id
        }
      `);
      const result = await plugin(
        schema,
        [{ location: 'test-file.ts', document: ast }],
        { inlineFragmentTypes: 'combine' },
        { outputFile: '' }
      );
      expect(result.content).toMatchInlineSnapshot(`
        "export type Unnamed_1_QueryVariables = Exact<{ [key: string]: never; }>;


        export type Unnamed_1_Query = { me: UserFragmentFragment | null };

        export type UserFragmentFragment = { id: string };
        "
      `);
    });

    it("'inline' yields correct types", async () => {
      const ast = parse(/* GraphQL */ `
        query {
          me {
            ...UserFragment
          }
        }
        fragment UserFragment on User {
          id
        }
      `);
      const result = await plugin(
        schema,
        [{ location: 'test-file.ts', document: ast }],
        { inlineFragmentTypes: 'inline' },
        { outputFile: '' }
      );
      expect(result.content).toMatchInlineSnapshot(`
        "export type Unnamed_1_QueryVariables = Exact<{ [key: string]: never; }>;


        export type Unnamed_1_Query = { me: { id: string } | null };

        export type UserFragmentFragment = { id: string };
        "
      `);
    });

    it("'mask' yields correct types", async () => {
      const ast = parse(/* GraphQL */ `
        query {
          me {
            ...UserFragment
          }
        }
        fragment UserFragment on User {
          id
        }
      `);
      const result = await plugin(
        schema,
        [{ location: 'test-file.ts', document: ast }],
        { inlineFragmentTypes: 'mask' },
        { outputFile: '' }
      );
      expect(result.content).toMatchInlineSnapshot(`
        "export type Unnamed_1_QueryVariables = Exact<{ [key: string]: never; }>;


        export type Unnamed_1_Query = { me: { ' $fragmentRefs'?: { 'UserFragmentFragment': UserFragmentFragment } } | null };

        export type UserFragmentFragment = { id: string } & { ' $fragmentName'?: 'UserFragmentFragment' };
        "
      `);
    });
  });
});
