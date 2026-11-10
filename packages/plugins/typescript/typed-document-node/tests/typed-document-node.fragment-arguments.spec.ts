import { buildSchema, parse, versionInfo } from 'graphql';
import { mergeOutputs } from '@graphql-codegen/plugin-helpers';
import { DocumentMode } from '@graphql-codegen/visitor-plugin-common';
import { plugin } from '../src/index.js';

/**
 * Fragment arguments are available in graphql v17 with the
 * `experimentalFragmentArguments` parser option.
 */
describe.skipIf(versionInfo.major < 17)('TypedDocumentNode - fragment arguments', () => {
  const schema = buildSchema(/* GraphQL */ `
    type Query {
      user: User
    }

    type User {
      id: ID!
      avatar(size: Int!): String!
    }
  `);

  it('uses the fragment variables type in the fragment document without config', async () => {
    const document = parse(
      /* GraphQL */ `
        fragment UserFields($size: Int!) on User {
          avatar(size: $size)
        }
      `,
      { experimentalFragmentArguments: true } as any,
    );

    const content = mergeOutputs([await plugin(schema, [{ document }], {})]);

    expect(content).toContain(
      'as unknown as DocumentNode<UserFieldsFragment, UserFieldsFragmentVariables>;',
    );
  });

  it('keeps the spread arguments in the operation document', async () => {
    const document = parse(
      /* GraphQL */ `
        query GetUser {
          user {
            ...UserFields(size: 100)
          }
        }

        fragment UserFields($size: Int!) on User {
          avatar(size: $size)
        }
      `,
      { experimentalFragmentArguments: true } as any,
    );

    const content = mergeOutputs([await plugin(schema, [{ document }], {})]);

    expect(content).toContain(
      '"arguments":[{"kind":"FragmentArgument","name":{"kind":"Name","value":"size"},"value":{"kind":"IntValue","value":"100"}}]',
    );
  });

  it('keeps the spread arguments in a string document', async () => {
    const document = parse(
      /* GraphQL */ `
        query GetUser {
          user {
            ...UserFields(size: 100)
          }
        }

        fragment UserFields($size: Int!) on User {
          avatar(size: $size)
        }
      `,
      { experimentalFragmentArguments: true } as any,
    );

    const content = mergeOutputs([
      await plugin(schema, [{ document }], { documentMode: DocumentMode.string }),
    ]);

    expect(content).toContain('...UserFields(size: 100)');
  });

  it('keeps unknown as the variables type for a fragment without arguments', async () => {
    const document = parse(
      /* GraphQL */ `
        fragment UserFields on User {
          id
        }
      `,
      { experimentalFragmentArguments: true } as any,
    );

    const content = mergeOutputs([await plugin(schema, [{ document }], {})]);

    expect(content).toContain('as unknown as DocumentNode<UserFieldsFragment, unknown>;');
  });
});
