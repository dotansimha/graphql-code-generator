import { buildSchema, parse, versionInfo } from 'graphql';
import { mergeOutputs } from '@graphql-codegen/plugin-helpers';
import { plugin } from '../src/index.js';

/**
 * Fragment arguments (`fragment A($x: Int) on T` and `...A(x: 1)`) are available
 * in graphql v17 with the `experimentalFragmentArguments` parser option.
 *
 * https://graphql.org/blog/2026-06-15-introducing-graphql-js-v17/#experimental-specification-work
 */
describe.skipIf(versionInfo.major < 17)('TypeScript Operations Plugin - fragment arguments', () => {
  const schema = buildSchema(/* GraphQL */ `
    type Query {
      user: User
    }

    enum Size {
      SMALL
      LARGE
    }

    enum Status {
      ACTIVE
      INACTIVE
    }

    input Filter {
      status: Status!
    }

    type User {
      id: ID!
      name: String!
      avatar(size: Size!): String!
      friends(filter: Filter, first: Int = 10): [User!]!
    }
  `);

  const generate = async (source: string, config: Record<string, unknown> = {}) => {
    const output = await plugin(
      schema,
      [{ location: '', document: parse(source, { experimentalFragmentArguments: true }) }],
      config,
      {
        outputFile: 'graphql.ts',
      },
    );
    return mergeOutputs([output]);
  };

  describe('@skip/@include controlled by a fragment argument', () => {
    const fragmentWithSkip = /* GraphQL */ `
      fragment UserFields($skipName: Boolean = false) on User {
        id
        name @skip(if: $skipName)
      }
    `;

    it.each([
      { spread: '...UserFields(skipName: true)', variables: '' },
      { spread: '...UserFields(skipName: false)', variables: '' },
      { spread: '...UserFields', variables: '' },
      { spread: '...UserFields(skipName: $skip)', variables: '($skip: Boolean!)' },
    ])('keeps the field optional for $spread', async ({ spread, variables }) => {
      const content = await generate(/* GraphQL */ `
        query GetUser${variables} {
          user {
            ${spread}
          }
        }
        ${fragmentWithSkip}
      `);

      expect(content).toContain(
        'export type GetUserQuery = { user: { id: string, name?: string } | null };',
      );
      expect(content).toContain('export type UserFieldsFragment = { id: string, name?: string };');
    });

    it('keeps the field optional for @include with a default value of false', async () => {
      const content = await generate(/* GraphQL */ `
        query GetUser {
          user {
            ...UserFields
          }
        }

        fragment UserFields($includeName: Boolean = false) on User {
          id
          name @include(if: $includeName)
        }
      `);

      expect(content).toContain(
        'export type GetUserQuery = { user: { id: string, name?: string } | null };',
      );
    });

    it('keeps the fields optional in an inline fragment controlled by the argument', async () => {
      const content = await generate(/* GraphQL */ `
        query GetUser {
          user {
            ...UserFields(showDetails: true)
          }
        }

        fragment UserFields($showDetails: Boolean!) on User {
          id
          ... @include(if: $showDetails) {
            name
          }
        }
      `);

      expect(content).toContain(
        'export type GetUserQuery = { user: { id: string, name?: string } | null };',
      );
    });

    it('keeps the field optional when the argument goes through a nested spread', async () => {
      const content = await generate(/* GraphQL */ `
        query GetUser {
          user {
            ...UserFields(hide: true)
          }
        }

        fragment UserFields($hide: Boolean!) on User {
          id
          ...UserName(skipName: $hide)
        }

        fragment UserName($skipName: Boolean!) on User {
          name @skip(if: $skipName)
        }
      `);

      expect(content).toContain(
        'export type GetUserQuery = { user: { id: string, name?: string } | null };',
      );
    });

    it('keeps the fields optional in a nested spread with @skip controlled by the argument', async () => {
      const content = await generate(/* GraphQL */ `
        query GetUser {
          user {
            ...UserFields(hide: true)
          }
        }

        fragment UserFields($hide: Boolean!) on User {
          id
          ...UserName @skip(if: $hide)
        }

        fragment UserName on User {
          name
        }
      `);

      expect(content).toContain(
        'export type GetUserQuery = { user: { id: string, name?: string } | null };',
      );
    });

    it('does not change a literal @skip that does not come from a fragment argument', async () => {
      const content = await generate(/* GraphQL */ `
        query GetUser {
          user {
            id
            name @skip(if: false)
          }
        }
      `);

      expect(content).toContain(
        'export type GetUserQuery = { user: { id: string, name?: string } | null };',
      );
    });
  });

  describe('fragment arguments used as field arguments', () => {
    it('does not change the result type', async () => {
      const content = await generate(/* GraphQL */ `
        query GetUser {
          user {
            ...UserFields(size: LARGE, filter: { status: ACTIVE })
          }
        }

        fragment UserFields($size: Size!, $filter: Filter, $first: Int = 5) on User {
          avatar(size: $size)
          friends(filter: $filter, first: $first) {
            id
          }
        }
      `);

      expect(content).toContain(
        'export type GetUserQuery = { user: { avatar: string, friends: Array<{ id: string }> } | null };',
      );
      expect(content).toContain(
        'export type UserFieldsFragment = { avatar: string, friends: Array<{ id: string }> };',
      );
    });
  });

  describe('fragment variables type', () => {
    it('generates the variables type without config when the fragment has arguments', async () => {
      const content = await generate(/* GraphQL */ `
        fragment UserFields($size: Size!, $filter: Filter, $first: Int = 5) on User {
          avatar(size: $size)
          friends(filter: $filter, first: $first) {
            id
          }
        }
      `);

      expect(content).toContain(
        [
          'export type UserFieldsFragmentVariables = Exact<{',
          '  size: Size;',
          '  filter?: Filter | null | undefined;',
          '  first?: number | null | undefined;',
          '}>;',
        ].join('\n'),
      );
    });

    it('generates the input types that only the fragment arguments use', async () => {
      const content = await generate(/* GraphQL */ `
        fragment UserFields($filter: Filter) on User {
          friends(filter: $filter) {
            id
          }
        }
      `);

      expect(content).toContain('export type Filter = {\n  status: Status;\n};');
      expect(content).toContain('export type UserFieldsFragmentVariables = Exact<{');
    });

    it('does not generate a variables type for a fragment without arguments', async () => {
      const content = await generate(/* GraphQL */ `
        fragment UserFields on User {
          id
        }
      `);

      expect(content).not.toContain('UserFieldsFragmentVariables');
    });

    it('keeps the empty variables type for a fragment without arguments with experimentalFragmentVariables', async () => {
      const content = await generate(
        /* GraphQL */ `
          fragment UserFields on User {
            id
          }
        `,
        { experimentalFragmentVariables: true },
      );

      expect(content).toContain(
        'export type UserFieldsFragmentVariables = Exact<{ [key: string]: never; }>;',
      );
    });
  });
});
