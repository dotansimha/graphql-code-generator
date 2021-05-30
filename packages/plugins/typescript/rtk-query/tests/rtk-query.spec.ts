import { plugin } from '../src/index';
import { parse, buildClientSchema } from 'graphql';
import { Types } from '@graphql-codegen/plugin-helpers';
import { resolve, join } from 'path';
import { readFileSync } from 'fs';

const githunt = resolve(__dirname, '../../../../../dev-test/githunt/');

describe('RTK Query', () => {
  let spyConsoleError: jest.SpyInstance;
  beforeEach(() => {
    spyConsoleError = jest.spyOn(console, 'warn');
    spyConsoleError.mockImplementation();
  });

  afterEach(() => {
    spyConsoleError.mockRestore();
  });

  const schema = buildClientSchema(require(join(githunt, 'schema.json')));
  const gql = {
    commentQuery: readFileSync(join(githunt, 'comment.query.graphql'), { encoding: 'utf-8' }),
    feedQuery: readFileSync(join(githunt, 'feed.query.graphql'), { encoding: 'utf-8' }),
    newEntryMutation: readFileSync(join(githunt, 'new-entry.mutation.graphql'), { encoding: 'utf-8' }),
  };

  describe('Injection', () => {
    test('Without hooks', async () => {
      const documents = parse(gql.commentQuery + gql.feedQuery + gql.newEntryMutation);
      const docs = [{ location: '', document: documents }];

      const content = (await plugin(
        schema,
        docs,
        {
          importBaseApiFrom: './baseApi',
          exportHooks: false,
        },
        {
          outputFile: 'graphql.ts',
        }
      )) as Types.ComplexPluginOutput;

      expect(content.prepend).toContain("import { api } from './baseApi';");

      expect(content.content).toMatchSnapshot();
    });
  });
  test('With hooks', async () => {
    const documents = parse(gql.commentQuery + gql.feedQuery + gql.newEntryMutation);
    const docs = [{ location: '', document: documents }];

    const content = (await plugin(
      schema,
      docs,
      {
        importBaseApiFrom: './baseApi',
        exportHooks: true,
      },
      {
        outputFile: 'graphql.ts',
      }
    )) as Types.ComplexPluginOutput;

    expect(content.prepend).toContain("import { api } from './baseApi';");

    expect(content.content).toMatchSnapshot();
  });
});
