import { renderConfigExamples, type ConfigExampleGenerate } from '../src/config-examples.js';

const schema = /* GraphQL */ `
  type Query {
    user: User
  }

  type User {
    id: ID!
    friends: [User!]!
  }
`;

const operation = /* GraphQL */ `
  query A {
    user {
      friends {
        id
      }
    }
  }
`;

describe('renderConfigExamples', () => {
  it('pairs declarations by declared name', async () => {
    const generate: ConfigExampleGenerate = ({ config }) =>
      config.compact
        ? [
            'export type A_user_friends = { id: string };',
            '',
            'export type A_user = { friends: Array<A_user_friends> };',
            '',
            'export type A = { user: A_user | null };',
            '',
            '',
            'export type AVariables = {};',
          ].join('\n')
        : [
            'export type A_user_User_friends_User = { id: string };',
            '',
            'export type A_user_User = { friends: Array<A_user_User_friends_User> };',
            '',
            'export type A_Query = { user: A_user_User | null };',
            '',
            '',
            'export type AVariables = {};',
            '',
            '',
            'export type A = A_Query;',
          ].join('\n');

    const markdown = await renderConfigExamples({
      title: 'Examples',
      generate,
      examples: [
        {
          option: 'compact',
          schema,
          operation,
          variants: [{ label: 'compact=false', config: {} }, { config: { compact: true } }],
        },
      ],
    });

    expect(markdown).toContain(
      [
        '```ts',
        'export type A_user_User_friends_User = { id: string }; // compact=false',
        'export type A_user_friends = { id: string }; // compact=true',
        '',
        'export type A_user_User = { friends: Array<A_user_User_friends_User> }; // compact=false',
        'export type A_user = { friends: Array<A_user_friends> }; // compact=true',
        '',
        'export type A_Query = { user: A_user_User | null }; // compact=false',
        '// compact=true: (not generated)',
        '',
        'export type A = A_Query; // compact=false',
        'export type A = { user: A_user | null }; // compact=true',
        '```',
      ].join('\n'),
    );
  });

  it('labels a variant with empty config and no label as default', async () => {
    const markdown = await renderConfigExamples({
      title: 'Examples',
      generate: ({ config }) => (config.strict ? 'type A = number;' : 'type A = string;'),
      examples: [
        {
          option: 'strict',
          schema,
          operation,
          variants: [{ config: {} }, { config: { strict: true } }],
        },
      ],
    });

    expect(markdown).toContain(
      ['```ts', 'type A = string; // default', 'type A = number; // strict=true', '```'].join('\n'),
    );
  });
});
