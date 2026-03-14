import { buildSchema, parse } from 'graphql';
import { plugin } from '../src/index.js';
import { schema } from './shared/schema.js';

describe('TypeScript Operations Plugin - @include directives', () => {
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
      { maybeValue: "T | 'specialType'" },
      { outputFile: 'graphql.ts' }
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
      { allowUndefinedQueryVariables: true },
      { outputFile: 'graphql.ts' }
    );

    expect(content).toMatchInlineSnapshot(`
        "export type UserQueryVariables = Exact<{
          showProperty: boolean;
        }> | undefined;


        export type UserQuery = { user: { name: string, age: number | null, address?: string, nicknames?: Array<string> | null, parents?: Array<User> } };
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

    const { content } = await plugin(schema, [{ location: '', document: fragment }], {}, { outputFile: 'graphql.ts' });

    expect(content).toMatchInlineSnapshot(`
        "export type UserQueryVariables = Exact<{
          withUser?: boolean;
        }>;


        export type UserQuery = { user?: { name: string | null } | null };
        "
      `);
  });

  it('fields with @include should pre resolve into optional', async () => {
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

    const { content } = await plugin(schema, [{ location: '', document: fragment }], {}, { outputFile: 'graphql.ts' });

    expect(content).toMatchInlineSnapshot(`
        "export type UserQueryVariables = Exact<{
          showAddress: boolean;
        }>;


        export type UserQuery = { user: { name: string, address?: string, nicknames?: Array<string> | null, parents?: Array<User> } };
        "
      `);
  });

  it('objects with @include should pre resolve into optional', async () => {
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

    const { content } = await plugin(schema, [{ location: '', document: fragment }], {}, { outputFile: 'graphql.ts' });

    expect(content).toMatchInlineSnapshot(`
        "export type UserQueryVariables = Exact<{
          showAddress: boolean;
          showName: boolean;
        }>;


        export type UserQuery = { user: { id: string, name?: string, address?: { city: string }, friends?: Array<{ id: string }> } };
        "
      `);
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
      { nonOptionalTypename: true },
      { outputFile: 'graphql.ts' }
    );

    expect(content).toMatchInlineSnapshot(`
        "export type MyQueryQueryVariables = Exact<{
          include: boolean;
        }>;


        export type MyQueryQuery = { __typename: 'Query', me: { __typename: 'User', messages?: Array<{ __typename: 'Message', content: string }> } };
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

    const { content } = await plugin(schema, [{ location: '', document: fragment }], {}, { outputFile: 'graphql.ts' });

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
      { maybeValue: "T | 'specialType'" },
      { outputFile: 'graphql.ts' }
    );
    expect(content).toMatchInlineSnapshot(`
        "export type UserQueryVariables = Exact<{
          showProperty: boolean;
        }>;


        export type UserQuery = { user: { name: string, age: number | 'specialType', address?: string, nicknames?: Array<string> | 'specialType', parents?: Array<User> } };
        "
      `);
  });

  it('generates optional field when @include is used on an aliased field', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type Query {
        users: [User!]!
      }

      type User {
        id: ID!
        name: String!
      }
    `);

    const document = parse(/* GraphQL */ `
      query GetUsers($included: Boolean!) {
        aliasedUsers: users @include(if: $included) {
          id
          userName: name @include(if: $included)
        }
        users {
          id
          userName: name @include(if: $included)
        }
      }
    `);

    const { content } = await plugin(schema, [{ location: '', document }], {}, { outputFile: 'graphql.ts' });

    expect(content).toMatchInlineSnapshot(`
      "export type GetUsersQueryVariables = Exact<{
        included: boolean;
      }>;


      export type GetUsersQuery = { aliasedUsers?: Array<{ id: string, userName?: string }>, users: Array<{ id: string, userName?: string }> };
      "
    `);
  });
});

describe('TypeScript Operations Plugin - @skip directive', () => {
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

    const { content } = await plugin(testSchema, [{ location: '', document: query }], {}, { outputFile: 'graphql.ts' });

    expect(content).toMatchInlineSnapshot(`
        "export type UserQueryQueryVariables = Exact<{
          skipFirstName: boolean;
          skipAddress: boolean;
        }>;


        export type UserQueryQuery = { viewer: { lastName: number, givenName?: string, mailingAddress?: { postalCode: string } } };
        "
      `);
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
    expect(content).toMatchInlineSnapshot(`
      "export type TextNotificationFragmentFragment = { text?: string };


      export type TextNotificationFragmentFragmentVariables = Exact<{
        skip: boolean;
      }>;
      "
    `);
  });

  it('generates optional field when @skip is used on an aliased field', async () => {
    const schema = buildSchema(/* GraphQL */ `
      type Query {
        users: [User!]!
      }

      type User {
        id: ID!
        name: String!
      }
    `);

    const document = parse(/* GraphQL */ `
      query GetUsers($skipName: Boolean!) {
        users {
          id
          userName: name @skip(if: $skipName)
        }
      }
    `);

    const { content } = await plugin(schema, [{ location: '', document }], {}, { outputFile: 'graphql.ts' });

    expect(content).toMatchInlineSnapshot(`
      "export type GetUsersQueryVariables = Exact<{
        skipName: boolean;
      }>;


      export type GetUsersQuery = { users: Array<{ id: string, userName?: string }> };
      "
    `);
  });
});
