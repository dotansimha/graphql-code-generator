import path from 'path';
import { versionInfo } from 'graphql';
import { transformSync } from '@babel/core';
import { executeCodegen } from '@graphql-codegen/cli';
import babelPlugin from '../src/babel.js';
import { preset } from '../src/index.js';

/**
 * Fragment arguments are available in graphql v17 with the
 * `experimentalFragmentArguments` parser option.
 */
describe.skipIf(versionInfo.major < 17)('client-preset - fragment arguments', () => {
  const schema = /* GraphQL */ `
    type Query {
      user: User
    }

    type User {
      id: ID!
      name: String!
      avatar(size: Int!): String!
    }
  `;

  const generate = () =>
    executeCodegen({
      schema: [schema],
      documents: path.join(__dirname, 'fixtures/fragment-arguments.graphql'),
      config: { experimentalFragmentArguments: true },
      generates: {
        'out1/': {
          preset,
          presetConfig: { fragmentMasking: false },
        },
      },
    });

  const generateGraphqlFile = async () => {
    const { result } = await generate();
    return result.find(file => file.filename === 'out1/graphql.ts')?.content ?? '';
  };

  it('generates graphql.ts for an operation that spreads a fragment with arguments', async () => {
    const { result, error } = await generate();

    expect(error?.message).toBeUndefined();
    expect(result.map(file => file.filename)).toContain('out1/graphql.ts');
  });

  it('generates the fragment variables type', async () => {
    const content = await generateGraphqlFile();

    expect(content).toContain(
      [
        'export type UserFieldsFragmentVariables = Exact<{',
        '  size: number;',
        '  skipName?: boolean | null | undefined;',
        '}>;',
      ].join('\n'),
    );
  });

  it('uses the fragment variables type in the fragment document', async () => {
    const content = await generateGraphqlFile();

    expect(content).toContain(
      'as unknown as DocumentNode<UserFieldsFragment, UserFieldsFragmentVariables>;',
    );
  });

  it('keeps the spread arguments in the operation document', async () => {
    const content = await generateGraphqlFile();

    expect(content).toContain(
      '"arguments":[{"kind":"FragmentArgument","name":{"kind":"Name","value":"size"},"value":{"kind":"IntValue","value":"100"}}]',
    );
  });

  describe('babelPlugin', () => {
    it('replaces a gql() call that contains fragment arguments with an import', () => {
      const code = [
        '//@ts-ignore',
        'const UserFields = gql(`',
        '  fragment UserFields($size: Int!) on User {',
        '    avatar(size: $size)',
        '  }',
        '`);',
      ].join('\n');

      const result = transformSync(code, {
        filename: path.join(__dirname, 'fixtures/fragment-arguments.ts'),
        plugins: [[babelPlugin, { artifactDirectory: path.join(__dirname, 'fixtures') }]],
        babelrc: false,
        configFile: false,
      })?.code;

      expect(result).toContain('import { UserFieldsFragmentDoc } from "./graphql";');
      expect(result).toContain('const UserFields = UserFieldsFragmentDoc;');
    });
  });
});
